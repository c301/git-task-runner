#!/usr/bin/env node

var gitRunner = require( '../src/index' );

var options = {
    config: '../test/testing.config',
    pathToRepo: '../../test-repo'
};
gitRunner.run(options).then(function(result) {
    done();
});
