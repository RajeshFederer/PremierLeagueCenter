'use strict';
let async = require('async');
let moment = require('moment');

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
    let slots = req.body.request.intent.slots;

    getSlotValue(standingsJsonData.languageModel.types, slots)
    .then((finalSlotData)=>{
        let fromDate = moment().format('DD-MM-YYYY');
        if(finalSlotData.matchDay){
            fromDate = moment(finalSlotData.matchDay).format('DD-MM-YYYY')
        }
        console.log('YEAH ', finalSlotData);
        footballApi.getSchedule(finalSlotData.team.id, fromDate)
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
                if(slotObj.name != "matchDay"){
                    let res = slotObj.values.find(sd => {
                        return sd.name.synonyms.toString().toLowerCase().split(",").indexOf(reqSlotValue.toString().toLowerCase()) !== -1;
                    });
                    if(res){
                        finalSlotData[slotObj.name] = {
                            id : slotObj.id || null, 
                            value :res.name.value
                        };
                    }
                } else {
                    console.log('I am In ', reqSlots[slotObj.name]);
                    finalSlotData[slotObj.name] = {
                        id : reqSlots[slotObj.name].id || null, 
                        value :reqSlots[slotObj.name].value
                    };
                }
            }
            return cback();
        }, function(err, resp){
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
            let data = filterTable(standings, "team_name", finalSlotData.team.value);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
            });
        } else{
            let position = 1;
            if(finalSlotData.tableSide){
                position = finalSlotData.tableSide.value.toLowerCase() === "bottom" ? 20 :1;
                if(finalSlotData.positions){
                    position = finalSlotData.tableSide.value.toLowerCase() === "bottom" ? 20 -finalSlotData.positions.value : finalSlotData.tableSide.value;
                }
            } else if(finalSlotData.positions){
                position = finalSlotData.positions.value;
            }
            let data = filterTable(standings, "position", position);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost " + data.overall_l +" matches and drawn " + data.overall_d +" matches."
            });
        }
    });
}

function formScheduleResponse(schedules, finalSlotData){
    console.log('SLOT DATA ',finalSlotData);
    return new Promise((resolve, reject) =>{
        if(finalSlotData.team){
            let data = filterTable(standings, "team_name", finalSlotData.team.value);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
            });
        } else{
            let position = 1;
            if(finalSlotData.tableSide){
                position = finalSlotData.tableSide.value.toLowerCase() === "bottom" ? 20 :1;
                if(finalSlotData.positions){
                    position = finalSlotData.tableSide.value.toLowerCase() === "bottom" ? 20 -finalSlotData.positions.value : finalSlotData.tableSide.value;
                }
            } else if(finalSlotData.positions){
                position = finalSlotData.positions.value;
            }
            let data = filterTable(standings, "position", position);
            resolve({
                "type": "PlainText",
                "text": data.team_name +" are number"+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost " + data.overall_l +" matches and drawn " + data.overall_d +" matches."
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
        return element[key] === value.toString();
    });
    data = data ? data : standings.find(element =>{
        return element.position === "1";
    });
    return data;
}

module.exports = skills;