exports.validateCreateUpdate = function (keys, req, res) {
    'use strict';
    var i;
    for (i = 0; i < keys.length; i++) {
        if (!(req.body[keys[i]])) {
            req.handleError(res, "Invalid user input", "Must provide a " + keys[i] + ".", 400);
        }
    }
};