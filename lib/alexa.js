
let skills = {};

skills.standings = (req, res) =>{
    
    return res.json({"response": {
        "outputSpeech": {
          "type": "PlainText",
          "text": "Hello Jesh"
        },
        "shouldEndSession": false
    }});
};

module.exports = skills;