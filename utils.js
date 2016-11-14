const fs = require('fs');
exports.checkDirectory = function(directory, callback) {
    fs.stat(directory, function(err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
    });
};
