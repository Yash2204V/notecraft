const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Disk Storage -- storing on server
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12, (err, name)=>{
        const fn = name.toString("hex") + path.extname(file.originalname);
        cb(null, fn);
      })
    }
  })
const upload = multer({ storage: storage });

// export upload variable
module.exports = upload;
  