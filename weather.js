// ---------- weather section ----------
// This uses the free Open-Meteo API, which does not need any API key.

// the city will be shown when the page opens for the first time
const defaultCity = "Pune";

// get elements from the html file
const cityInput = document.getElementById("cityInput");
const getWeatherButton = document.getElementById("getWeatherButton");
const locationButton = document.getElementById("locationButton");
const unitButton = document.getElementById("unitButton");

const weatherMessage = document.getElementById("weatherMessage");
const weatherContent = document.getElementById("weatherContent");

const cityName = document.getElementById("cityName");
const dateText = document.getElementById("dateText");
const iconText = document.getElementById("iconText");
const tempText = document.getElementById("tempText");
const conditionText = document.getElementById("conditionText");
const feelsText = document.getElementById("feelsText");

const humidityText = document.getElementById("humidityText");
const windText = document.getElementById("windText");
const rainText = document.getElementById("rainText");
const uvText = document.getElementById("uvText");
const sunriseText = document.getElementById("sunriseText");
const sunsetText = document.getElementById("sunsetText");

const weatherTip = document.getElementById("weatherTip");

// temperature units : "C" or "F" (remembered in the browser)
let unit = localStorage.getItem("unit") || "C";

// this variable stores the latest weather data
// it is used again when the unit is changed (no need to call the internet again)
let weatherData = null;


// ---------- small helper functions ----------

// here the API gives a number / weather code, this function converts it to text and an emoji
function getWeatherInfo(code, isDay) {
    if (code === 0) {
        if (isDay === 1) {
            return { text: "Clear sky", icon: "☀️" };
        } else {
            return { text: "Clear sky", icon: "🌙" };
        }
    } else if (code === 1) {
        return { text: "Mostly clear", icon: "🌤️" };
    } else if (code === 2) {
        return { text: "Partly cloudy", icon: "⛅" };
    } else if (code === 3) {
        return { text: "Cloudy", icon: "☁️" };
    } else if (code === 45 || code === 48) {
        return { text: "Foggy", icon: "🌫️" };
    } else if (code >= 51 && code <= 57) {
        return { text: "Drizzle", icon: "🌦️" };
    } else if (code >= 61 && code <= 67) {
        return { text: "Rain", icon: "🌧️" };
    } else if (code >= 71 && code <= 77) {
        return { text: "Snow", icon: "❄️" };
    } else if (code >= 80 && code <= 82) {
        return { text: "Rain showers", icon: "🌧️" };
    } else if (code === 85 || code === 86) {
        return { text: "Snow showers", icon: "🌨️" };
    } else if (code >= 95 && code <= 99) {
        return { text: "Thunderstorm", icon: "⛈️" };
    } else {
        return { text: "Unknown", icon: "🌡️" };
    }
}

// check the type of weather (like rain, snow, etc.) based on the above weather code.
function isRain(code) {
    return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

function isSnow(code) {
    return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

// small quotes / messages on the task section, based on the weather
function getWeatherTip(code, temp) {
    if (code >= 95) {
        return "⛈️ Thunderstorm outside! Stay indoors and finish your study or project tasks.";
    } else if (isRain(code)) {
        return "🌧️ It is raining. A good time for indoor tasks like studying or coding. Carry an umbrella if you go out.";
    } else if (isSnow(code)) {
        return "❄️ Snowy weather. Dress warm and plan your tasks indoors.";
    } else if (code === 45 || code === 48) {
        return "🌫️ It is foggy outside. Be careful if your tasks need travelling.";
    } else if (temp >= 35) {
        return "🥵 It is very hot. Drink plenty of water and do outdoor tasks early in the morning or evening.";
    } else if (temp <= 10) {
        return "🧥 It is cold. Wear warm clothes before going out.";
    } else if (code === 0 || code === 1) {
        return "😎 Nice weather! A great day for outdoor tasks like a walk, sports or shopping.";
    } else {
        return "⛅ Pleasant weather. Plan your tasks for the day.";
    }
}

// change temperature from Celsius to Fahrenheit and round it to the nearest int
function convertTemp(celsius) {
    if (unit === "F") {
        return Math.round(celsius * 9 / 5 + 32);
    }
    return Math.round(celsius);
}

// temperature with the symbol, like 28°C
function formatTemp(celsius) {
    return convertTemp(celsius) + "°" + unit;
}

// change "2026-10-11T06:20" into "6:20 AM"
function formatTime(dateTime) {
    const timePart = dateTime.split("T")[1];
    let hours = Number(timePart.split(":")[0]);
    const minutes = timePart.split(":")[1];

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) {
        hours = 12;
    }

    return hours + ":" + minutes + " " + ampm;
}

// UV index level
function getUvLabel(uv) {
    if (uv < 3) {
        return "Low";
    } else if (uv < 6) {
        return "Moderate";
    } else if (uv < 8) {
        return "High";
    } else if (uv < 11) {
        return "Very High";
    } else {
        return "Extreme";
    }
}

// change the text on the unit button when the unit changes from °C to °F / vice vresa
function updateUnitButton() {
    if (unit === "C") {
        unitButton.textContent = "Switch to °F";
    } else {
        unitButton.textContent = "Switch to °C";
    }
}


// ---------- showing the weather on the page ----------

// show a message (loading or error)
function showMessage(message) {
    weatherMessage.textContent = message;
    weatherContent.classList.add("hidden");
}

// fill the weather section using the data stored in weatherData
function showWeather() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const info = getWeatherInfo(current.weather_code, current.is_day);

    cityName.textContent = weatherData.name + (weatherData.country ? ", " + weatherData.country : "");
    dateText.textContent = new Date(current.time).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
    iconText.textContent = info.icon;
    tempText.textContent = formatTemp(current.temperature_2m);
    conditionText.textContent = info.text;
    feelsText.textContent = "Feels like " + formatTemp(current.apparent_temperature);

    // small cards
    humidityText.textContent = current.relative_humidity_2m + "%";
    windText.textContent = Math.round(current.wind_speed_10m) + " km/h";
    rainText.textContent = daily.precipitation_probability_max[0] + "%";

    const uv = daily.uv_index_max[0];
    uvText.textContent = Math.round(uv) + " (" + getUvLabel(uv) + ")";

    sunriseText.textContent = formatTime(daily.sunrise[0]);
    sunsetText.textContent = formatTime(daily.sunset[0]);

    // tip / message for the to-do list section, based on the weather and temperature
    weatherTip.textContent = getWeatherTip(current.weather_code, current.temperature_2m);

    // hide the message and show the weather
    weatherMessage.textContent = "";
    weatherContent.classList.remove("hidden");
}


