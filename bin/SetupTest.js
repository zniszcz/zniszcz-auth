#!/usr/bin/env node
const childProcess = require('child_process');

process.env.NODE_ENV = 'test';
process.env.LANGUAGE = 'en';

childProcess.spawn('sequelize', ['db:migrate:undo:all'])
    .stdout
    .on('data', (data) => {
        const line = data.toString();
        console.log(line.substr(0, line.length - 1));
    })
    .on('end', () => {
        childProcess.spawn('sequelize', ['db:migrate'])
            .stdout
            .on('data', (data) => {
                const line = data.toString();
                console.log(line.substr(0, line.length - 1));
            });
    });
