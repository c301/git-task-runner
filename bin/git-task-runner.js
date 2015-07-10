#!/usr/bin/env node

var gitRunner = require( '../src/index' );
var path = require('path');

var argv = require('yargs')
    .usage('Usage: $0 -c [path to config] -r [path to repo]')
    .demand('c')
    .describe('c', 'Path to config')
    .alias('c','config')
    .example('$0 -c ./config.test', 'Exec tasks in provided config')
    .demand('r')
    .describe('r', 'Path to repo')
    .alias('r','repo')
    .help('h')
    .alias('h', 'help')

    .argv;

if( typeof argv.c === 'string' && typeof argv.r === 'string' ){
    var options = {
        config: path.resolve(process.cwd(), argv.c),
        pathToRepo: path.resolve(process.cwd(), argv.r)
    };
    console.log( options );
    console.log( path.resolve(process.cwd(), options.config) );
    console.log( process.cwd() );

    gitRunner.run(options).then(function(result) {
        done();
    });
}else{
    console.error('Wrong type of one of the arguments. Please check help for examples');
}

