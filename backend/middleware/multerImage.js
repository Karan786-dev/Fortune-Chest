var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "../images");
  },
  filename: function (request, file, callback) {
    callback(null, file.originalname);
  },
});
module.exports = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return console.log("Only .png, .jpg and .jpeg format allowed!");
    }
  },
});
