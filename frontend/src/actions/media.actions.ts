'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileBase64: string, folder: string = 'general') {
  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: `workos/${folder}`,
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(error.message || 'Lỗi khi upload ảnh lên Cloudinary');
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    // Bóc tách public_id từ URL (Ví dụ: .../workos/avatars/xyz.jpg -> workos/avatars/xyz)
    const parts = imageUrl.split('/');
    const fileNameWithExt = parts[parts.length - 1];
    const fileName = fileNameWithExt.split('.')[0];
    
    // Tìm thư mục (folder) trong URL
    const folderIndex = parts.findIndex(p => p === 'workos');
    const publicId = parts.slice(folderIndex).join('/').split('.')[0];

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    return { error: error.message };
  }
}
