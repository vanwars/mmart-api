var express = require("express");
var aws = require('aws-sdk');
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;


var CONTACTS_COLLECTION = "contacts";
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};
var app = express();
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


// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/********************************************************/
/*             S3 File Upload Experiment                */
/********************************************************/
var S3_BUCKET = process.env.S3_BUCKET;
var fs = require('fs'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    flow = require('flow'),
    multipart = require('connect-multiparty'),
    multipartMiddleware = multipart(),
    configPath = path.join(__dirname, "config.json");
//AWS.config.loadFromPath(configPath);
// SEE: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
app.post('/s3-upload', multipartMiddleware, function (req, res) {
    'use strict';
    var s3 = new AWS.S3(),
        fileObject = req.files.image_path,
        tmp_path = fileObject.path,
        originalName = fileObject.name,
        file = req.files,
        result = {
            error: 0,
            uploaded: []
        };
    //console.log(req.body, req.files);

    flow.exec(
        function () { // Read temp File
            fs.readFile(tmp_path, this);
        },
        function (err, data) { // Upload file to S3
            s3.putObject({
                Bucket: process.env.AWS_S3_BUCKET, //Bucket Name //process.env.AWS_S3_BUCKET
                Key: originalName, //Upload File Name, Default the original name
                Body: data
            }, this);
        },
        function (err, data) { //Upload Callback
            if (err) {
                console.error('Error : ' + err);
                console.error('data : ' + data);
                result.error++;
                return;
            }
            result.uploaded.push(data.ETag);
            this();
        },
        function () {
            res.status(201).json({
                message: 'File ' + fileObject.name + ' uploaded to: S3: ' +
                    fileObject.size + ' bytes'
            });
        }
    );
});
/********************************************************/


/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.post('/file-upload', multipartMiddleware, function (req, res) {
    'use strict';
    var tmp_path, target_path;
    console.log(req.body, req.files);
    tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    target_path = process.env.FILES + req.files.thumbnail.name;
    console.log("temporary path:", tmp_path);
    console.log("target path:", target_path);
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function (err) {
        if (err) {
            throw err;
        }
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function () {
            if (err) {
                throw err;
            }
            res.status(201).json({
                "message": 'File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes'
            });
        });
    });
});

/*app.post('/file-upload', function(req, res) {
    
    console.log("REQ.BODY", req.body);
    console.log("REQ.FILES", req.files);
    console.log("REQ", req);
    // get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
});*/

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  console.log(req);
  console.log(req.body);
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
        console.log(doc.ops[0]);
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});