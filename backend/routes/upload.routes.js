const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Upload cover image route
router.post('/cover', async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.files || !req.files.coverImage) {
      return res.status(400).json({
        success: false,
        error: 'No cover image uploaded'
      });
    }

    const coverImage = req.files.coverImage;
    
    // Log the upload details
    console.log('Cover image details:', {
      name: coverImage.name,
      size: coverImage.size,
      mimetype: coverImage.mimetype
    });

    // Generate a cleaner filename - Option 1: Use the original filename (cleaned)
    let filename = coverImage.name.replace(/\s+/g, '-').toLowerCase();
    
    // Set the upload path
    const uploadPath = path.join(__dirname, '../uploads/covers', filename);
    
    // Move the file to the upload directory
    await coverImage.mv(uploadPath);
    console.log(`Cover image saved to ${uploadPath}`);
    
    // Return success with file path that will be stored in the database
    res.status(200).json({
      success: true,
      filePath: `/uploads/covers/${filename}`
    });
    
  } catch (err) {
    console.error('Error uploading cover image:', err);
    res.status(500).json({
      success: false,
      error: 'Error uploading cover image'
    });
  }
});

// Upload PDF file route
router.post('/pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const pdfFile = req.files.pdfFile;
    console.log('PDF file details:', {
      name: pdfFile.name,
      size: pdfFile.size,
      mimetype: pdfFile.mimetype
    });

    // Use the same approach as cover images - clean the original filename
    let filename = pdfFile.name.replace(/\s+/g, '-').toLowerCase();
    const uploadPath = path.join(__dirname, '../uploads/pdfs', filename);

    await pdfFile.mv(uploadPath);
    console.log(`PDF file saved to ${uploadPath}`);

    res.status(200).json({
      success: true,
      filePath: `/uploads/pdfs/${filename}`
    });
  } catch (err) {
    console.error('Error uploading PDF:', err);
    res.status(500).json({
      success: false,
      error: 'Error uploading PDF'
    });
  }
});

module.exports = router;