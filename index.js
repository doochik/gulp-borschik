'use strict';

var borschik = require('borschik');
var Stream = require('stream');
var util = require('util');

function gulpBorschik(borschikOpts) {
    var stream = new Stream.Transform({objectMode: true});

    stream._transform = function(file, unused, callback) {
        var result = new Buffer('');
        var outputStream = new Stream.Writable();
        outputStream._write = function (chunk, encoding, done) {
            result = Buffer.concat([result, chunk]);
            done();
        };
        outputStream.on('finish', function() {
            file.contents = result;
            callback(null, file);
        });

        var opts = util._extend({}, borschikOpts);
        opts.input = file.path;
        opts.output = outputStream;

        borschik
            .api(opts)
            .then(null, function(e) {
                process.nextTick(function() {
                    stream.emit('error', new Error('gulp-borschik: ' + e.message));
                });
            });
    };

    return stream;
}

module.exports = gulpBorschik;
