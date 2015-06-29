var assert = require( 'chai' ).assert;
var gitRunner = require( '../src/index' );
var gUtils = require( '../src/utils' );

describe('Index', function() {
    var options = {
        config: '../test/empty.config'
    };

    it('Should be true', function() {
        assert( gitRunner.test(), 'Should always return true' );
    });
    it('General run with empty config', function(done) {
        gitRunner.run(options).then(function() {
            done();
        }, function() {
            done('Error on running tasks');
        });
    });
    it('Get raw config text from file', function(done) {
        gUtils.getRawConfig(options.config).then(function(text) {
            if( text === 'empty config' ){
                done();
            }else{
                done('Wrong content in config file', text);
            }
        },function(message) {
            done('Error while getting raw config text');
        });
    });
});
