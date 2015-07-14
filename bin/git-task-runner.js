#!/usr/bin/env node

var gitRunner = require( '../src/index' );
var path = require('path');

var argv = require('yargs')
    .usage('Usage: $0 -c [path to config] -r [path to repo]')
    .demand('c', 'Path to config is required')
    .describe('c', 'Path to config')
    .alias('c','config')
    .example('$0 -c ./config.test -r .', 'Exec tasks in provided config')
    .demand('r', 'Path to repo is required')
    .describe('r', 'Path to repo')
    .alias('r','repo')
    .describe('b', 'Default branch name (will be used, if branch name omitted in config)')
    .alias('b','default-branch')
    .example('$0 -c ./config.test -r . -b master', 'Use master as default branch')
    .help('h')
    .alias('h', 'help')

    .argv;

if( typeof argv.c === 'string' && typeof argv.r === 'string' ){
    var options = {
        config: argv.c,
        pathToRepo: path.resolve(process.cwd(), argv.r),
        defaultBranchName: argv.b
    };

    gitRunner.run(options).then(function(result) {
        done();
    });
}else{
    console.error('Wrong type of one of the arguments. Please check help for examples');
}

