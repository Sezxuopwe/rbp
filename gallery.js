const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async () => {
  try {
    const result = await cloudinary.search
      .expression('folder:rbp-gallery')
      .sort_by('created_at', 'desc')
      .execute();

    const images = result.resources.map(r => ({
      url: r.secure_url,
      alt: r.public_id,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(images),
    };
  } catch (err) {
    console.log('ERROR:', err.message); // เพิ่มบรรทัดนี้
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: err.message, stack: err.stack }) 
    };
  }
};
