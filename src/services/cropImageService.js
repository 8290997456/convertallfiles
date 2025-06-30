import sharp from 'sharp';

export default async function cropImageService({
  inputPath,
  outputPath,
  width,
  height,
  ext,
  transparent,
}) {
  if (ext === 'svg') {
    throw new Error('❌ SVG cropping is not supported.');
  }

  await sharp(inputPath)
    .resize(width, height, {
      fit: 'contain',
      background: transparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFormat(ext, { quality: 100 })
    .toFile(outputPath);
}
