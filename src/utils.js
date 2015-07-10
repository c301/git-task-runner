var Q = require('q');
var http = require('https');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var spawn = require('child_process').spawn;
var colors = require('colors');

var NodeGit = require("nodegit");

var openRepo = NodeGit.Repository.open;
var Tag = NodeGit.Tag;
var Signature = NodeGit.Signature;
var Checkout = NodeGit.Checkout;
var CheckoutOptions = NodeGit.CheckoutOptions;

var CommandParser = (function() {
    var parse = function(str, lookForQuotes) {
        var args = [];
        var readingPart = false;
        var part = '';
        for(var i=0; i<str.length; i++){
            if(str.charAt(i) === ' ' && !readingPart) {
                args.push(part);
                part = '';
            } else {
                if(str.charAt(i) === '\"' && lookForQuotes) {
                    part += str.charAt(i);
                    readingPart = !readingPart;
                } else {
                    part += str.charAt(i);
                }
            }
        }
        args.push(part);
        return args.filter(function(el) {
            return el.trim() !== "";
        });
    };
    return {
        parse: parse
    };
})(); 

console.dir = _.partialRight(console.dir, { showHidden: true, depth: null });

var execCommand = function(commandText, row) {
    return getRepo().then(function(repo) {
        var d = Q.defer();
        if( row.comment ){
            console.log( colors.green('Comment: %s'), colors.gray(row.comment) );
        }
        //set cwd (repo root), etc..
        var options = {
            cwd: repo.workdir()
        };

        //parse command line
        var parsedCommand = CommandParser.parse(commandText, true);
        //get command
        var command = _.first(parsedCommand);
        //get args
        var args = _.rest(parsedCommand);
        console.log( colors.green('Executing: %s %s'), colors.gray(command), colors.gray(args.join(" ")) );
        console.log();

        var commandProcess  = spawn( command, args, options );
        commandProcess.stdout.on('data', function (data) {
            process.stdout.write(data);
        });
        commandProcess.stderr.on('data', function (data) {
            process.stdout.write(colors.red(data));
        });
        /*
         * commandProcess.on('exit', function (code) {
         *     console.log( colors.green('Finished: %s %s'), colors.gray(command), colors.gray(args.join(" ")) );
         *     d.resolve();
         * });
         */
        commandProcess.on('close', function (code) {
            console.log( colors.green('Finished: %s %s'), colors.gray(command), colors.gray(args.join(" ")) );
            d.resolve();
        });
        commandProcess.on('error', function (error) {
            console.log(colors.red('ERROR:'));
            console.dir( error );
            d.reject();
        });

        return d.promise;
    });
};

var seq = function( functions ) {
    var d = Q();
    functions.forEach(function(fun) {
        d = d.then(function(res) {
            return fun(res);
        });
    });
    return d;
};

var checkoutToTag = function( tagName ) {
    return getRepo().then(function(repo) {
        return repo.getTagByName(tagName)
        .then(function(tag) {
            return Checkout.tree(tag.owner(), tag.id(), { checkoutStrategy: Checkout.STRATEGY.FORCE})
                .then(function() {
                    var signature = Signature.default(repo);
                    var code = repo.setHeadDetached(tag.id(), signature, "Checkout: HEAD " + tag.id());
                    if(!code){
                        return code;
                    }else{
                        throw new Error('Error while moving to tag. Code: ' + code);
                    }
                });
        });
    });
};

var getRepo = ( function () {
    var repo = null;
    return function(pathToRepo) {
        var d = Q.defer();
        if(repo){
            d.resolve(repo);
        }else{
            var finalPath = path.resolve( process.cwd(), pathToRepo );
            return openRepo( finalPath ).then(function(openedRepo) {
                repo = openedRepo;
                return repo;
            });
        }
        return d.promise;
    };
} )();

var checkoutToBranch = function( branchName ) {
    return getRepo().then(function(repo) {
        var checkoutOptions = new CheckoutOptions();
        checkoutOptions.checkoutStrategy = Checkout.STRATEGY.FORCE;
        return repo.checkoutBranch(branchName, checkoutOptions);
    });
};

var dropCommentedLines = function( lines ) {
    return _.filter(lines, function(line) {
        return line[0] !== '#' && line.length;
    });
};
var U = {
    getRepo: getRepo,
    checkoutToBranch: checkoutToBranch,
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
                    var body = '';
                    res.on('data', function(chunk) {
                        body += chunk;
                    });
                    res.on('end', function() {
                        d.resolve(body.trim());
                    });

                }).on('error', function(e) {
                    console.log(colors.red("Got error on AJAX request: " + e.message));
                    d.resolve();
                });
            }else{
                //try to get file from filesytem
                var realPath = path.resolve( process.cwd(), configPath );
                fs.readFile(realPath, { encoding: 'utf8' }, function (err, data) {
                    if (err){
                        console.log( err );
                        d.reject();
                    }else{
                        d.resolve(data.trim());
                    }
                });
            }
        }else{
            throw new Error('Empty path for config');
        }
        return d.promise;
    },
    handleRow: function(row) {
        console.log( colors.green('Handle row: %s'), colors.yellow(row.__originalRow ));
        if(row.tag){
            return checkoutToTag( row.tag ).then( function() {
                return execCommand( row.command, row );
            }, function(e) {
                console.log( colors.yellow('Checkout failed. Skip row. %s'), colors.red(e) );
                return true;
            });
        }else if(row.branch){
            return checkoutToBranch( row.branch ).then( function() {
                return execCommand( row.command, row );
            }, function(e) {
                console.log( colors.yellow('Checkout failed. Skip row. %s'), colors.red(e) );
                return true;
            });
        }else{
            console.log( colors.yellow('No tag/branch to checkout. Please check config.') );
            return true;
        }
    },
    handleRows: function(config) {
        var rowHandlers = _.map(config, function( row ) {
            return function() {
                var t = _.partial( U.handleRow, row );
                
                return Q.when(t()).tap(function() {
                    //empty line between res
                    console.log();
                });
            };
        });
        return seq(rowHandlers);
    },
    parseConfig: function(rawText) {
        var jsonConfig = [];
        var lines = rawText.split('\n');
        lines = dropCommentedLines(lines);

        lines.forEach(function (line) {
            var row = {};
            var keyValuesPairs = line.split(';');
            keyValuesPairs.forEach(function (keyValue) {
                var key = keyValue.split(':')[0];
                var value = keyValue.split(':')[1];
                if( key && value ){
                    row[key.trim()] = value.trim();
                }
            });
            if(Object.keys(row).length){
                row.__originalRow = line;
                jsonConfig.push(row);
            }
        });
        return jsonConfig;
    },
    validateOptions: function(options) {
        var d = Q.defer();
        if( !options.config || !options.pathToRepo){
            d.reject();
        }else{
            d.resolve();
        }

        return d.promise;
    }
};

module.exports = U;
