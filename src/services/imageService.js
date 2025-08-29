const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const processedDir = path.join(__dirname, '..', '..', 'processed');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);

exports.enhanceImage = async (inputFilename) => {
    const inputPath = path.join(uploadsDir, inputFilename);
    const outputFilename = `enhanced-${Date.now()}-${inputFilename}`;
    const outputPath = path.join(processedDir, outputFilename);

    try {
        console.log(`Starting enhancement for ${inputFilename}...`);
        
        await sharp(inputPath)
            // 1. Resize to a large dimension (4K-ish) using a complex algorithm
            .resize(3840, 2160, {
                kernel: sharp.kernel.lanczos3,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            // 2. Apply sharpening to increase computational load
            .sharpen({
                sigma: 2,
                m1: 1,
                m2: 3,
                x1: 2,
                y2: 10,
                y3: 20
            })
            // 3. Composite a watermark (another operation)
            .composite([{
                input: Buffer.from('<svg><text x="20" y="40" font-size="30" fill="white" opacity="0.5">CAB432 Enhanced</text></svg>'),
                gravity: 'southeast',
            }])
            // 4. Convert to a specific format
            .toFormat('jpeg', { quality: 90 })
            // 5. Save the file
            .toFile(outputPath);

        console.log(`Enhancement finished. Output: ${outputFilename}`);
        return outputFilename;

    } catch (error) {
        console.error('Error during image enhancement:', error);
        throw error;
    }
};