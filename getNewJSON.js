//var express = require('express');
var fs = require('fs');

let eventObj = [];
//let eventid = randomNumber(1000, 1500);

let monsterid;
let reportid;
let combineObj = [];
let result;

console.log("test from getNewJSON");

/**Randomly selects start year*/
function randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/** get monsterid for monster.json*/
function getRandomMonsterID(){
    monsterObj = JSON.parse(fs.readFileSync('public/monsters.json','utf8'));

    /**for different json format - "{xxx:[{}]}"**/
    //for (m in monsterObj){
        //n = Math.floor(Math.random() * monsterObj[x].length) +1;
    //}
    
    n = Math.floor(Math.random() * monsterObj.length);
    if (n == 0)
        getRandomMonsterID();
    else
        monsterid = n ;
}

/**get reportid for quakes.json **/
function getRandomReportID(){
    reportObj = JSON.parse(fs.readFileSync('public/reporters.json','utf8'));

    /**for different json format - "{xxx:[{}]}"**/
    //for (x in reportObj){
        //y = Math.floor(Math.random() * reportObj[x].length) + 1;
    //}

    y = Math.floor(Math.random() * reportObj.length);

    if (y == 0)
        getRandomReportID();
    else
        reportid = y;
}

function readMe(){
    eventObj = JSON.parse(fs.readFileSync('public/quakes.json', 'utf8'));
}

function createNewJSON(result){      
        if(fs.existsSync('public/combined.json'))//if(exists)
        {                       
            fs.readFile('public/combined.json', function readFileCallback(err, data){            
                if(err)
                {
                    console.log('error is: ', err);
                }
                else
                {                                       
                    combineObj = JSON.parse(data);
                    combineObj.push(result);
                    var json = JSON.stringify(combineObj);
                    fs.writeFile('public/combined.json', json, function (err){if (err) throw err; console.log("It's saved!");} );                                                          
                }
            })
        }
        else
        {    
            console.log("file not exists")
            combineObj.push({
                "A": "I_D",
                "B": "FLAG_TSUNAMI",
                "C": "YEAR",
                "D": "MONTH",
                "E": "DAY",
                "F": "HOUR",
                "G": "MINUTE",
                "H": "SECOND",
                "I": "EQ_MAG_ML",
                "J": "INTENSITY",
                "K": "COUNTRY",
                "L": "LOCATION_NAME",
                "M": "LATITUDE",
                "N": "LONGITUDE",
                "O": "DEATHS",
                "P": "MISSING",
                "Q": "INJURIES",
                "R": "DAMAGE_MILLIONS_DOLLARS",
                "S": "HOUSES_DESTROYED",
                "T": "HOUSES_DAMAGED",
                "monsterId": "MONSTER_ID",
                "monsterName": "MONSTER_NAME",
                "Type": "MONSTER_TYPE",
                "reporterId": "REPORTER_ID",
                "email": "REPORTER_EMAIL"
              });
            
            combineObj.push(result);
            var json = JSON.stringify(combineObj);
            fs.writeFile('public/combined.json', json, function (err){if (err) throw err; console.log("It's created!");});            
        } 
}

function merge(eventObj, monsterObj, reportObj)
{
    result = Object.assign(eventObj, monsterObj, reportObj);
}

exports.start = function() { //<== comment this once if can't create combined.json from index
//function start(){  //<== uncomment this once if can't create combined.json from index
    readMe();
    getRandomMonsterID();
    getRandomReportID();
    merge(eventObj[randomNumber(1000,1500)], monsterObj[monsterid - 1],reportObj[reportid - 1]);
    createNewJSON(result);
}

//start();  ..<== uncomment this once if can't create combined.json from index
