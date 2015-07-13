var assert = require( 'chai' ).assert;
var gitRunner = require( '../src/index' );
var gUtils = require( '../src/utils' );

describe('Index', function() {
    this.timeout(5000);

    var options = {
        config: 'test/empty.config'
    };

    it('Should be true', function() {
        assert( gitRunner.test(), 'Should always return true' );
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
    it('Get raw config text from URL (HTTPS)', function(done) {
        options.config = 'https://raw.githubusercontent.com/c301/git-task-runner/master/test/empty.config';
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
    it('Get raw config text from URL (HTTP)', function(done) {
        options.config = 'http://raw.githubusercontent.com/c301/git-task-runner/master/test/empty.config';
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

    it('Parse invalid config. Should return empty array', function(done) {
        gUtils.getRawConfig(options.config)
        .then(gUtils.parseConfig)
        .then(function(parsedConfig) {
            if(parsedConfig.length === 0){
                done();
            }else{
                done('Error while parse invalid config', parsedConfig);
            }
        }).catch(function(e) {
            console.log( e.stack );
        });
    });

    it('Parse valid config', function(done) {
        options.config = 'https://raw.githubusercontent.com/c301/git-task-runner/master/test/empty.config';
        gUtils.getRawConfig(options.config)
        .then(gUtils.parseConfig)
        .then(function(parsedConfig) {
            if(parsedConfig.length === 0){
                done();
            }else{
                done('Error while parse invalid config', parsedConfig);
            }
        }).catch(function(e) {
            console.log( e.stack );
        });
    });

    it('getRepo', function(done) {
        var pathToRepo = "../test-repo";
        gUtils.getRepo(pathToRepo).then(function(repo) {
            return repo.getCurrentBranch().then(function(branch) {
                done();
            });
        });
    });

    it('Run with empty config', function(done) {
        gitRunner.run(options).then(done);
    });

    it('Run with test config', function(done) {
        var options = {
            config: 'test/testing.config',
            pathToRepo: '../test-repo'
        };
        gitRunner.run(options).then(function(result) {
            done();
        });
    });
});
