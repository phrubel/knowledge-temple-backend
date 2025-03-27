const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: "dbbce9j2m",
  api_key: "114495734349365",
  api_secret: "NkCPdNQ8I8nMtvMxOuPQ5MQLUgI",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "certificates",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `certificate_${Date.now()}`,
  },
});

const upload = multer({ storage });

module.exports = upload;
