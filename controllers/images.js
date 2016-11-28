/*
 * Note: In order for S3 to work, the following environment variables
 * must be set: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 */

var helpers = require("./helpers");
var IMAGE_COLLECTION = "images";
var mongodb = require("mongodb");
var im = require('imagemagick');
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

var deleteThumbnails = function (opts, callback) {
    'use strict';
    var s3 = new AWS.S3(),
        req = opts.req,
        res = opts.res,
        image = opts.image,
        thumb = image.images[opts.index];

    //because of asynchronosity, this is a recursive function:
    if (opts.index >= image.images.length) {
        callback();
        return; //exit the function
    }

    // if there are more thumbnails to delete, do it:
    flow.exec(
        function () {
            // go and delete image from S3:
            var params = {
                Bucket: S3_BUCKET,
                Key: thumb.key
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
            //note: this is a recursive function:
            ++opts.index;
            deleteThumbnails(opts, callback);
        }
    );
};

var generateThumbnails = function (opts, callback) {
    'use strict';
    var s3 = new AWS.S3(),
        req = opts.req,
        res = opts.res,
        newImage = opts.newImage,
        thumb = newImage.images[opts.index];

    //because of asynchronosity, this is a recursive function:
    if (opts.index >= newImage.images.length) {
        callback();
        return; //exit the function
    }

    // Do the thumbnailing + S3 file transfer:
    flow.exec(
        function () {
            //if no width, then skip thumbnailing:
            if (thumb.w) {
                im.resize({
                    srcPath: newImage.tmp_path,
                    dstPath: thumb.file_path,
                    width: thumb.w
                }, this);
            } else {
                this();
            }
        },
        function (err, stdout, stderr) {
            if (err) {
                req.handleError(res, err, stdout + stderr + "Failed to generate thumbnail.");
            } else {
                fs.readFile(thumb.file_path, this);
            }
        },
        function (err, data) { // Upload file to S3
            if (err) {
                req.handleError(res, err, "Failed to read file.");
            } else {
                console.log("transferring...", thumb.key);
                s3.putObject({
                    Bucket: S3_BUCKET,
                    Key: thumb.key,
                    Body: data
                }, this);
            }
        },
        function (err, data) { //Upload Callback
            if (err) {
                req.handleError(res, err, "Failed to put image onto S3");
            }
            thumb.ETag = data.ETag;
            thumb.file_path = "https://s3-us-west-1.amazonaws.com/" +
                    S3_BUCKET + "/" + thumb.key;
            this();
        },
        function () {
            //note: this is a recursive function:
            ++opts.index;
            generateThumbnails(opts, callback);
        }
    );
};

exports.post = function (req, res) {
    'use strict';
    var fileObject = req.files.file_path,
        requiredFields = ['username'],
        uuID,
        extension,
        newImage;

    //validate file object
    if (!fileObject) {
        req.handleError(res, "Invalid user input", "Must provide a file_path.", 400);
        return;
    }
    extension = fileObject.path.split(".");
    extension = extension[extension.length - 1].toLowerCase();
    uuID = helpers.generateUUID();
    req.body.file_name = fileObject.name;

    helpers.validateCreateUpdate(requiredFields, req, res);
    newImage = req.body;
    newImage.createDate = new Date();
    newImage.tmp_path = fileObject.path;
    newImage.images = [
        {
            file_path: newImage.tmp_path,
            key: uuID + "." + extension
        }, {
            w: 640,
            file_path: 'tmp/resized_640',
            key: uuID + "_thumb640." + extension
        }, {
            w: 300,
            file_path: 'tmp/resized_300',
            key: uuID + "_thumb300." + extension
        }, {
            w: 64,
            file_path: 'tmp/resized_64',
            key: uuID + "_thumb64." + extension
        }
    ];

    generateThumbnails({
        req: req,
        res: res,
        newImage: newImage,
        index: 0
    }, function () {
        //if the S3 transfer was successful, insert a record:
        req.db.collection(IMAGE_COLLECTION).insertOne(newImage, function (err, doc) {
            if (err) {
                req.handleError(res, err.message, "Failed to create new image.");
            } else {
                var d = doc.ops[0];
                d.message = 'File uploaded to: S3';
                console.log(doc.ops[0]);
                res.status(201).json(d);
            }
        });
    });
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
    var image;
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
            deleteThumbnails({
                req: req,
                res: res,
                image: image,
                index: 0
            }, function () {
                req.db.collection(IMAGE_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
                    if (err) {
                        req.handleError(res, err.message, "Failed to delete image from DB");
                    } else {
                        res.status(204).json(result).end();
                    }
                });
            });
        }
    );
};