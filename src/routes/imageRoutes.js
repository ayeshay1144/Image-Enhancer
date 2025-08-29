const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// All routes are protected
router.use(protect);

// Route definitions
router.route('/')
    .get(imageController.listImages)
    .post(upload.single('image'), imageController.uploadImage);
    
router.post('/fetch-unsplash', imageController.fetchFromUnsplash);

router.route('/:id')
    .get(imageController.getImageDetails)
    .delete(imageController.deleteImage);

router.post('/:id/enhance', imageController.triggerEnhancement);
router.get('/:id/download', imageController.downloadImage);

module.exports = router;