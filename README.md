# Git Task Runner

This package was created to solve following problem:
execute commands on specific points of the repository.

For example we have few branches with different features and we want to always 
release specific feature to the same client.

Here is how we can solve the problem with `git-task-runner`.

### CLI example
- install package `npm install -g git-task-runner`
- create file with configuration 
```
command: grunt release:client1;    branch:feature1;          comment: Client1 should always reseive feature1 during testing period ( since 1st May )
command: grunt release:client2;    branch:feature2;          comment: Client2 should always reseive feature2 during testing period
command: grunt release:client3 release:client4;    branch:master;          comment: Other clients should reseive latest code from master
```
- run tasks `git-task-runner -c path/to/config -r path/to/repo`

### JS example
```
    var gitRunner = require( 'git-task-runner' );

    var options = {
        config: 'https://raw.githubusercontent.com/c301/git-task-runner/master/test/empty.config', //path to config can be an URL
        pathToRepo: '../test-repo'
    };
    gitRunner.run(options).then(function(result) {
        //tasks executed
    });
```

Configuration file
==================
Configuration file consist of lines. Each line represents task.
Each task consist of few fields separated by `;`.
Each field consist of `name of the field` and `value` separeted by `:`.

Possible fields
---------------

### branch
branch name to checkout before execute the command. **Required if no `tag` specified**
### tag
tag name to checkout before execute the command. **Required if no `branch` specified**
### comment
humman readable comment
### command
command to execute. **Required**.
**CWD** for each command is folder of the repository.


Example of the config
```
command: cat echo.file;    branch:tmp-branch1;          comment: release latest code from master for all versions, except versions listed below
command: cat echo.file;    branch:tmp-branch1;          comment: release latest code from master for all versions, except versions listed below
#command: cat echo.file;                                comment: commented task
command: cat echo.file;    tag:v5.7;                    comment: we want to always release outdated version
command: cat echo.file;    branch:tmp-branch2;          comment: testing
command: cat echo.file;    branch:tmp-branch2;          comment: testing
command: cat echo.file;    branch:tmp-branch2;          comment: testing
```

