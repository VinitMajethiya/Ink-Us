/**
 * Cloudinary Unsigned Upload Helper
 * Handles uploading photos directly from the client with progress tracking.
 */

export const uploadToCloudinary = (file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  return new Promise((resolve, reject) => {
    if (!cloudName || !uploadPreset) {
      return reject(new Error("Cloudinary configuration missing. Please check your .env file."));
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "ink_and_us");

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        if (onProgress) onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error("Cloudinary upload failed: " + xhr.statusText));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload error."));
    xhr.send(formData);
  });
};
