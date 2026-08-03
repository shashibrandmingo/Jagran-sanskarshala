import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/**
 * Get configured Cloudinary instance (lazy init to avoid ESM + dotenv race condition)
 */
const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

/**
 * Upload local file to Cloudinary
 * @param {string} localFilePath - Path of the file saved temporarily on server
 * @param {string} folder - Cloudinary target folder name
 * @returns {object|null} Cloudinary response object with url and public_id
 */
export const uploadOnCloudinary = async (localFilePath, folder = "jagran_gallery") => {
  try {
    if (!localFilePath) return null;

    const cld = getCloudinary();

    // Upload file on cloudinary
    const response = await cld.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    // File uploaded successfully, remove local temp file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);
    // Remove local file if upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

/**
 * Delete image from Cloudinary using public_id
 * @param {string} publicId - Cloudinary image public_id
 * @returns {object|null} Cloudinary deletion response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const cld = getCloudinary();
    const response = await cld.uploader.destroy(publicId);
    console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary Delete Error:", error.message);
    return null;
  }
};
