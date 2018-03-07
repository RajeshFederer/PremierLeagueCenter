'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./lib/alexa');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{
    console.log('I am In',JSON.stringify(req.body));
    return handlers[req.body.request.intent.name](req, res);
    //let alexa = Alexa.handler(event, context);
    //alexa.appId = 'amzn1.ask.skill.1278c968-0b93-421e-80f8-039f6047063a';
    //alexa.resources = languageStrings;
    //alexa.dynamoDBTableName = 'UltracalQuestions';
    //alexa.registerHandlers(handlers);
    //alexa.execute();
});

app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});

let moment = require('moment');
let matchDay = "09.04.2018";

console.log('OI ', new Date("05-06-2018"));

let a = "02.04.2018";
console.log(new Date(a.substr(0,2)+"-"+a.substr(3,2)+ "-"+ a.substr(6,4) +" "+ "01:00"));