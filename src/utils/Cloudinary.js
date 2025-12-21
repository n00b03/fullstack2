import { v2 as cloudinary } from 'cloudinary'
import fs from "fs";

// Configure cloudinary when needed (after dotenv loads)
const configureCloudinary = () => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_SECRET
  });
};

const uploadImage = async (imagePath) => {

    // Configure cloudinary before upload
    configureCloudinary();

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,        // Use original filename
      // unique_filename: false,    Prevent Cloudinary from appending random characters
      overwrite: true,           // Allow replacing existing file with same name
      resource_type: "auto"      // Auto-detect type (image, video, etc.)

    };

    try {

      if(!imagePath){
        throw new Error("Image path is required for upload");
      };
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
      fs.unlinkSync(imagePath); // remove the locally saved temporary file after upload
      return result; // Return the URL of the uploaded image

    } catch (error) {
       console.error("Upload error:", error.message);
       if(fs.existsSync(imagePath)) {
         fs.unlinkSync(imagePath); // remove the locally saved temporary file when unable to upload
       }
       throw error; // Re-throw error so caller knows upload failed
    }
};

export { uploadImage }