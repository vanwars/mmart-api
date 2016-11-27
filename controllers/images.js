var helpers = require("./helpers");
var IMAGE_COLLECTION = "images";
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
        fileObject = req.files.image_path,
        tmp_path = fileObject.path,
        originalName = fileObject.name,
        result = {
            error: 0,
            uploaded: []
        },
        requiredFields = ['username', 'image_path'];
    req.body.image_path = tmp_path;
    helpers.validateCreateUpdate(requiredFields, req, res);

    flow.exec(
        function () { // Read temp File
            fs.readFile(tmp_path, this);
        },
        function (err, data) { // Upload file to S3
            console.log("putting image on server...");
            console.log(S3_BUCKET);
            s3.putObject({
                Bucket: S3_BUCKET, //Bucket Name //process.env.AWS_S3_BUCKET
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
            
            console.log("resulting data...", data);
            result.uploaded.push(data.ETag);
            this();
        },
        function () {
            //if the S3 transfer was successful, insert a record:
            var newImage = req.body;
            newImage.createDate = new Date();
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
            /*res.status(201).json({
                message: 'File ' + fileObject.name + ' uploaded to: S3: ' +
                    fileObject.size + ' bytes'
            });*/
        }
    );
};