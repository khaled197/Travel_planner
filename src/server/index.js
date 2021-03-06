// Setup empty JS object to act as endpoint for all routes
let tripInfo = {
    'city': "",
    'countryName': "",
    'lat': "",
    'lng': "",
    'temp': "",
    'description': "",
    'diffDays': "",
    'imgURL': ""
};

let path = require('path')

// Require Express to run server and routes
const express = require('express')
const bodyParser = require('body-parser')

// Cors for cross origin allowance
const cors = require('cors');

// Start up an instance of app
const app = express()

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'))

/**
 * @description sends the homepage to the client
 * @param {req} object
 * @param {res} object
 */
app.get('/', function(req, res) {
    res.sendFile('index.html', path.resolve(__dirname, '../../dist'));
});

// designates what port the app will listen to for incoming requests
app.listen(8085, function() {
    console.log('Example app listening on port 8085!')
});

app.post('/addTripInfo', addTripInfo);
app.get('/getTripInfo', getTripInfo);

/**
 * @description posts data to the endpoint
 * @param {req} object
 * @param {res} object
 */
function addTripInfo(req, res) {
    tripInfo = {
        'city': req.body['city'],
        'countryName': req.body['countryName'],
        'lat': req.body['lat'],
        'lng': req.body['lng'],
        'temp': req.body['temp'],
        'description': req.body['description'],
        'diffDays': req.body['diffDays'],
        'imgURL': req.body['imgURL']
    }
    res.send(tripInfo);
}

/**
 * @description gets data from the server
 * @param {req} object
 * @param {res} object
 */
function getTripInfo(req, res) {
    res.send(tripInfo);
}

module.exports = app;
