//Create a connection
var socket = io.connect('http://localhost:4001');


socket.on('simulated-data', function (data){

    //console.log(data); //print whole data object (test purposes) 

    var id = data.A;
    var flag_tsunami = data.B;
    var year = data.C;
    var month = data.D;
    var day = data.E;
    var hour = data.F;
    var minute = data.G;
    var second = data.H;
    var magnitude = data.I;
    var intensity = data.J;
    var country = data.K;
    var location_name = data.L;
    var latitude = data.M;
    var longitude = data.N;
    var deaths = data.O;
    var injuries = data.Q;
    
    var displaydata = id + " " + flag_tsunami + " " + year + " " + month + " " + day + " " + hour + " " + minute + " " + second + " " + country + " " + location_name; //Test purposes
    
    output.innerHTML = displaydata ; //Display data onto html page

    document.write('<px-map-marker-static id="Godzilla" style="display:none;" lat="-44.245866" lng="-13.772970" type="info"> <px-map-popup-data title="Godzilla" data=\'{"Kills":"2000","damage":"etc","magnitude":"8.0"}\'> </px-map-popup-data> </px-map-marker-static>');

  
    
});


    // obj[0].A - "ID"
    // obj[0].B - "FLAG_TSUNAMI"
    // obj[0].C - "YEAR"
    // obj[0].D - "MONTH"
    // obj[0].E - "DAY"
    // obj[0].F - "HOUR"
    // obj[0].G - "MINUTE"
    // obj[0].H - "SECOND"
    // obj[0].I - "EQ_MAG_ML"
    // obj[0].J - "INTENSIT"
    // obj[0].K - "COUNTRY"
    // obj[0].L - "LOCATION_NAME"
    // obj[0].M - "LATITUDE"
    // obj[0].N - "LONGITUDE"
    // obj[0].O - "DEATHS"
    // obj[0].P - "MISSING"
    // obj[0].Q - "INJURIES"
    // obj[0].R - "DAMAGE_MILLIONNS_DOLLARS"
    // obj[0].S - "HOUSES_DESTROYED
    // obj[0].T - "HOUSES_DAMAGED"