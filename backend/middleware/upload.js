const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

//Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "misc";

    if (file.fieldname === "image") {
      folder = "profile_pics"; // profile upload
    } else if (file.fieldname === "document") {
      folder = "volunteer_documents"; // KYC / docs
    }

    return {
      folder,
      resource_type: "auto",
    };
  },
});

//File filter (backend safety)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, PDF allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;