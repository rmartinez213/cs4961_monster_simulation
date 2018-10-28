var express = require('express');   //Framework providing enhanced webfeatures, etc.(framework)
var socket = require('socket.io');  //Socket I/O for seemless multiusers (library)
const fs = require('fs');           //To read file (library)
var simulating = false;
let obj = [];
let id = randomNumber(1000, 1500); //starting id value (start year) based on following random number


console.log("test")

// App setup
var app = express(); 
var server = app.listen(4001, function(){
     console.log('Server is running. On port 4001');
});


//Static files
app.use(express.static('public'));

//Socket setup
var io = socket(server);



io.on('connection',function(socket){ // Fires callback function when client connects
	if(simulating){
        console.log('Simulating to new client...');  
	}

	else{
		console.log('Starting simulation...');
		console.log('Simulating to first client connected');
        simulating = true;
        readMe();
	}
});


//Sends data to clients [every 5 seconds]
function generate(){

    id++; //increment for next data entry (monster attack)

	io.sockets.emit('simulated-data', obj[id]); 
    console.log("Sending again...")
    console.log(obj[id]); //Test purposes
	setTimeout(generate, 5000);
}


//Reads the file and parses everything into an object
function readMe(){
    obj = JSON.parse(fs.readFileSync('public/quakes.json', 'utf8'));
    setTimeout(generate, 2000)
}

//Randomly selects start year
function randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}