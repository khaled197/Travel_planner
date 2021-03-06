const fetch = require("node-fetch");
import img from '../media/pyramids.jpg';
import {
    getGeoData
} from './getGeonamesData';
const CURR_WEATHER_URL = 'https://api.weatherbit.io/v2.0/current?city={city}&key={api}'
const FUT_WEATHER_URL = 'https://api.weatherbit.io/v2.0/forecast/daily/days={days}?city={city}&key={api}'
const WEATHER_API_KEY = '07350895619f406cb145eea1f45a26cc'
const PIXABAY_URL = 'https://pixabay.com/api/?key={api}&category=places&q={city}&image_type=photo&pretty=true'
const PIXABAY_API_KEY = '16738849-0b85338957004177a866bb1c5'

// The primary endPoint object
let endPoint = {};

/**
 * @description handle the submission process
 * @param {event} eventObject -
 */
async function handleSubmit(event) {
    event.preventDefault();
    let city_name = document.getElementById('location').value;
    let date = document.getElementById('date').value;
    let diffDays = getDateDiff(date);
    let data = await getGeoData(city_name)
    endPoint['city'] = city_name;
    endPoint['countryName'] = data['countryName'];
    endPoint['lat'] = data['lat'];
    endPoint['lng'] = data['lng'];
    await getWeatherData(city_name, diffDays)
    await getPixabayPhoto(city_name)
    await updateUI()
}



/**
 * @description gets data from the weatherbit server
 * @param {city} string - the city which the user wants to travel to
 * @param {days} integer - the number of days between today and the day of travelling.
 */
const getWeatherData = async (city, days) => {
    let url = "";
    let index = 0;
    if (days < 7) {
        url = CURR_WEATHER_URL.replace("{city}", city).replace("{api}", WEATHER_API_KEY);
    } else {
        index = days <= 16 ? days - 1 : 15;
        url = FUT_WEATHER_URL.replace("{city}", city).replace("{api}", WEATHER_API_KEY).replace('{days}', index);
    }
    const response = await fetch(url)

    try {
        const data = await response.json()
        // console.log("here" + data['data'][index]['temp']);
        // console.log("here" + data['data'][index]['weather']['description']);
        endPoint['temp'] = data['data'][index]['temp'];
        endPoint['description'] = data['data'][index]['weather']['description'];
    } catch (event) {
        console.log("Error getting the  weather data")
    }
}

/**
 * @description gets the data from the pixabay server
 * @param {city} string - the city which the user wants to travel to.
 */
const getPixabayPhoto = async (city) => {
    let c = encodeURI(city);
    let url = PIXABAY_URL.replace("{city}", c).replace("{api}", PIXABAY_API_KEY);
    const response = await fetch(url)
    try {
        const data = await response.json()
        console.log(data);
        if (data['total'] != 0) {
            console.log(data['hits'][0]["webformatURL"]);
            let imgURL = data['hits'][0]["webformatURL"].replace('_640', '_340');
            console.log(imgURL);
            endPoint['imgURL'] = imgURL;
        } else {
            url = PIXABAY_URL.replace("{city}", encodeURI(endPoint['countryName'])).replace("{api}", PIXABAY_API_KEY);
            console.log(url);
            response = await fetch(url)
            data = await response.json()
            if (data['total'] != 0) {
                imgURL = data['hits'][0]["webformatURL"].replace('_640', '_340');
                endPoint['imgURL'] = imgURL;
            } else {
                endPoint['imgURL'] = img;
            }
        }
    } catch (event) {
        console.log("Error getting the img");
    }
}


/**
 * @description gets the default values of the html elements.
 */
function setDefaultAttributes() {
    document.getElementById('img').setAttribute('src', img);
    let a = new Date();
    let d = {
        year: a.getFullYear(),
        month: (a.getMonth() + 1) >= 10 ? (a.getMonth() + 1) : "0" + (a.getMonth() + 1),
        day: a.getDate() >= 10 ? a.getDate() : ('0' + a.getDate())
    }
    let startDate = d.year + "-" + d.month + "-" + d.day;
    document.getElementById('date').setAttribute("min", startDate);
}

const updateUI = async () => {
    document.getElementById('img').setAttribute('src', endPoint['imgURL']);
    document.getElementById('result-div').innerHTML = `<p>${endPoint['city']}, ${endPoint['countryName']} is ${endPoint['diffDays']} days away.</p><p>Typical weather for then is: <br> Temperature: ${endPoint['temp']} <br> ${endPoint['description']}</p>`
}

function removeTrip() {
    document.getElementById('img').setAttribute('src', img);
    document.getElementById('result-div').innerHTML = "";
    endPoint = {};
}

/**
 * @description posts the  data to the server endpoint.
 * @param {data} Object
 */
const postData = async (data) => {
    const response = await fetch('/addTripInfo', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        // Body data type must match "Content-Type" header
        body: JSON.stringify(data),
    })

    try {
        const newData = await response.json();
        return newData;
    } catch (error) {
        console.log('error posting Data');
    }
}

/**
 * @description posts the  data to the server endpoint.
 * @param {data} Object
 */
const getData = async () => {
    const response = await fetch('/getTripInfo');
    try {
        const newData = await response.json();
        return newData;
    } catch (error) {
        console.log('error getting Data from the server');
    }
}


/**
 * @description gets the number of days between today and the day of travelling.
 * @param {fdate} dateObject - the date of travelling.
 */
function getDateDiff(fDate) {
    let a = new Date();
    let currDate = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    let dateArray = fDate.split('-');
    const futDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
    const diffTime = Math.abs(futDate - currDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    endPoint['diffDays'] = diffDays;
    console.log(diffDays);
}

export {
    handleSubmit,
    removeTrip,
    setDefaultAttributes,
    endPoint
}
