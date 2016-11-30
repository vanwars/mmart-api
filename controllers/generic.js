/*
 * Note: In order for S3 to work, the following environment variables
 * must be set: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 */


/* TODO:
 * Custom collections have a username prefix, e.g.: vanwars_images
 * Create /endpoints/ listing w/list of all collections in DB.
 */
var helpers = require("../lib/helpers");
var mongodb = require("mongodb");
var im = require('imagemagick');
var ObjectID = mongodb.ObjectID;
var thumbnailer = require("../lib/thumbnailer");
var fileHandler = require("../lib/fileHandler");

// SEE: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
var S3_BUCKET = process.env.AWS_S3_BUCKET,
    fs = require('fs'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    flow = require('flow');

exports.list = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection,
        query = req.params;
    delete query.username;
    delete query.collection;
    res.status(200).json(query);
    //req.handleError(res, query, query);
    //console.log(req.params);
        /*fields = ['username', 'description', 'genre'],
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
    }*/
    req.db.collection(COLLECTION).find(query).toArray(function (err, docs) {
        if (err) {
            req.handleError(res, err.message, "Failed to get images.");
        } else {
            res.status(200).json(docs);
        }
    });
};

exports.post = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection,
        requiredFields = ['username'],
        isValid,
        newImage = req.body;
    // ensure if someone accidentally posts an _id, that it doesn't
    // interfere w/MongoDB's indexing system. Delete _id from dictionary:
    delete req.body._id;
    req.body.username = req.body.username || req.params.username;

    isValid = helpers.validateCreateUpdate(requiredFields, req, res);
    if (!isValid) {
        return;
    }
    flow.exec(
        // generate thumbnails and transfer to S3:
        function () {
            if (req.files && req.files.image) {
                thumbnailer.generateThumbnails({
                    req: req,
                    res: res,
                    image: req.files.image,
                    index: 0
                }, this);
            } else {
                this();
            }
        },
        // append thumbnail data to JSON object:
        function (images) {
            if (images) {
                newImage.image = {
                    items: images,
                    original_file_name: req.files.image.name
                };
            }
            this();
        },
        // transfer audio to S3:
        function () {
            if (req.files && req.files.audio) {
                fileHandler.transferFile({
                    req: req,
                    res: res,
                    file: req.files.audio
                }, this);
            } else {
                this();
            }
        },
        // append audio data to JSON object:
        function (audioData) {
            if (audioData) {
                newImage.audio = audioData;
            }
            this();
        },
        // transfer file to S3:
        function () {
            if (req.files && req.files.file) {
                fileHandler.transferFile({
                    req: req,
                    res: res,
                    file: req.files.file
                }, this);
            } else {
                this();
            }
        },
        // append file data data to JSON object:
        function (fileData) {
            if (fileData) {
                newImage.file = fileData;
            }
            this();
        },
        // finally, save to database:
        function () {
            newImage.createDate = new Date();
            //finally, insert a new record:
            req.db.collection(COLLECTION).insertOne(newImage, function (err, doc) {
                if (err) {
                    req.handleError(res, err.message, "Failed to create new resource.");
                } else {
                    var d = doc.ops[0];
                    d.message = 'Resource successfully created';
                    console.log(doc.ops[0]);
                    res.status(201).json(d);
                }
            });
        }
    );
};

exports.get = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection;
    req.db.collection(COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to find the requested resource");
        } else {
            console.log("Retrieved one:", doc);
            res.status(200).json(doc);
        }
    });
};

exports.put = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection,
        updateDoc = req.body,
        d;
    delete updateDoc._id;

    req.db.collection(COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to update resource");
        } else {
            console.log("UPDATED DOC:", d);
            d = doc;
            res.status(204).json(d);
        }
    });
};

exports.delete = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection;
    console.log(req.params.id, req.params.collection);
    flow.exec(
        function () {
            // get image from database:
            req.db.collection(COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, this);
            //req.db.collection(COLLECTION).findOne({"_id" : new ObjectID("583e4736afabfc00104b9ace")}, this);
        },
        function (err, record) {
            // store image in local variable or throw error:
            if (err) {
                req.handleError(res, err.message, "Failed to delete the requested resource");
            } else if (!record) {
                req.handleError(res, null, "Failed to locate the requested resource");
            } else {
                console.log(record);
                //image = record;
                this(record);
            }
        },
        function (record) {
            if (record.image) {
                //remove thumbnails from S3
                thumbnailer.deleteThumbnails({
                    req: req,
                    res: res,
                    record: record,
                    index: 0
                }, this);
            } else {
                this(record);
            }
        },
        function (record) {
            if (record.audio) {
                //remove audio file from S3
                fileHandler.deleteFile({
                    req: req,
                    res: res,
                    key: record.audio.key,
                    record: record
                }, this);
            } else {
                this(record);
            }
        },
        function (record) {
            if (record.file) {
                //remove audio file from S3
                fileHandler.deleteFile({
                    req: req,
                    res: res,
                    key: record.file.key,
                    record: record
                }, this);
            } else {
                this(record);
            }
        },
        function () {
            req.db.collection(COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
                if (err) {
                    req.handleError(res, err.message, "Failed to delete the requested resource");
                } else {
                    res.status(204).json(result).end();
                }
            });
        }
    );
};

exports.deleteAll = function (req, res) {
    'use strict';
    var COLLECTION = req.params.collection;
    req.db.collection(COLLECTION).deleteMany({}, function (err, result) {
        if (err) {
            req.handleError(res, err.message, "Failed to delete the requested resource");
        } else {
            res.status(204).json(result).end();
        }
    });
};