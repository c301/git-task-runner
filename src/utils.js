var Q = require('q');
var http = require('http');
var fs = require('fs');
var path = require('path');

var U = {
    validateURL: function(textval) {
        var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
        return urlregex.test(textval);
    },
    getRawConfig: function(configPath){
        var d = Q.defer();
        if(configPath){
            if( U.validateURL(configPath) ){
                //prepare request to get file content
                http.get(configPath, function(res) {
                    d.resolve(res.responseText);
                }).on('error', function(e) {
                    console.log("Got error on AJAX request: " + e.message);
                    d.reject();
                });
            }else{
                //try to get file from filesytem
                var realPath = path.join( __dirname, path.normalize(configPath) );
                fs.readFile(realPath, { encoding: 'utf8' }, function (err, data) {
                    if (err) throw err;
                    d.resolve(data.trim());
                });
            }
        }else{
            throw new Error('Empty path for config');
        }
        return d.promise;
    },
    validateOptions: function(options) {
        var d = Q.defer();
        if( !options.config ){
            d.reject();
        }else{
            d.resolve();
        }

        return d.promise;
    }
};

module.exports = U;
