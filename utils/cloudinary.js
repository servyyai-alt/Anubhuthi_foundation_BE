const crypto = require('crypto');
const { Blob } = require('buffer');

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'anubhuthi/programs',
  };
}

function buildSignature(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

async function uploadImageBuffer(buffer, fileName, mimeType) {
  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration is missing on the server.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ folder, timestamp }, apiSecret);
  const formData = new FormData();

  formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed.');
  }

  return {
    publicId: data.public_id,
    url: data.secure_url,
  };
}

module.exports = { uploadImageBuffer };
