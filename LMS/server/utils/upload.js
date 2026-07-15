const fs = require("fs");
const path = require("path");

const getUploadDir = () => {
  if (process.env.VERCEL) {
    return path.join("/tmp", "lms-uploads");
  }

  return path.join(__dirname, "..", "uploads");
};

const ensureUploadDir = () => {
  const uploadDir = getUploadDir();

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
};

const getUploadFilePath = (filename) => path.join(getUploadDir(), filename);

module.exports = {
  getUploadDir,
  ensureUploadDir,
  getUploadFilePath,
};
