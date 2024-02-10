require('dotenv').config();

const PORT = process.env.PORT || 3000;
const data = require('./data/weather.json');

const cors = require('cors');
const express = require('express');
const app = express();

//define middleware and routes
app.use(cors());//share with everyone when theres not argument

app.get('/weather', (request, response) => {
  let { searchQuery } = request.query;
  console.log('searchQuery', searchQuery);
  const cityToFind = data.find(cityObj => cityObj.city_name.toLowerCase() === searchQuery.toLowerCase());

  if (!cityToFind) {
    response.status(404).json({error: 'City not found'});
    return;
  }

  let eachDayOfWeatherObj = cityToFind.data.map(eachDay => new Forecast(eachDay));
  let forecasts = eachDayOfWeatherObj.map(forecast => forecast.getForecast());

  response.json(forecasts);
});

class Forecast {
  constructor(weatherObj) {
    this.lowTemp = weatherObj.low_temp;
    this.highTemp = weatherObj.high_temp;
    this.description = weatherObj.weather.description;
    this.date = weatherObj.datetime;
  }
  getForecast() {
    return {
      date: this.date,
      description: this.description,
      lowTemp: this.lowTemp,
      highTemp: this.highTemp
    };
  }
}

app.get('*', (request, response) => {
  response.status(404).send('not found');
});

app.get('/async-error', (request, response, next) => {
  try {
    throw new Error('some async error happened');
  } catch (error) {
    next(error);
  }
  response.send('async error');
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).send(error.message);
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
