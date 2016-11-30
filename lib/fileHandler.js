var AWS = require('aws-sdk'),
    fs = require('fs'),
    flow = require('flow'),
    helpers = require("./helpers");

exports.transferFile = function (opts, callback) {
    'use strict';
    var s3 = new AWS.S3(),
        req = opts.req,
        res = opts.res,
        file = opts.file,
        uuID = helpers.generateUUID(),
        key,
        extension = file.path.split(".");
    extension = extension[extension.length - 1].toLowerCase();
    key = uuID + "." + extension;

    // Do S3 file transfer:
    flow.exec(
        function () {
            fs.readFile(file.path, this);
        },
        function (err, data) { // Upload file to S3
            if (err) {
                req.handleError(res, err, "Failed to read file.");
            } else {
                console.log("transferring...", key);
                s3.putObject({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: key,
                    Body: data
                }, this);
            }
        },
        function (err, data) { //Upload Callback
            if (err) {
                req.handleError(res, err, "Failed to put image onto S3");
            }
            callback({
                ETag: data.ETag,
                key: key,
                original_file_name: file.name,
                file_path: "https://s3-us-west-1.amazonaws.com/" +
                    process.env.AWS_S3_BUCKET + "/" + key
            });
        }
    );
};

exports.deleteFile = function (opts, callback) {
    'use strict';
    var s3 = new AWS.S3(),
        req = opts.req,
        res = opts.res;
    s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: opts.key
    }, function (err, data) { //Upload Callback
        if (err) {
            req.handleError(res, err, "Failed to delete file from S3");
        }
        callback(opts.record);
    });
};
