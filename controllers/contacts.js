var CONTACTS_COLLECTION = "contacts";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

exports.list = function (req, res) {
    'use strict';
    var query = {};
    if (req.params.username) {
        query.username = req.params.username;
    }
    req.db.collection(CONTACTS_COLLECTION).find(query).toArray(function (err, docs) {
        if (err) {
            req.handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
};

exports.post = function(req, res) {
    'use strict';
    var newContact = req.body;
    newContact.createDate = new Date();

    if (!(req.body.firstName || req.body.lastName)) {
        req.handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
    }

    req.db.collection(CONTACTS_COLLECTION).insertOne(newContact, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to create new contact.");
        } else {
            console.log(doc.ops[0]);
            res.status(201).json(doc.ops[0]);
        }
    });
};

exports.get = function (req, res) {
    'use strict';
    req.db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
};

exports.put = function (req, res) {
    'use strict';
    var updateDoc = req.body;
    delete updateDoc._id;

    req.db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function (err, doc) {
        if (err) {
            req.handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
        }
    });
};

exports.delete = function (req, res) {
    'use strict';
    req.db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
        if (err) {
            req.handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
};