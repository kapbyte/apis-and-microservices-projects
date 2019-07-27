var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config();
var mongoose = require('mongoose');
var app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(path.join(__dirname, 'public')));

// This project needs a db 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

// Define schema
var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: String,
    user_id: String,
    description: String,
    duration: Number,
    date: Date
});

// Compile model from schema
var registrantModel = mongoose.model('registrantModel', userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/exercise/new-user', (req, res) => {
    var username = req.body.username;

    // Error checks
    if (username === '') {
        res.send(`Path \`username\` is required.`);
    }
    else {
        if (username.length > 20) {
            res.send('username too long');
        }
        else {
            // Does username exist in db?
            registrantModel.findOne({ username: username }, (err, data) => {
                if (err) {
                    res.send("Error occurred while searching for file");
                }
                else if (data) {
                    res.send('username already taken');
                }
                else {
                    var data = new registrantModel({
                        username: username,
                        user_id: "",
                        description: "",
                        duration: 0,
                        date: new Date()
                    });

                    // Update my user_id
                    data.user_id = String(data._id).slice(0, 11);

                    // Save file to db
                    data.save((err, data) => {
                        if (err) {
                            console.log('error occurred while saving document');
                        }
                        console.log('saved successfully');

                        // Output json to client
                        res.json({
                            username: data.username,
                            _id: data.user_id
                        });
                    });
                }
            });
        }
    }

});

app.post('/api/exercise/add', (req, res) => {
    console.log(req.body);

    // Is user_id in db?
    registrantModel.findOne({ user_id: req.body.userId }, (err, data) => {
        if (err) {
            res.send("Error occurred while searching for file");
        }
        // Found the document
        else if (data) {
            if (req.body.description == '') {
                res.send(`Path \`description\` is required.`);
            }
            else {
                // convert to int to avoid leading zero. eg 02
                req.body.duration = Number(req.body.duration);

                if (req.body.duration < 1) {
                    res.send(`duration too short`);
                }
                else {
                    if (req.body.date == '') {
                        req.body.date = new Date();
                    }
                    else {
                        if (new Date(req.body.date) == 'Invalid Date') {
                            res.send(`Cast to Date failed for value "${req.body.date}" at path "date"`);
                        }
                        else {
                            var time = req.body.date.replace(/[^0-9]/g, ' ').split` `;
                            req.body.date = String(new Date(time)).slice(0, 15);

                            // Update data 
                            data.duration = req.body.duration;
                            data.date = req.body.date;
                            data.description = req.body.description;

                            // Save updated data to db
                            data.save((err, data) =>{
                                if (err) {
                                    res.send('Error occurred while saving file');
                                }
                                console.log('Saved successfully');

                                // Output json to client
                                res.json({
                                    username: data.username,
                                    description: data.description,
                                    duration: data.duration,
                                    _id: data.user_id,
                                    date: req.body.date
                                });
                            });
                        }
                    }
                }
            }
        }
        // userId not in db
        else {
            res.send('unknown _id');
        }
    });
});

app.listen(3000, () => `Nodejs is listening`);