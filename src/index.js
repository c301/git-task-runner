var Q = require('q');
var u = require('./utils.js');
var _ = require('lodash');

var gitRunner = {
    run: function (options) {
        return u.validateOptions(options)
            .then(function() {
                //get initial branch. Back to this branch on finish
                return u.getRepo(options.pathToRepo)
                .then(function(repo) {
                    return repo.getCurrentBranch().then(function( initialBranch ) {
                        return u.getRawConfig(options.config)
                        .then(u.parseConfig)
                        .then(function(config) {
                            return u.handleRows(config, options);
                        })
                        .then(function() {
                            return u.checkoutToBranch( initialBranch );
                        })
                        .catch(function(e) {
                            console.log( e.stack );
                            console.log( 'Return to initial branch %s. Due to errors.', initialBranch.name() );
                            return u.checkoutToBranch( initialBranch );
                        });
                    });
                });
            }, function() {
                console.log( 'Validation failed. Please provide valid config' );
            })
            .catch(function(e) {
                console.log( e.stack );
            });
    },
    test: function() {
        return true;
    }
};

module.exports = gitRunner;
