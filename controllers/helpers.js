exports.validateCreateUpdate = function (keys, req, res) {
    'use strict';
    var i;
    for (i = 0; i < keys.length; i++) {
        if (!req.body[keys[i]] || req.body[keys[i]].toString().length < 1) {
            req.handleError(res, "Invalid user input", "Must provide a " + keys[i] + ".", 400);
        } else {
            console.log(keys[i], req.body[keys[i]]);
        }
    }
};

exports.generateUUID = function (len) {
    'use strict';
    var text = "",
        i,
        possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    len = len || 32;
    for (i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};