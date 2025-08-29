require('dotenv').config(); 

const db = require('../database');
const { enhanceImage } = require('../services/imageService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// List Images (with Extended API Features)
exports.listImages = (req, res) => {
    const userId = req.user.id;
    const { status, sortBy = 'createdAt', order = 'DESC', page = 1, limit = 10 } = req.query;

    let query = "SELECT * FROM images WHERE userId = ?";
    let params = [userId];

    if (status) {
        query += " AND status = ?";
        params.push(status);
    }

    query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
};

// Upload Image
exports.uploadImage = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { filename } = req.file;
    const userId = req.user.id;

    db.run(
        "INSERT INTO images (userId, originalFilename) VALUES (?, ?)",
        [userId, filename],
        function (err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(201).json({ id: this.lastID, filename });
        }
    );
};

// Trigger Enhancement
exports.triggerEnhancement = (req, res) => {
    const imageId = req.params.id;
    const userId = req.user.id;

    db.get("SELECT * FROM images WHERE id = ? AND userId = ?", [imageId, userId], async (err, image) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!image) return res.status(404).json({ message: "Image not found" });

        res.status(202).json({ message: `Enhancement started for ${image.originalFilename}.` });

        // Run CPU-intensive task asynchronously
        try {
            const processedFilename = await enhanceImage(image.originalFilename);
            db.run(
                "UPDATE images SET status = 'processed', processedFilename = ? WHERE id = ?",
                [processedFilename, imageId]
            );
        } catch (error) {
            db.run("UPDATE images SET status = 'failed' WHERE id = ?", [imageId]);
            console.error(`Failed to process image ID ${imageId}`);
        }
    });
};

// Get Image Details
exports.getImageDetails = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM images WHERE id = ?", [id], (err, row) => {
        if (!row) return res.status(404).json({ message: "Image not found" });
        // Check permissions
        if (req.user.role !== 'admin' && row.userId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.json(row);
    });
};

// Download Processed Image
exports.downloadImage = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM images WHERE id = ?", [id], (err, row) => {
        if (!row || row.status !== 'processed') {
            return res.status(404).json({ message: "Processed image not found" });
        }
        if (req.user.role !== 'admin' && row.userId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const filePath = path.join(__dirname, '..', '..', 'processed', row.processedFilename);
        res.download(filePath);
    });
};


// Delete Image
exports.deleteImage = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM images WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!row) return res.status(404).json({ message: "Image not found" });

        // Admin can delete any image, regular users can only delete their own
        if (req.user.role !== 'admin' && row.userId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own images." });
        }

        // Delete files from filesystem
        try {
            if (row.originalFilename) fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', row.originalFilename));
            if (row.processedFilename) fs.unlinkSync(path.join(__dirname, '..', '..', 'processed', row.processedFilename));
        } catch (fileErr) {
            console.error("Error deleting image files:", fileErr.message);
        }

        db.run("DELETE FROM images WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ message: "Database error during deletion" });
            res.status(200).json({ message: "Image deleted successfully" });
        });
    });
};


// Fetch from Unsplash (External API)
exports.fetchFromUnsplash = async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query term is required" });

    try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: { query },
            headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
        });

        const imageUrl = response.data.urls.regular;
        const imageResponse = await axios({ url: imageUrl, responseType: 'stream' });

        const filename = `unsplash-${Date.now()}.jpg`;
        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
        const writer = fs.createWriteStream(filePath);

        imageResponse.data.pipe(writer);

        writer.on('finish', () => {
            db.run(
                "INSERT INTO images (userId, originalFilename) VALUES (?, ?)",
                [req.user.id, filename],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Database error' });
                    res.status(201).json({ id: this.lastID, filename, message: 'Image fetched from Unsplash and saved.' });
                }
            );
        });

        writer.on('error', () => res.status(500).json({ message: 'Failed to save image from Unsplash' }));

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch image from Unsplash', error: error.message });
    }
};