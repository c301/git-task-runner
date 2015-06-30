var Q = require('q');
var u = require('./utils.js');
var _ = require('lodash');

var gitRunner = {
    run: function (options) {
        return u.validateOptions(options)
            .then(function() {
                //get initial branch. Back to this branch on finish
                return u.getRepo()
                .then(function(repo) {
                    return repo.getCurrentBranch().then(function( initialBranch ) {
                        return u.getRawConfig(options.config)
                        .then(u.parseConfig)
                        .then(u.handleRows)
                        .then(function() {
                            return u.checkoutToBranch( initialBranch );
                        })
                        .catch(function(e) {
                            console.log( e.stack );
                            console.log( 'Error. Return to initial branch %s', initialBranch.name() );
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
