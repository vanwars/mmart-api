var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var videos = require("./controllers/videos");
var contacts = require("./controllers/contacts");
var images = require("./controllers/images");

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,OPTIONS,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};
var app = express();
module.exports = app;
app.use(allowCrossDomain);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

//Note: if you are running this locally, to find out what your
//      BD name is, run this at the command line: heroku config | grep MONGODB_URI
var LOCAL_MONGODB = 'mongodb://heroku_9v7hzvgr:s2jglh70nburrhr0lkrdtm4811@ds151117.mlab.com:51117/heroku_9v7hzvgr';

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || LOCAL_MONGODB, function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

// Youtube Videos
app.all('*', function (request, response, next) {
    //http://stackoverflow.com/questions/9651066/how-can-i-structure-my-express-app-where-i-only-need-to-open-a-mongodb-connectio
    'use strict';
    request.db = db;
    request.handleError = function (res, reason, message, code) {
        console.log("ERROR: " + reason);
        res.status(code || 500).json({"error": message});
    };
    next();
});
app.get('/videos/:id([0-9a-fA-F]+)/', videos.get);
app.get('/videos/', videos.list);
app.get('/videos/:username/', videos.list);
app.post('/videos/', videos.post);
app.put('/videos/:id([0-9a-fA-F]+)/', videos.put);
app.delete('/videos/:id([0-9a-fA-F]+)/', videos.delete);

// Contacts
app.get('/contacts/:id([0-9a-fA-F]+)/', contacts.get);
app.get('/contacts/', contacts.list);
app.get('/contacts/:username/', contacts.list);
app.post('/contacts/', contacts.post);
app.put('/contacts/:id([0-9a-fA-F]+)/', contacts.put);
app.delete('/contacts/:id([0-9a-fA-F]+)/', contacts.delete);

// Image S3 Server transfer:
var multipart = require('connect-multiparty'),
    multipartMiddleware = multipart();
app.post('/s3-upload', multipartMiddleware, images.post);



