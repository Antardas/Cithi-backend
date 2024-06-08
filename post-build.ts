import fs from 'node:fs';
import path from 'node:path';
const ejsRootPath = `${__dirname}/src/shared/services/emails`;
fs.readdirSync(ejsRootPath).forEach((folderOrFileName) => {
  const currentFolderPath = path.join(ejsRootPath, folderOrFileName);
  // console.log(currentFolderPath);
  const isFile = fs.statSync(currentFolderPath).isFile();

  if (!isFile) {
    fs.readdirSync(currentFolderPath).forEach((data) => {
      const currentFilePath = path.join(currentFolderPath, data);

      if (fs.statSync(currentFilePath).isFile() && path.extname(currentFilePath) === '.ejs') {
        // console.log(currentFilePath);
        const destPath = path.join(process.cwd(), 'build/shared/services/emails', folderOrFileName, data);
        console.log(currentFilePath, '->', destPath);
        fs.copyFileSync(currentFilePath, destPath);
      }
    });
  }
});