// ---------- getting the weather from the internet ----------
// async/await is used because getting data takes some time

// get the weather using latitude and longitude
async function getWeatherByCoords(lat, lon, name, country) {
    showMessage("Loading weather...");

    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
            "&longitude=" + lon +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m" +
            "&daily=sunrise,sunset,uv_index_max,precipitation_probability_max" +
            "&timezone=auto&forecast_days=1";

        const response = await fetch(url);
        const data = await response.json();

        // save the data so we can use it again when the unit changes
        weatherData = {
            name: name,
            country: country,
            current: data.current,
            daily: data.daily
        };

        showWeather();

    } catch (error) {
        // this message will pop up when there is no internet connection or something goes wrong
        showMessage("Could not get the weather. Check your internet connection.");
    }
}

// get the weather using a city name
async function getWeather(city) {
    showMessage("Loading weather...");

    try {
        // step 1: find the latitude and longitude of the city
        const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1";
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        // if no city is found, results will not be there
        if (!geoData.results || geoData.results.length === 0) {
            showMessage("City not found. Please check the spelling.");
            return;
        }

        const place = geoData.results[0];

        // save the city to the local storage, so it opens again next time
        localStorage.setItem("lastCity", place.name);

        // step 2: get the weather of that place
        getWeatherByCoords(place.latitude, place.longitude, place.name, place.country);

    } catch (error) {
        showMessage("Could not get the weather. Check your internet connection.");
    }
}


// ---------- button functions ----------

// when the Search button is clicked
function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        showMessage("Please enter a city name.");
        return;
    }

    getWeather(city);
}

// when the My Location button is clicked
function getMyLocation() {
    if (!navigator.geolocation) {
        showMessage("Your browser does not support location.");
        return;
    }

    showMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
        function (position) {
            cityInput.value = "";
            getWeatherByCoords(position.coords.latitude, position.coords.longitude, "Your Location", "");
        },
        function () {
            showMessage("Could not get your location. Allow location access or search for a city.");
        }
    );
}

// when the unit button is clicked (°C <--> °F) (toggle)
function toggleUnit() {
    if (unit === "C") {
        unit = "F";
    } else {
        unit = "C";
    }

    localStorage.setItem("unit", unit);
    updateUnitButton();

    // show the same weather again in the new unit
    if (weatherData !== null) {
        showWeather();
    }
}


// ---------- events ----------
getWeatherButton.addEventListener("click", searchWeather);
locationButton.addEventListener("click", getMyLocation);
unitButton.addEventListener("click", toggleUnit);

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});


// ---------- when the page opens ----------
updateUnitButton();

// show the last searched city (or the default city) when the page opens. This will also show the weather for thar city.
const savedCity = localStorage.getItem("lastCity");
const startCity = savedCity || defaultCity;
cityInput.value = startCity;
getWeather(startCity);
