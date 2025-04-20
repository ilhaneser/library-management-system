const path = require('path');
const fs = require('fs');

// Helper function to ensure upload directory exists
const ensureUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '../uploads', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created ${dir} directory`);
  }
  return uploadDir;
};

// @desc    Upload book cover image
// @route   POST /api/upload/cover
// @access  Private (Admin/Librarian)
exports.uploadCover = async (req, res) => {
  try {
    console.log('Cover upload request received', req.files);
    
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.coverImage) {
      console.log('No cover image uploaded');
      return res.status(400).json({
        success: false,
        error: 'No cover image uploaded'
      });
    }

    const coverImage = req.files.coverImage;
    console.log('Cover image details:', {
      name: coverImage.name,
      size: coverImage.size,
      mimetype: coverImage.mimetype
    });
    
    // Check file type
    if (!coverImage.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }
    
    // Check file size (max 5MB)
    if (coverImage.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image size should be less than 5MB'
      });
    }

    // Create custom filename
    const fileExt = path.extname(coverImage.name);
    const fileName = `cover_${Date.now()}${fileExt}`;
    
    // Ensure upload directory exists
    const uploadDir = ensureUploadDir('covers');
    
    // Move file to upload directory
    await coverImage.mv(path.join(uploadDir, fileName));
    console.log(`Cover image saved to ${path.join(uploadDir, fileName)}`);
    
    // Return the file path
    res.status(200).json({
      success: true,
      filePath: `/uploads/covers/${fileName}`
    });
  } catch (error) {
    console.error('Error uploading cover:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading cover image: ' + error.message
    });
  }
};

// @desc    Upload book PDF file
// @route   POST /api/upload/pdf
// @access  Private (Admin/Librarian)
exports.uploadPdf = async (req, res) => {
  try {
    console.log('PDF upload request received', req.files);
    
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.pdfFile) {
      console.log('No PDF file uploaded');
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
    
    // Check file type
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file'
      });
    }
    
    // Check file size (max 50MB)
    if (pdfFile.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'PDF size should be less than 50MB'
      });
    }

    // Create custom filename
    const fileName = `book_${Date.now()}.pdf`;
    
    // Ensure upload directory exists
    const uploadDir = ensureUploadDir('pdfs');
    
    // Move file to upload directory
    await pdfFile.mv(path.join(uploadDir, fileName));
    console.log(`PDF file saved to ${path.join(uploadDir, fileName)}`);
    
    // Return the file path
    res.status(200).json({
      success: true,
      filePath: `/uploads/pdfs/${fileName}`
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading PDF file: ' + error.message
    });
  }
};