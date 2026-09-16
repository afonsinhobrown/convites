import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dmpj3nakp",
  api_key: process.env.CLOUDINARY_API_KEY || "324171751164322",
  api_secret: process.env.CLOUDINARY_API_SECRET || "DLWPH-pbWLkz9Pg52cHZTVt3_TM",
  secure: true,
});

export { cloudinary };

export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  folder: string = "templates",
  publicId?: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        transformation: [
          { quality: "auto:best" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Erro desconhecido no upload para Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
}
