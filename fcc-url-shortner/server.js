var express     = require('express');
var cors        = require('cors');
var bodyParser  = require('body-parser');
var dns         = require('dns');
var url         = require('url');
var path        = require('path');
require('dotenv').config();
var mongoose    = require('mongoose');

var app         = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(path.join(__dirname, 'public')));

// This project needs a db 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

// Define schema
var Schema = mongoose.Schema;
var urlSchema = new Schema({
    original_url: String,
    short_url: Number
});

// Compile model from schema
var urlModel = mongoose.model('urlModel', urlSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/shorturl/new', (req, res) => {
    console.log(req.body);
    var reqUrl = req.body.url;

    // Check if url was posted
    if (reqUrl === '') {
        res.send('Hint: You posted nothing, please post a valid url');
    }
    else {
        // Check if url already exists in db
        urlModel.findOne({ original_url: reqUrl }, (err, data) => {
            if (err) {
                res.send("Error while searching for file");
            }
            else if (data) {
                console.log(data);
                res.json({
                    original_url: data.original_url,
                    short_url: data.short_url
                });
            }
            else {
                // Not in db, so need to create one
                var urlObj = url.parse(reqUrl);
                var postedUrl = urlObj.protocol ? urlObj.host : urlObj.pathname;

                // Check if url is valid, if true => create, save to db and return json.
                dns.lookup(postedUrl, (err, address, family) => {
                    console.log("address: %j  family: IPv%s", address, family);
                    if (err) {
                        console.log(err);
                        res.json({ error: "invalid URL" });
                    }
                    else {
                        // Generate random url id
                        var id = Math.floor(Math.random() * 10000);
                         
                        var data = new urlModel({
                            original_url: reqUrl,
                            short_url: id
                        });
                        data.save((err, data) => {
                            if (err) {
                                res.send('Error saving to database!');
                            }
                            console.log('Saved successfully!');
                        });
                        res.json({
                            original_url: data.original_url,
                            short_url: data.short_url
                        });
                    }
                });
            }
        });
    }
});

app.get('/api/shorturl/:new', (req, res) => {
    var short = req.params.new;

    // Check if input is a number
    if (isNaN(short)) {
        res.json({ error: "Wrong Format" });
    }
    // Search db for document
    urlModel.findOne({ short_url: short }, (err, data) => {
        if (err) {
            throw err;
            res.send("Error while search for document");
        }
        // Redirect to url
        res.redirect(data.original_url);
    });
});

app.listen(3000, () => `Server is listening`);