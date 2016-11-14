'use strict';
const utils = require('./utils');
const Hapi = require('hapi');
const simpleGit = require('simple-git');

const server = new Hapi.Server();
server.connection({
    port: 3000
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('Ampath Poc Build Server');
    }
});

server.route({
    method: 'POST',
    path: '/pull-request',
    handler: function(request, reply) {
        let payload = request.payload;
        console.log(request.payload.action);
        console.log(request.payload.repository.clone_url);
        if (payload.action === 'closed' && payload.pull_request.merged === true) {

            utils.checkDirectory('ng2-amrs', function(status) {
                let spawn = require('child_process').spawn;
                if (status) {
                    console.log('Exist');
                    simpleGit(__dirname + '/ng2-amrs')
                        .pull(function(err, update) {
                            let ls = spawn('npm', ['install'], {
                                cwd: 'ng2-amrs'
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
                                        cwd: 'ng2-amrs'
                                    });
                                    build.stdout.on('data', function(data) {
                                        console.log('stdout: ' + data.toString());
                                    });

                                    build.stderr.on('data', function(data) {
                                        console.log('stderr: ' + data.toString());
                                    });

                                    build.on('exit', function(code) {
                                        console.log('child process exited with code ' + code.toString());
                                        if (code === 0) {
                                            console.log('Build Done deploy');
                                            let fs = require('fs.extra');
                                            fs.copyRecursive('./ng2-amrs/dist', '../../ng2-amrs', function(err) {
                                                if (err) {
                                                    throw err;
                                                }

                                                console.log("Copied './dist' to '../../ng2-amrs'");
                                            });
                                        } else {
                                            console.log('Log Error');
                                        }
                                    });
                                } else {
                                    console.log('Log Error');
                                }
                            });
                        });
                } else {
                    simpleGit().clone(payload.repository.clone_url, 'ng2-amrs', function(err, data) {
                        if (err) {
                            console.log('Error', err);
                        }
                        console.log('Clone Done');
                    });
                }
            })
        }
        reply({
            status: 'success'
        });
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
