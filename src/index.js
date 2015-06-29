var Q = require('q');
var u = require('./utils.js');
var _ = require('lodash');

var gitRunner = {
    run: function (options) {
        return u.validateOptions(options)
            /*
             * .then(function() {
             *     return getRawConfig(options.config)
             *     .then(parseConfig)
             *     .then(handleConfig);
             * })
             */
            .catch(function(e) {
                console.log( e.stack );
            });
    },
    test: function() {
        return true;
    }
};

module.exports = gitRunner;
