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
 * Extract Cloudinary public_id from a Cloudinary URL or return the publicId as-is
 * @param {string} urlOrPublicId
 * @returns {string|null}
 */
export const extractCloudinaryPublicId = (urlOrPublicId) => {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") return null;

  // If it's already a public_id (not a full HTTP/HTTPS URL)
  if (!urlOrPublicId.startsWith("http://") && !urlOrPublicId.startsWith("https://")) {
    return urlOrPublicId;
  }

  try {
    const uploadIndex = urlOrPublicId.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let path = urlOrPublicId.substring(uploadIndex + 8); // string after "/upload/"

    // Handle transformations or version numbers (e.g. "v1712345678/folder/file.jpg")
    const parts = path.split("/");
    if (parts[0] && /^v\d+$/.test(parts[0])) {
      parts.shift(); // Remove version segment
    }
    path = parts.join("/");

    // Remove file extension (.jpg, .png, .webp, etc.)
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }

    return path;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

/**
 * Delete image from Cloudinary using public_id or full Cloudinary URL
 * @param {string} publicIdOrUrl - Cloudinary image public_id or image URL
 * @returns {object|null} Cloudinary deletion response
 */
export const deleteFromCloudinary = async (publicIdOrUrl) => {
  try {
    if (!publicIdOrUrl) return null;
    const publicId = extractCloudinaryPublicId(publicIdOrUrl);
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
