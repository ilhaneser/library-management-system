const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');  
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const uploadsPath = path.join(__dirname, 'uploads');


// Create upload directories if they don't exist
const coverDir = path.join(__dirname, 'uploads/covers');
const pdfDir = path.join(__dirname, 'uploads/pdfs');

if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true });
  console.log('Created covers directory');
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
  console.log('Created PDFs directory');
}

process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log('Full error:', err);
});

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const bookRoutes = require('./routes/book.routes');
const userRoutes = require('./routes/user.routes');
const loanRoutes = require('./routes/loan.routes');
const uploadRoutes = require('./routes/upload.routes');  // Add new upload routes

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  debug: true // Enable debugging for troubleshooting
}));

// Check if upload directories are writable
try {
  fs.accessSync(coverDir, fs.constants.W_OK);
  fs.accessSync(pdfDir, fs.constants.W_OK);
  console.log('Upload directories are writable');
} catch (error) {
  console.error('ERROR: Upload directories are not writable!', error);
}

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// IMPROVED: Serve static files from uploads directory with better configuration
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set appropriate cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Set the correct content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Direct route to serve files from uploads (backup in case static serving fails)
app.get('/direct-file/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', type, filename);
  
  console.log(`Direct file request for: ${type}/${filename}`);
  console.log(`Looking for file at: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  res.status(404).send('File not found');
});

// Image proxy route to handle various image path formats
app.get('/image-proxy/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', type, filename);
  
  console.log(`Image proxy request for: ${type}/${filename}`);
  console.log(`Looking for file at: ${filePath}`);
  console.log(`File exists check: ${fs.existsSync(filePath)}`);
  
  if (fs.existsSync(filePath)) {
    // If file exists, set appropriate headers and send it
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    } else if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Send the file
    return res.sendFile(filePath);
  } else {
    // If file doesn't exist, try to find any image in the directory
    const dirPath = path.join(__dirname, 'uploads', type);
    
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        if (files.length > 0) {
          console.log(`File not found, but found ${files.length} other files in directory`);
          console.log(`Available files: ${files.join(', ')}`);
          
          // Try to find a similarly named file
          const similarFile = files.find(f => f.includes('cover_'));
          if (similarFile) {
            console.log(`Serving similar file instead: ${similarFile}`);
            
            // Set appropriate content type
            const ext = path.extname(similarFile).toLowerCase();
            if (ext === '.jpg' || ext === '.jpeg') {
              res.setHeader('Content-Type', 'image/jpeg');
            } else if (ext === '.png') {
              res.setHeader('Content-Type', 'image/png');
            } else if (ext === '.gif') {
              res.setHeader('Content-Type', 'image/gif');
            }
            
            return res.sendFile(path.join(dirPath, similarFile));
          }
        }
      } catch (err) {
        console.error(`Error reading directory: ${err.message}`);
      }
    }
    
    // If we can't find a similar file, return 404
    res.status(404).send('Image not found');
  }
});

// Debug route to list files in uploads directories
app.get('/debug/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const coversDir = path.join(uploadsDir, 'covers');
  const pdfsDir = path.join(uploadsDir, 'pdfs');
  
  try {
    // Get list of all files in directories
    const files = {
      uploadsPath: uploadsDir,
      coversPath: coversDir,
      pdfsPath: pdfsDir
    };
    
    if (fs.existsSync(uploadsDir)) {
      files.uploadsContents = fs.readdirSync(uploadsDir);
    } else {
      files.uploadsContents = 'Directory does not exist';
    }
    
    if (fs.existsSync(coversDir)) {
      files.coversContents = fs.readdirSync(coversDir);
    } else {
      files.coversContents = 'Directory does not exist';
    }
    
    if (fs.existsSync(pdfsDir)) {
      files.pdfsContents = fs.readdirSync(pdfsDir);
    } else {
      files.pdfsContents = 'Directory does not exist';
    }
    
    // Add file stats for each cover image
    if (Array.isArray(files.coversContents)) {
      files.coverDetails = files.coversContents.map(filename => {
        try {
          const filePath = path.join(coversDir, filename);
          const stats = fs.statSync(filePath);
          return {
            filename,
            size: stats.size,
            created: stats.birthtime,
            path: filePath,
            exists: fs.existsSync(filePath)
          };
        } catch (err) {
          return { filename, error: err.message };
        }
      });
    }
    
    res.json(files);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

app.get('/debug/list-uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  const coversPath = path.join(uploadsPath, 'covers');
  
  try {
    console.log('Checking uploads directory:', uploadsPath);
    const allFiles = [];
    
    // List files in main uploads directory
    if (fs.existsSync(uploadsPath)) {
      const mainFiles = fs.readdirSync(uploadsPath);
      console.log('Files in uploads:', mainFiles);
      allFiles.push(...mainFiles.map(f => `/uploads/${f}`));
    }
    
    // List files in covers subdirectory
    if (fs.existsSync(coversPath)) {
      const coverFiles = fs.readdirSync(coversPath);
      console.log('Files in covers:', coverFiles);
      allFiles.push(...coverFiles.map(f => `/uploads/covers/${f}`));
    }
    
    res.json({
      uploadsPath,
      coversPath,
      files: allFiles
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

// Mount routers
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/upload', uploadRoutes);  // Add new upload routes

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Detailed server error:', err);
  console.error(err.stack.red);
  
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});