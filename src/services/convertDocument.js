import path from 'path';
import { exec } from 'child_process';
import fs from 'fs/promises';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function convertDocument(inputPath, format, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });

  // ✅ Silent + clean command
  const command = `libreoffice --headless --nologo --nodefault --nofirststartwizard --nolockcheck --convert-to ${format} --outdir "${outputDir}" "${inputPath}" 2>/dev/null`;

  try {
    await execPromise(command);
  } catch (error) {
    console.error('❌ LibreOffice conversion error:', error);
    throw new Error('Failed to convert file using LibreOffice');
  }

  const files = await fs.readdir(outputDir);
  const matchingFiles = files.filter(f => f.endsWith(`.${format}`));

  if (!matchingFiles.length) throw new Error('Converted file not found');

  const fileWithTimes = await Promise.all(
    matchingFiles.map(async (file) => {
      const stat = await fs.stat(path.join(outputDir, file));
      return { file, time: stat.mtimeMs };
    })
  );

  const mostRecent = fileWithTimes.sort((a, b) => b.time - a.time)[0];
  return path.join(outputDir, mostRecent.file);
}
