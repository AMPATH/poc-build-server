const cron = require('node-cron');
const utils = require('./utils');
const config = require('./config');
// cron.schedule('* * * * *', function(){
//   console.log('running a task every minute');
// });
var fse = require('fs-extra');
const fs = require("fs");
const simpleGit = require('simple-git');
const appDir = config.buildDir + config.appName;
const appDeployDir = config.deployDir + config.appName;

function build() {
    fs.exists(appDir, function(exists) {
        if (exists) {
            let spawn = require('child_process').spawn;
            simpleGit(config.buildDir + config.appName)
                .pull(function(err, update) {
                    let ls = spawn('npm', ['install'], {
                        cwd: config.buildDir + config.appName
                    });

                    ls.stdout.on('data', function(data) {
                        console.log('stdout: ' + data.toString());
                    });

                    ls.stderr.on('data', function(data) {
                        console.log('stderr: ' + data.toString());
                    });

                    ls.on('exit', function(code) {
                        console.log('child process exited with code ' + code.toString());
                        if (code === 0) {
                            console.log('Run Build Now');
                            let build = spawn('npm', ['run', 'build:prod'], {
                                cwd: config.buildDir + config.appName
                            });
                            build.stdout.on('data', function(data) {
                                console.log('stdout: ' + data.toString());
                            });

                            build.stderr.on('data', function(data) {
                                console.log('stderr: ' + data.toString());
                            });

                            build.on('exit', function(code) {
                                if (code === 0) {
                                    fse.removeSync(appDeployDir);
                                    fse.copySync(appDir+'/dist', appDeployDir)
                                } else {
                                    console.log('build failed maybe another time');
                                }

                            });
                        }

                    });
                });
        } else {
            simpleGit().clone(config.gitRepo, config.buildDir + config.appName, function(err, data) {
                if (err) {
                    console.log('Error', err);
                }
                console.log('Clone Done');
                build();
            });
        }
    });
}
build();
