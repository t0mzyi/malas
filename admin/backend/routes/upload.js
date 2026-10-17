const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { requireAuth } = require('../middleware/auth');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'jfxqts4x',
  api_key: process.env.CLOUDINARY_API_KEY || '872827862522122',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LLSp75tA57bVwQ_5hIWoXdANPJE'
});

/**
 * POST /api/upload
 * Securely uploads image data (base64 or remote URL) to Cloudinary via backend
 */
router.post('/', requireAuth, async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, error: 'No image data provided.' });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'malas_products',
      resource_type: 'image'
    });

    return res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Backend Cloudinary upload error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to upload image to Cloudinary.'
    });
  }
});

module.exports = router;
