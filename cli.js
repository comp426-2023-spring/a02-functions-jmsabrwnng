#!/usr/bin/env node

import minimist from 'minimist';
import fetch from 'node-fetch';
import mnt from 'moment-timezone';

const args = minimist(process.argv.slice(2));

const helpText = `
Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.
`;

if (args.h) {
  console.log(helpText);
  process.exit(0);
}

const latitude = args.n || args.s;
const longitude = args.e || args.w;
const timezone = args.z || mnt.tz.guess();
const day = args.d || 1;

const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_hours&current_weather=true&timezone=${timezone}`;

async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
}

function getWeatherData(data) {
  if (args.j) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  const precipitationHours = data.daily.precipitation_hours[day];

  if (precipitationHours > 0) {
    console.log('You might need your galoshes');
  } else {
    console.log('You will not need your galoshes');
  }
}

function formatDayString(day) {
  if (day === 0) {
    return 'today.';
  } else if (day === 1 || !day) {
    return 'tomorrow.';
  } else if (day > 1 && day <= 6) {
    return `in ${day} days.`;
  } else {
    console.error('Invalid day specified.');
    process.exit(1);
  }
}

async function run() {
  const data = await fetchData();
  const dayString = formatDayString(day);
  console.log(`Weather ${dayString}`);
  getWeatherData(data);
}

run();
