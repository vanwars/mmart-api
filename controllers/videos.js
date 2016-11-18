var VIDEO_COLLECTION = "videos";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var validateCreateUpdate = function (keys, req, res) {
    'use strict';
    var i;
    for (i = 0; i < keys.length; i++) {
        if (!(req.body[keys[i]])) {
            req.handleError(res, "Invalid user input", "Must provide a " + keys[i] + ".", 400);
        }
    }
};

exports.list = function (req, res) {
    'use strict';
    var query = req.query;
    if (req.params.username) {
        query.username = req.params.username;
    }
    req.db.collection(VIDEO_COLLECTION).find(query).toArray(function (err, docs) {
        if (err) {
            req.handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
};

exports.get = function (req, res) {
    'use strict';
    req.db.collection(VIDEO_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
};

exports.put = function (req, res) {
    'use strict';
    var requiredFields = ['youtube_id', 'username', 'description', 'genre'],
        video = req.body;
    validateCreateUpdate(requiredFields, req, res);
    delete video._id; //remove _id property if it was passed in

    req.db.collection(VIDEO_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, video, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
        }
    });
};

exports.post = function (req, res) {
    'use strict';
    var requiredFields = ['youtube_id', 'username', 'description', 'genre'],
        newVideo = req.body;
    newVideo.createDate = new Date();
    validateCreateUpdate(requiredFields, req, res);

    req.db.collection(VIDEO_COLLECTION).insertOne(newVideo, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to create new video.");
        } else {
            console.log(doc.ops[0]);
            res.status(201).json(doc.ops[0]);
        }
    });
};

exports.delete = function (req, res) {
    'use strict';
    req.db.collection(VIDEO_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
        if (err) {
            req.handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
};