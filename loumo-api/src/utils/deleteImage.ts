import fs from "fs";
import path from "path";

const deleteImage = (relativePath: string) => {
  const fullPath = path.join(__dirname, "..", relativePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error("❌ Failed to delete image:", err);
    } else {
      console.log("✅ Image deleted:", fullPath);
    }
  });
};

export default deleteImage;
