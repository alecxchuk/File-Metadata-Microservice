var express = require('express');
var cors = require('cors');
require('dotenv').config()
var app = express();
const multer = require('multer');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const uri = process.env.MONGO_URI;
const path = require('path');

//Configuration for Multer
//const upload = multer({ dest: "public/" });
const helpers = require('./helpers');

mongoose.connect(
  uri, 
    { useNewUrlParser: true, useUnifiedTopology: true });

// Creating a Schema for uploaded files
const fileSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Uploaded file must have a name"],
    },
    type: {
      type: String
    },
    size: {
      type: String
    }
});

// Creating a Model from that Schema
const File = mongoose.model("File", fileSchema);

//Configuration for Multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Configuration for Multer
/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});*/

// Multer Filter for only pdf files
/*const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};*/

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//let upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// API endpoint for uploading file
app.post('/api/fileanalyse', /*upload.single("upfile"),*/ async (req, res) => {
 
    // 'Validate files
    let upload = multer({ storage: storage/*, fileFilter: helpers.imageFilter*/ }).single('upfile');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        
      res.json({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      });
    });
  
  /*try {
  const newFile = await File.create({
    name: req.file.originalname,
  });
    console.log(res.status)
  res.status(200).json({
    status: "success",
    message: "File created successfully!!",
  });
} catch (error) {
  res.json({
    error,
  });
}*/
 
})

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
