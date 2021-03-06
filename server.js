var express = require("express");
var serveIndex = require('serve-index');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var videos = require("./controllers/videos");
var contacts = require("./controllers/contacts");
var generic = require("./controllers/generic");

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,OPTIONS,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};
var app = express();
module.exports = app;
app.use(allowCrossDomain);
app.use('/samples', express.static(__dirname + "/samples"));
app.use('/samples', serveIndex(__dirname + "/samples"));
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

//Videos:
var detailPaths = ['/videos/:id([0-9a-fA-F]+)/', '/:username/videos/:id([0-9a-fA-F]+)/'],
    listPaths = ['/videos/', '/:username/videos/'];
app.get(detailPaths, videos.get);
app.get(listPaths, videos.list);
app.post(listPaths, videos.post);
app.put(detailPaths, videos.put);
app.delete(detailPaths, videos.delete);

// Contacts
//detailPaths = ['/contacts/:id([0-9a-fA-F]+)/', '/:username/contacts/:id([0-9a-fA-F]+)/'];
//listPaths = ['/contacts/', '/:username/contacts/'];
//app.get(detailPaths, contacts.get);
//app.get(listPaths, contacts.list);
//app.post(listPaths, contacts.post);
//app.put(detailPaths, contacts.put);
//app.delete(detailPaths, contacts.delete);


// Generic, user-defined tables w/S3 & thumbnailing support:
var multipart = require('connect-multiparty'),
    multipartMiddleware = multipart();
detailPaths = ['/:username/:collection/:id([0-9a-fA-F]+)/'];
listPaths = ['/:username/:collection/'];
app.get(listPaths, multipartMiddleware, generic.list);
app.get(detailPaths, multipartMiddleware, generic.get);
app.post(listPaths, multipartMiddleware, generic.post);
app.put(detailPaths, multipartMiddleware, generic.put);
app.delete(detailPaths, generic.delete);
app.get('/:username/:collection/delete-all', generic.deleteAll);



