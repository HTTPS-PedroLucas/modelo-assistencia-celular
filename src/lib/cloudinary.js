const cloudinary = require('cloudinary').v2;
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

function configurar() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary não configurado. Defina CLOUDINARY_URL ou CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

async function uploadLocal(buffer, { nome = 'imagem' } = {}) {
  const pasta = path.join(__dirname, '..', '..', 'public', 'uploads');
  await fs.mkdir(pasta, { recursive: true });

  const base = String(nome).replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'imagem';
  const arquivo = `${base}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.webp`;
  await fs.writeFile(path.join(pasta, arquivo), buffer, { flag: 'wx' });

  return {
    url: `/uploads/${encodeURIComponent(arquivo)}`,
    tamanho: buffer.length,
    publicId: `local/${arquivo}`
  };
}

function uploadBuffer(buffer, { nome = 'imagem' } = {}) {
  // A prévia local não possui credenciais do Cloudinary. Neste modo, o arquivo
  // precisa existir de verdade em /public/uploads para a miniatura e a vitrine
  // conseguirem carregá-lo depois do envio.
  const cloudinaryConfigurado = Boolean(
    process.env.CLOUDINARY_URL
    || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
  const desenvolvimentoSemCloudinary = !process.env.NODE_ENV && !cloudinaryConfigurado;

  if (String(process.env.LOCAL_UPLOADS).toLowerCase() === 'true' || desenvolvimentoSemCloudinary) {
    return uploadLocal(buffer, { nome });
  }

  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve({
      url: `https://res.cloudinary.com/test/image/upload/suacell/${encodeURIComponent(nome)}.webp`,
      tamanho: buffer.length,
      publicId: `suacell/${nome}`
    });
  }

  configurar();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'suacell',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        filename_override: nome,
        overwrite: false
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, tamanho: result.bytes, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
