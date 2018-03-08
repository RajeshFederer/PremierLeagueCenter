'use strict';
let async = require('async');
let moment = require('moment');
let _ = require('underscore');

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
                return res.json({response:resObj});
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
        console.log('FINAL ', finalSlotData);
        if(!finalSlotData.team){
            return res.json({"response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": "For which team you are rooting for"
                },
                "directives": [{
                      "type": "Dialog.ElicitSlot",
                      "slotToElicit": "team",
                      "updatedIntent": req.body.request.intent
                }],
                "shouldEndSession": false
            }});
        }
        
        let fromDate = moment().format('DD-MM-YYYY');
        if(finalSlotData.matchDay){
            if(moment().isAfter(finalSlotData.matchDay.value)){
                return res.json({"response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": "You are asking about Finished match. Tell me a different date"
                    },
                    "directives": [{
                          "type": "Dialog.ElicitSlot",
                          "slotToElicit": "matchDay",
                          "updatedIntent": req.body.request.intent
                    }],
                    "shouldEndSession": false            
                }});
            } else {
                fromDate = finalSlotData.matchDay.value;
            }
        }
        console.log('YEAH ', finalSlotData, fromDate);
        footballApi.getSchedule(finalSlotData.team.id, fromDate)
        .then(body =>{
            console.log('OI',body.code);
            if(body.code){
                let resObj = {
                    "type": "PlainText",
                    "text": "OOPS! No matches"
                }
                if(finalSlotData.team) {
                    resObj.text = "OOPS! No matches for" + finalSlotData.team.value
                }
                return res.json({"response": {
                        "outputSpeech": resObj,
                        "shouldEndSession": false
                }});
            } else{
                formScheduleResponse (body, finalSlotData, fromDate).then((resObj) =>{
                    return res.json({"response": {
                        "outputSpeech": resObj,
                        "shouldEndSession": false
                    }});
                })
                .catch((e) =>{
                    console.log('1',e);
                    return res.json(defaultResponse.default.standings);
                })
            }
        })
        .catch(e =>{
            let resObj = {
                "type": "PlainText",
                "text": "This match already finished"
            };
            return res.json({"response": {
                    "outputSpeech": resObj,
                    "shouldEndSession": false
            }});
        })
    }).catch((e) =>{
        console.log('3',e);
        return res.json(defaultResponse.default.standings);
    })
};

skills['AMAZON.HelpIntent'] = (req, res) =>{
    return res.json({
        "response":{
            "outputSpeech": {
                "type": "PlainText",
                "text": "Premier League is Best in the world. I can help you to find out Standings, fixtures and Results.",
                "ssml": "<speak>Premier League is Best in the world. I can help you to find out Standings, fixtures and Results.</speak>"
            }
        }
    });
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
                let filtered = slotObj.values.find(sd => {
                    return sd.name.synonyms.toString().toLowerCase().split(",").indexOf(reqSlotValue.toString().toLowerCase()) !== -1;
                });
                if(filtered){
                    console.log('STRAIGHT', filtered, slotObj.name);
                    let slotId = filtered.id || null;
                    if(reqSlots[slotObj.name].resolutions){
                        slotId = reqSlots[slotObj.name].resolutions.resolutionsPerAuthority[0].values[0].value.id;
                    }
                    finalSlotData[slotObj.name] = {
                        id : slotId, 
                        value :filtered.name.value
                    };
                }
            }
            return cback();
        }, function(err, resp){
            if(reqSlots["matchDay"]){
                finalSlotData["matchDay"] = {
                    id : null,
                    value : moment(reqSlots["matchDay"].value).format('DD-MM-YYYY')
                }
            }
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
                "outputSpeech":{
                    "type": "PlainText",
                    "text": data.team_name +" are number "+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
                },
                "card" :{
                    "type":"Standard",
                    "title": "Team : "+ data.team_name + "Position : " + data.position,
                    "text": "Points : " + data.points + "\n Total Wins :" + data.overall_w + "\n Total Loss :" + data.overall_l + "\n Total Draws :" + data.overall_d,
                    "image" :"http://lh3.googleusercontent.com/-CA_VVPfIpEI/VrynrVH9BOI/AAAAAAAAB58/246lmnM9Cvg/s1600/Premier-League-branding-ehroo.jpg"
                },
                "shouldEndSession": false
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
                "outputSpeech":{
                    "type": "PlainText",
                    "text": data.team_name +" are number "+ data.position +" in the Premier League with "+ data.points+" points. They have won "+ data.overall_w +" matches and lost" + data.overall_l +" matches and drawn" + data.overall_d +" matches."
                },
                "card" :{
                    "type":"Standard",
                    "title": "Team : "+ data.team_name + "Position : " + data.position,
                    "text": "Points : " + data.points + "\n Total Wins :" + data.overall_w + "\n Total Loss :" + data.overall_l + "\n Total Draws :" + data.overall_d,
                    "image" :"http://lh3.googleusercontent.com/-CA_VVPfIpEI/VrynrVH9BOI/AAAAAAAAB58/246lmnM9Cvg/s1600/Premier-League-branding-ehroo.jpg"
                },
                "shouldEndSession": false
            });
        }
    });
}

function formScheduleResponse(schedules, finalSlotData){
    if(finalSlotData.vsTeam && finalSlotData.vsTeam.id){
        schedules = _.filter(schedules,(sechd) =>{
            return sechd.localteam_id === finalSlotData.vsTeam.id || sechd.visitorteam_id === finalSlotData.vsTeam.id
        });    
    }
    
    if(schedules && schedules.length){
        console.log('SLOT DATA ',finalSlotData);
        _.each(schedules, (sched) =>{
            sched.formatted_date = new Date(sched.formatted_date.substr(6,4)+"-"+sched.formatted_date.substr(3,2)+"-"+sched.formatted_date.substr(0,2) + " "+sched.time)
            console.log(sched);
        });
        schedules = _.sortBy(schedules,"formatted_date");
        let matchData = schedules[0];
        console.log('POPO', matchData);
        let fromTeamId = finalSlotData.team.id, isHome = false;
        if(fromTeamId === matchData.localteam_id){
            isHome = true;
        }
        
        let text = "";
        if(isHome){
            text = matchData.localteam_name + " will play "+ matchData.visitorteam_name + " at home on " + matchData.formatted_date;
        } else{
            text = matchData.visitorteam_name + " will play "+ matchData.localteam_name + " at away on " + matchData.formatted_date;
        }
        return new Promise((resolve, reject) => {
            resolve({
                "type": "PlainText",
                "text": text
            });
        });
    } else{
        let resObj = {
            "type": "PlainText",
            "text": "This match already finished"
        };
        return res.json({"response": {
                "outputSpeech": resObj,
                "shouldEndSession": false
        }});        
    }
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
