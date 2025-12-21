import { v2 as cloudinary } from 'cloudinary'
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API, 
  api_secret: process.env.CLOUDINARY_SECRET
});

const uploadImage = async (imagePath) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,        // Use original filename
      // unique_filename: false,    Prevent Cloudinary from appending random characters
      overwrite: true,           // Allow replacing existing file with same name
      resource_type: "auto"      // Auto-detect type (image, video, etc.)

    };

    try {

      if(!imagePath) return null;
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
      console.log(result);
      console.log("file upload successfully :- ",result.url )
      return result.public_id;

    } catch (error) {
       console.error(error);
       fs.unlinkSync(imagePath) // remove the locally saved temporary file when unable to upload
    }
};

export { uploadImage }