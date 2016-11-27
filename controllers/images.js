/*
 * Note: In order for S3 to work, the following environment variables
 * must be set: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 */

var helpers = require("./helpers");
var IMAGE_COLLECTION = "images";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

// SEE: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
var S3_BUCKET = process.env.AWS_S3_BUCKET,
    fs = require('fs'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    flow = require('flow');

exports.list = function (req, res) {
    'use strict';
    var query = {},
        fields = ['username', 'description', 'genre'],
        i,
        field,
        val;
    for (i = 0; i < fields.length; i++) {
        field = fields[i];
        val = req.query[field];
        if (val) {
            query[field] = val;
        }
    }
    if (req.params.username) {
        query.username = req.params.username;
    }
    req.db.collection(IMAGE_COLLECTION).find(query).toArray(function (err, docs) {
        if (err) {
            req.handleError(res, err.message, "Failed to get images.");
        } else {
            res.status(200).json(docs);
        }
    });
};

exports.post = function (req, res) {
    'use strict';
    var s3 = new AWS.S3(),
        fileObject = req.files.file_path,
        result = {
            error: 0,
            uploaded: []
        },
        requiredFields = ['username'],
        tmp_path,
        originalFileName,
        newFileName,
        extension,
        newImage;

    //validate file object
    if (!fileObject) {
        req.handleError(res, "Invalid user input", "Must provide a file_path.", 400);
        return;
    }
    tmp_path = fileObject.path;
    originalFileName = fileObject.name;
    extension = fileObject.path.split(".");
    extension = extension[extension.length - 1].toLowerCase();
    newFileName = helpers.generateUUID() + "." + extension;
    req.body.file_name = originalFileName;
    req.body.file_path = tmp_path;

    helpers.validateCreateUpdate(requiredFields, req, res);
    newImage = req.body;
    newImage.createDate = new Date();
    flow.exec(
        function () { // Read temp File
            fs.readFile(tmp_path, this);
        },
        function (err, data) { // Upload file to S3
            s3.putObject({
                Bucket: S3_BUCKET, //Bucket Name //process.env.AWS_S3_BUCKET
                Key: newFileName, //Upload File Name, Default the original name
                Body: data
            }, this);
        },
        function (err, data) { //Upload Callback
            if (err) {
                req.handleError(res, err, "Failed to put image onto S3");
                console.error('Error : ' + err);
                console.error('data : ' + data);
                result.error++;
                return;
            }

            console.log("resulting data...", data);
            result.uploaded.push(data.ETag);
            newImage.ETag = data.ETag;
            newImage.file_name = originalFileName;
            newImage.key = newFileName;
            newImage.file_path = "https://s3-us-west-1.amazonaws.com/" +
                    S3_BUCKET + "/" + newImage.key;
            this();
        },
        function () {
            //if the S3 transfer was successful, insert a record:
            req.db.collection(IMAGE_COLLECTION).insertOne(newImage, function (err, doc) {
                if (err) {
                    req.handleError(res, err.message, "Failed to create new image.");
                } else {
                    var d = doc.ops[0];
                    d.message = 'File ' + fileObject.name + ' uploaded to: S3: ' +
                        fileObject.size + ' bytes';
                    console.log(doc.ops[0]);
                    res.status(201).json(d);
                }
            });
        }
    );
};

exports.get = function (req, res) {
    'use strict';
    req.db.collection(IMAGE_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to get image");
        } else {
            res.status(200).json(doc);
        }
    });
};

exports.delete = function (req, res) {
    'use strict';
    var image,
        s3 = new AWS.S3();
    flow.exec(
        function () {
            // get image from database:
            req.db.collection(IMAGE_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, this);
        },
        function (err, doc) {
            // store image in local variable or throw error:
            if (err) {
                req.handleError(res, err.message, "Failed to get image");
            } else {
                console.log(doc);
                image = doc;
            }
            this();
        },
        function () {
            // go and delete image from S3:
            var params = {
                Bucket: S3_BUCKET,
                Key: image.key
            };
            s3.deleteObject(params, this);
        },
        function (err, data) {
            // verify success or throw error:
            if (err) {
                console.log(err, err.stack);
                req.handleError(res, err.stack, "Failed to delete image from S3");
            } else {
                console.log("image deleted:", data);
                this();
            }
        },
        function () {
            // delete image from DB:
            req.db.collection(IMAGE_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
                if (err) {
                    req.handleError(res, err.message, "Failed to delete image from DB");
                } else {
                    res.status(204).json(result).end();
                }
            });
        }
    );
};