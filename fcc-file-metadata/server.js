var express = require('express');
var multer  = require('multer');
var upload  = multer({ dest: 'uploads/' }); 
var cors    = require('cors');
var path    = require('path');
var app     = express();

// Middlewares
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

//https://www.npmjs.com/package/multer
//https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088

// Set storage 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/fileanalyse', upload.single('upfile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    // Output json to client
    res.json({
        name: file.originalname,
        type: file.mimetype,
        size: file.size
    });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});