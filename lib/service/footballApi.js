'use strict';

const request = require('request');

let footballApis = {};

footballApis.getStandings = () =>{

    let options = {
        method : 'GET',
        url: 'http://api.football-api.com/2.0/standings/1204?Authorization=565ec012251f932ea4000001fa542ae9d994470e73fdb314a8a56d76',
        headers: {
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        json : true
    };
    
    return new Promise((resolve, reject) =>{
        request(options, function (err, response, body) {
            console.log('API RESPONSE', err);
            if (err){
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};

footballApis.getSchedule = () =>{

    let options = {
        method : 'GET',
        url: 'http://api.football-api.com/2.0/standings/1204?Authorization=565ec012251f932ea4000001fa542ae9d994470e73fdb314a8a56d76',
        headers: {
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        json : true
    };
    
    return new Promise((resolve, reject) =>{
        request(options, function (err, response, body) {
            console.log('API RESPONSE', err);
            if (err){
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};

module.exports = footballApis;