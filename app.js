import { handler } from './C:/Users/39850/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/alexa-sdk';

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
    return handler[req.body.request.intent.name](req, res);
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
