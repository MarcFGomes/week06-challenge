//My API key
const  apiKey = "b85ce65762cbc1b5c430f94bad59fafc";

//Parent where to append the buttons
let fatherButton = document.getElementById("left-side-buttons");



//Load localStorage
let citiesSearched = JSON.parse(localStorage.getItem('citiesSearched')) || [];


function saveState() {
    localStorage.setItem('citiesSearched', JSON.stringify(citiesSearched));
}


//function for search button
const handleSearch = () =>{
     let city = document.getElementById('city').value.trim();

    if (!city) {
         alert("Write a city name dumbass")
    } else {
        city = normalize(city);
        addSearch(city);
        render();
        saveState();
       
        fetchCoordinate(city)
          .then(coords => {
                fetchWeatherForecast(coords.lat, coords.lon);
                fetchWeatherCurrent(coords.lat, coords.lon, city);
            });
        document.getElementById('city').value=""
    }

};


//Searching from previous value
const handleQuickSearch = (city) =>{

    //Reorganize the array
    const indexToMove = citiesSearched.indexOf(city);
    citiesSearched.splice(indexToMove, 1);
    citiesSearched.push(city);

    render();
    saveState();
    
    fetchCoordinate(city)
        .then(coords => {
            fetchWeatherForecast(coords.lat, coords.lon);
            fetchWeatherCurrent(coords.lat, coords.lon, city);
        });
    document.getElementById('city').value=""
    

};


//Create the button for the city searched
const createButton = (citySearch) => {
    let div = document.createElement("div");
    let btn = document.createElement("button");

    btn.textContent = citySearch;
    btn.addEventListener("click", () => handleQuickSearch(citySearch));

    div.appendChild(btn);
    return div;
};


//Render the city searched in a button
const render = () => {

    fatherButton.innerHTML = "";
    
    for(let i=citiesSearched.length-1; i>=0; i--){
        let cityButton = createButton(citiesSearched[i]);

        //console.log(`User ${citiesSearched[i]}:`);

        fatherButton.append(cityButton);

    }


    return;
}

//Add city searched in my array
const addSearch = (search) => {

    if (citiesSearched.includes(search)) {
        alert("You already search this city dumbass. Check the quick search options")
        return;
    }

    if(citiesSearched.length<8){
        citiesSearched.push(search);
        //console.log(`my array ${citiesSearched}`)
    }
    else {
        citiesSearched.shift();
        citiesSearched.push(search);
        //console.log(`my array is ${citiesSearched}`)
    }
    
    return;
}

//Start handling search with click and enter
document.getElementById('search-button').addEventListener('click', handleSearch);
document.getElementById('city').addEventListener('keydown', (e) => {
    if (e.key === "Enter") handleSearch();
});


//Make sure the input is lowerCase except the 1st letter which is uppercase
const normalize = (str) => {
    str = str.toLowerCase();
    let upLetter = str[0].toUpperCase();
    str= str.slice(1);

    str = upLetter + str;
    console.log(str);

    return str;
}

render();

//Connect with the API and fetch the coordinates of the searched city
const fetchCoordinate = (cityName) => {
let requestUrl ="https://api.openweathermap.org/geo/1.0/"
let queryParams = "direct?q=" + cityName + "&limit=1&appid=";

requestUrl = requestUrl + queryParams + apiKey;
console.log(requestUrl);

return fetch(requestUrl)
  .then(function (response) {
    // Convert the response into JSON format
    return response.json();
  })

  .then(function (data) {
    if (!data.length) {
        alert("Write an actual city dumbass");
        return null; 
    }

    // Inspect the API response
    //console.log("Coordinates:", data);
    let lat = data[0].lat;
    let lon = data[0].lon;
    console.log(lat);
    return { lat, lon };
  })

   .catch(function (error) {
    console.error("Error fetching:", error);
  });
}

//Connect with the API and fetch the weather forecast
const fetchWeatherForecast = (latitude, longitude) => {
    let requestUrlWeather ="https://api.openweathermap.org/data/2.5/forecast?"
    let queryParamsWeather =`lat=${latitude}&lon=${longitude}&units=imperial&appid=`

    requestUrlWeather = requestUrlWeather + queryParamsWeather + apiKey;
    //console.log(requestUrlWeather);

    fetch(requestUrlWeather)
    .then(function (response) {
    // Convert the response into JSON format
    return response.json();
    })

    .then(function (data) {
    //console.log(data);

    // Select one forecast per day at around 12:00:00
    const daily = data.list.filter((item) =>
    item.dt_txt.includes('12:00:00')
  );
    //console.log('My daily is', daily);

    renderForecast(daily);

    return daily;
  })

   .catch(function (error) {
    console.error("Error fetching:", error);
  });
}

//Connect with the API and fetch the current weather
const fetchWeatherCurrent = (latitude, longitude, city) => {
    let requestUrlCurrent ="https://api.openweathermap.org/data/2.5/weather?"
    let queryParamsCurrent =`lat=${latitude}&lon=${longitude}&units=imperial&appid=`

    requestUrlCurrent = requestUrlCurrent + queryParamsCurrent + apiKey;
    console.log(requestUrlCurrent);

    fetch(requestUrlCurrent)
    .then(function (response) {
    // Convert the response into JSON format
    return response.json();
    })

    .then(function (data) {
    console.log('I am here', data);

    renderCurrent(data, city);

    return;
  })

   .catch(function (error) {
    console.error("Error fetching:", error);
  });
}


const renderForecast = (myObject) => {

    for (let i = 0; i < 5; i++) {
    const day = myObject[i];

    // Grab the elements dynamically by id
    const dateBox = document.getElementById(`date-forecast-${i + 1}`);
    const tempBox = document.getElementById(`temp-forecast-${i + 1}`);
    const windBox = document.getElementById(`wind-forecast-${i + 1}`);
    const humidBox = document.getElementById(`humid-forecast-${i + 1}`);
    const iconBox = document.getElementById(`icon-forecast-${i + 1}`);

    // Update the content
    dateBox.textContent = day.dt_txt.slice(0, 10);
    tempBox.textContent = "Temp: " + day.main.temp + " °F";
    windBox.textContent = "Wind: " + day.wind.speed + " MPH";
    humidBox.textContent = "Humidity: " + day.main.humidity + " %";

    // Update the icon
    const iconCode = day.weather[0].icon;
    iconBox.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconBox.alt = day.weather[0].description;
    }
}

const renderCurrent = (myObject, place) => {

    const cityBox = document.getElementById(`current-city`);
    const tempBox = document.getElementById(`current-temp`);
    const windBox = document.getElementById(`current-wind`);
    const humidBox = document.getElementById(`current-humid`);
    const iconBox = document.getElementById(`current-icon`);


    tempBox.textContent = "Temperature: " + myObject.main.temp + " °F";
    windBox.textContent = "Wind: " + myObject.wind.speed + " MPH";
    humidBox.textContent = "Humidity: " + myObject.main.humidity + " %";


    //convert the date dt in YYYY-MM-DD
    const dt = myObject.dt;

    // Convert to milliseconds for JavaScript Date
    const date = new Date(dt * 1000);

    // Format to yyyy-mm-dd
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    cityBox.textContent = place + " (" + formattedDate + ")";


    //Icon
    const iconCode = myObject.weather[0].icon;
    iconBox.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconBox.alt = myObject.weather[0].description;



}