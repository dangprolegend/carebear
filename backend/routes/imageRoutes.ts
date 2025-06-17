//@ts-nocheck
import express, { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import User from '../models/User';

const router: Router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const uploadProfileImage = async (req: any, res: any) => {
  try {
    const { userID } = req.params;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_images', 
          public_id: `user_${userID}_${Date.now()}`, 
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Resize and crop to square
            { quality: 'auto', fetch_format: 'auto' } // Optimize quality and format
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    if (user.imageURL && user.imageURL.includes('cloudinary.com')) {
      try {
        // Extract public ID from the old image URL
        const urlParts = user.imageURL.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const oldPublicId = `profile_images/${publicIdWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(oldPublicId);
        console.log('Old image deleted from Cloudinary');
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Update user's imageURL in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { imageURL: uploadResult.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      imageURL: uploadResult.secure_url,
      user: {
        id: updatedUser._id,
        imageURL: updatedUser.imageURL,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);

    // Handle specific Cloudinary errors
    if (error.http_code) {
      return res.status(400).json({
        success: false,
        message: 'Image upload failed',
        error: error.message
      });
    }

    // Handle Multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

router.post('/:userID/upload-image', upload.single('image'), uploadProfileImage);

export default router;