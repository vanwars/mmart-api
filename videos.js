var VIDEO_COLLECTION = "videos";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

exports.list = function (req, res) {
    'use strict';
    var query = {};
    if (req.query.username) {
        query.username = req.query.username;
    }
    if (req.query.youtube_id) {
        query.youtube_id = req.query.youtube_id;
    }
    if (req.query.genre) {
        query.genre = req.query.genre;
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

exports.put = function(req, res) {
    'use strict';
    if (!(req.body.youtube_id)) {
        req.handleError(res, "Invalid user input", "Must provide a youtube_id.", 400);
    }
    if (!(req.body.username)) {
        req.handleError(res, "Invalid user input", "Must provide a username.", 400);
    }
    if (!(req.body.description)) {
        req.handleError(res, "Invalid user input", "Must provide a description.", 400);
    }
    if (!(req.body.genre)) {
        req.handleError(res, "Invalid user input", "Must provide a genre.", 400);
    }
    var updateDoc = req.body;
    delete updateDoc._id;

    req.db.collection(VIDEO_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
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

exports.post = function (req, res) {
    'use strict';
    var newVideo = req.body;
    newVideo.createDate = new Date();
    if (!(req.body.youtube_id)) {
        req.handleError(res, "Invalid user input", "Must provide a youtube_id.", 400);
    }
    if (!(req.body.username)) {
        req.handleError(res, "Invalid user input", "Must provide a username.", 400);
    }
    if (!(req.body.description)) {
        req.handleError(res, "Invalid user input", "Must provide a description.", 400);
    }
    if (!(req.body.genre)) {
        req.handleError(res, "Invalid user input", "Must provide a genre.", 400);
    }
    req.db.collection(VIDEO_COLLECTION).insertOne(newVideo, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to create new video.");
        } else {
            console.log(doc.ops[0]);
            res.status(201).json(doc.ops[0]);
        }
    });
};
