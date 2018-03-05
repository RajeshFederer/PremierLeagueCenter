'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alexa = require("alexa-sdk");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

let handlers = {
'standings': function(req,resp) {
        resp.speak('Hello World');
    }
};

app.post('/', (req, res) =>{
    console.log('I am In',JSON.stringify(req.body));
    res.say("hello world");
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
