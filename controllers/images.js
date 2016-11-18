// SEE: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
var S3_BUCKET = process.env.S3_BUCKET,
    fs = require('fs'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    flow = require('flow');

exports.post = function (req, res) {
    'use strict';
    var s3 = new AWS.S3(),
        fileObject = req.files.image_path,
        tmp_path = fileObject.path,
        originalName = fileObject.name,
        result = {
            error: 0,
            uploaded: []
        };

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
};