#!/usr/bin/env node

import minimist from 'minimist';
import fetch from 'node-fetch';
import mnt from 'moment-timezone';

const timezone = mnt.tz.guess()

// Show help
function showHelp() {
  console.log("Usage: node script.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE");
  console.log();
  console.log("  -h\t\tShow this help message and exit.");
  console.log("  -n, -s\tLatitude: N positive; S negative.");
  console.log("  -e, -w\tLongitude: E positive; W negative.");
  console.log("  -z\t\tTime zone: uses /etc/timezone by default.");
  console.log("  -d 0-6\tDay to retrieve weather: 0 is today; defaults to 1.");
  console.log("  -j\t\tEcho pretty JSON from open-meteo API and exit.");
  process.exit(0);
}

// Get one week of rain data from open-meteo.com
//function getData() {
//  fetch("https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LONG+"&daily=precipitation_hours&current_weather=true&timezone="+TZ)
//    .then(response => response.json())
//    .then(data => {
//      return data; // Process the JSON data here
//    })
//    .catch(error => {
//      console.log('Error:', error);
//    });
//}

// Output pretty JSON
function showJSON() {
  console.log(JSON.stringify(DATA, null, 2));
  process.exit(0);
}

// Handle errors
function dump(error) {
  console.error(`ERROR: ${error}.`);
  process.exit(1);
}

// Set latitude and longitude option default
let OPT_N = false;
let OPT_S = false;
let OPT_E = false;
let OPT_W = false;

// Set path for resource file
const RESOURCE_PATH = `/home/${process.env.USER}/.galoshrc`;

// Parse command line options
const args = process.argv.slice(2);
let DAY;
let TZ;
let LAT;
let LONG;
let JSON_ONLY = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "-h":
      showHelp();
      break;
    case "-n":
    case "-s":
      OPT_N = true;
      if (OPT_S) {
        dump("Cannot specify LATITUDE twice");
      } else {
         LAT = Number(args[i + 1]);
         if (isNaN(LAT)) {
           dump("Invalid LATITUDE value");
         }
      }
    break;
    case "-e":
    case "-w":
      OPT_E = true;
      if (OPT_W) {
        dump("Cannot specify LONGITUDE twice");
      } else {
        LONG = Number(args[i + 1]);
        if (isNaN(LONG)) {
          dump("Invalid LONGITUDE value");
        }
      }
    break;
    case "-z":
      TZ = args[i + 1];
    break;
    case "-d":
      DAY = Number(args[i + 1]);
      if (isNaN(DAY) || DAY < 0 || DAY > 6) {
        dump("Day option -d must be 0-6");
      }
    break;
    case "-j":
      JSON_ONLY = true;
    break;
  }
}

// Check for resource file and if it doesn't exist
if ((!OPT_N && !OPT_S) || (!OPT_E && !OPT_W)) {
  try {
    const resourceData = require(RESOURCE_PATH);
    LAT = resourceData.LAT;
    LONG = resourceData.LONG;
  } catch (error) {
    dump("Must specify both LATITUDE and LONGITUDE");
  }
}

// Set default time zone from system
if (!TZ) {
  TZ = timezone;
}

// Set default day to tomorrow
if (!DAY) {
  DAY = 1;
}

// Update resource file
//const resourceFileContent = LAT=${LAT} LONG=${LONG};

//execSync(echo "${resourceFileContent}" > ${RESOURCE_PATH});

//function Get(yourUrl){
//    var Httpreq = new XMLHttpRequest(); // a new request
//    Httpreq.open("GET",yourUrl,false);
//    Httpreq.send(null);
//    return Httpreq.responseText;
//}

// Get JSON
//const DATA = JSON.parse(Get("https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LONG+"&daily=precipitation_hours&current_weather=true&timezone="+TZ));
//console.log(DATA);
const getJSON = async url => {
  const response = await fetch(url);
  return response.json(); // get JSON from the response 
}

console.log("Fetching data...");
const DATA = getJSON("https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LONG+"&daily=precipitation_hours&current_weather=true&timezone="+TZ)
  .then(DATA => console.log(DATA));



// Extract current weather variables
//const CURRENT_TIME = DATA.current_weather.time;
//const CURRENT_TEMP = DATA.current_weather.temperature;
//const CURRENT_WIND_SPEED = DATA.current_weather.windspeed;
//const CURRENT_WIND_DIRECTION = DATA.current_weather.winddirection;
//const CURRENT_WEATHERCODE = DATA.current_weather.weathercode;

// Extract forecast variables
//const TIME = DATA.daily.time[DAY];
//const SUNSET = DATA.daily.sunset[DAY];
//const SUNRISE = DATA.daily.sunrise[DAY];
//const PRECIP_HOURS = DATA.daily.precipitation_hours[DAY];
//const PRECIP_SUM = DATA.daily.precipitation_sum[DAY];
//const WIND_GUSTS = DATA.daily.windgusts_10m_max[DAY];
//const WIND_DIRECTION = DATA.daily.winddirection_10m_dominant[DAY];
//const WIND_SPEED = DATA.daily.windspeed_10m_max[DAY];
//const TEMP_LOW = DATA.daily.temperature_2m_min[DAY];
//const WEATHERCODE = DATA.daily.weathercode[DAY];
//const TEMP_HIGH = DATA.daily.temperature_2m_max[DAY];
//const PRECIP_HOURS_UNIT = DATA.daily_units.precipitation_hours;
//const PRECIP_SUM_UNIT = DATA.daily_units.precipitation_sum;
//const WIND_GUSTS_UNIT = DATA.daily_units.windgusts_10m_max;
//const WIND_DIRECTION_UNIT = DATA.daily_units.winddirection_10m_dominant;
//const WIND_SPEED_UNIT = DATA.daily_units.windspeed_10m_max;
//const TEMP_LOW_UNIT = DATA.daily_units.temperature_2m_min;
//const TEMP_HIGH_UNIT = DATA.daily_units.temperature_2m_max;
//const WEATHERCODE_UNIT = DATA.daily_units.weathercode;

// Set day reference phrase
let DAY_PHRASE;
if (DAY == 0) {
DAY_PHRASE = "today";
} else if (DAY >= 2) {
DAY_PHRASE = "in " + DAY + " days";
} else {
DAY_PHRASE = "tomorrow";
}

// Output JSON
if (JSON_ONLY) {
  console.log(JSON.stringify(DATA, null, 2));
  process.exit(0);
}

