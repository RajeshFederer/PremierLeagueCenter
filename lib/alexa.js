'use strict';
let async = require('async');
let footballApi = require('./service/footballApi');
let standingsJsonData = require('./data/standings.json');
let defaultResponse = require('./data/defaultResponse.json');
let skills = {};

skills.standings = (req, res) =>{
    let slots = req.body.request.intent.slots;

    getSlotValue(standingsJsonData.languageModel.types, slots)
    .then((finalSlotData)=>{
        console.log('YEAH ', finalSlotData);
        footballApi.getStandings()
        .then(body =>{
            formStandingsResponse(body,finalSlotData).then((resObj) =>{
                return res.json({"response": {
                    "outputSpeech": resObj,
                    "shouldEndSession": false
                }});
            })
            .catch((e) =>{
                console.log('1',e);
                return res.json(defaultResponse.default.standings);
            })
        })
        .catch(e =>{
            console.log('2',e);
            return res.json(defaultResponse.default.standings);
        })
    }).catch((e) =>{
        console.log('3',e);
        return res.json(defaultResponse.default.standings);
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

/** return slot object after mapping with synonyms
 * 
 * @param {*} slotValues Array - Array of slots defined in alexa intents
 * @param {*} reqSlots Object - Slots recieved from Request
 */
function getSlotValue(slotValues, reqSlots){
    return new Promise((resolve, reject) =>{
        let finalSlotData = {};
        async.forEachSeries(slotValues, function(slotObj, cback){
            let reqSlotValue = reqSlots[slotObj.name] ? reqSlots[slotObj.name].value: null;
            if (reqSlotValue){
                let res = slotObj.values.find(sd => {
                    console.log(sd.name.synonyms, reqSlotValue, sd.name.synonyms.indexOf(reqSlotValue));
                    return sd.name.synonyms.indexOf(reqSlotValue) !== -1;
                });
                console.log('RESPPPP', res);
                if(res){
                    finalSlotData[slotObj.name] = res.name.value;
                }
            }
            return cback();
        }, function(err, resp){
            console.log('OH', finalSlotData);
            resolve(finalSlotData);
        })
    });
}

/** forms & returns response of standings intent
 * 
 * @param {*} standings - Array - standings array from API
 * @param {*} finalSlotData - object - Slots recieved from Request
 */
function formStandingsResponse(standings, finalSlotData){
    console.log('SLOT DATA ',finalSlotData);
    return new Promise((resolve, reject) =>{
        if(finalSlotData.team){
            let data = filterTable(standings, "team_name", finalSlotData.team);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
            });
        } else{
            let position = 1;
            if(finalSlotData.tableSide){
                let position = finalSlotData.tableSide == "Bottom" ? 20 :1;
                if(finalSlotData.positions){
                    position = finalSlotData.tableSide == "Bottom" ? 20 -finalSlotData.positions : finalSlotData.tableSide;
                }
            } else if(finalSlotData.positions){
                position = finalSlotData.positions;
            }
            let data = filterTable(standings, "position", position);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
            });
        }
    });
}

/**filters and returns the required team data
 * 
 * @param {*} standings - Array - standings array from API
 * @param {*} key  - String - filter key
 * @param {*} value - String - filter value
 */
function filterTable(standings,key, value){
    let data = standings.find(element =>{
        console.log('ELE ', element, element.position, typeof element.position, value, typeof value);
        return element[key] === value.toString();
    });
    console.log('1', data, key, value);
    if(data) {
        return data;
    } else {
        data = standings.find(element =>{
            return element.position === "1";
        });
        return data;
    }
}

module.exports = skills;