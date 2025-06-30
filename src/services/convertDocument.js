// src/services/convertDocument.js
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs/promises';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function convertDocument(inputPath, format, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });

  const command = `libreoffice --headless --convert-to ${format} --outdir ${outputDir} "${inputPath}"`;
  await execPromise(command);

  // Find the most recent file with the correct extension
  const files = await fs.readdir(outputDir);
  const matchingFiles = files.filter(f => f.endsWith(`.${format}`));
  if (!matchingFiles.length) throw new Error('Converted file not found');

  // Return the full path of the latest converted file
  const latestFile = matchingFiles
    .map(file => ({
      file,
      time: fs.stat(path.join(outputDir, file)).then(stat => stat.mtimeMs),
    }));

  const resolved = await Promise.all(latestFile);
  const mostRecent = resolved.sort((a, b) => b.time - a.time)[0];

  return path.join(outputDir, mostRecent.file);
}
