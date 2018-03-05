let footballApi = require('./service/footballApi');

let skills = {};

skills.standings = (req, res) =>{
    footballApi.getStandings()
    .then(body =>{
        console.log('FOOTBALL ',JSON.stringify(body));
        return res.json({"response": {
            "outputSpeech": {
              "type": "PlainText",
              "text": "Hello Jesh"
            },
            "shouldEndSession": false
        }});
    })
    .catch(e =>{
        return res.json({"response": {
            "outputSpeech": {
              "type": "PlainText",
              "text": "Premier League is currently updating the table. Please try agin later"
            },
            "shouldEndSession": false
        }});
    })
};

skills.schedule = (req, res) =>{
    return res.json({"response": {
        "outputSpeech": {
          "type": "PlainText",
          "text": "Hello Jesh"
        },
        "shouldEndSession": false
    }});
};

module.exports = skills;