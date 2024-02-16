const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}





cities = [
  {
    country: "PK",
    name: "Abbottabad",
    lat: "34.1463",
    lng: "73.21168",
  },
  {
    country: "PK",
    name: "Adilpur",
    lat: "27.93677",
    lng: "69.31941",
  },
  {
    country: "PK",
    name: "Ahmadpur East",
    lat: "29.14269",
    lng: "71.25771",
  },
  {
    country: "PK",
    name: "Ahmadpur Sial",
    lat: "30.67791",
    lng: "71.74344",
  },
  {
    country: "PK",
    name: "Akora",
    lat: "34.00337",
    lng: "72.12561",
  },
  {
    country: "PK",
    name: "Aliabad",
    lat: "36.30703",
    lng: "74.61545",
  },
  {
    country: "PK",
    name: "Alik Ghund",
    lat: "30.48976",
    lng: "67.52177",
  },
  {
    country: "PK",
    name: "Alipur",
    lat: "29.38242",
    lng: "70.91106",
  },
  {
    country: "PK",
    name: "Alizai",
    lat: "33.53613",
    lng: "70.34607",
  },
  {
    country: "PK",
    name: "Alpurai",
    lat: "34.92039",
    lng: "72.63265",
  },
  {
    country: "PK",
    name: "Aman Garh",
    lat: "34.00584",
    lng: "71.92971",
  },
  {
    country: "PK",
    name: "Amirabad",
    lat: "34.18729",
    lng: "73.09078",
  },
  {
    country: "PK",
    name: "Arifwala",
    lat: "30.29058",
    lng: "73.06574",
  },
  {
    country: "PK",
    name: "Ashanagro Koto",
    lat: "34.10773",
    lng: "72.24517",
  },
  {
    country: "PK",
    name: "Athmuqam",
    lat: "34.57173",
    lng: "73.89724",
  },
  {
    country: "PK",
    name: "Attock City",
    lat: "33.76671",
    lng: "72.35977",
  },
  {
    country: "PK",
    name: "Awaran",
    lat: "26.45677",
    lng: "65.23144",
  },
  {
    country: "PK",
    name: "Baddomalhi",
    lat: "31.99042",
    lng: "74.6641",
  },
  {
    country: "PK",
    name: "Badin",
    lat: "24.656",
    lng: "68.837",
  },
  {
    country: "PK",
    name: "Baffa",
    lat: "34.4377",
    lng: "73.22368",
  },
  {
    country: "PK",
    name: "Bagarji",
    lat: "27.75431",
    lng: "68.75866",
  },
  {
    country: "PK",
    name: "Bagh",
    lat: "33.98111",
    lng: "73.77608",
  },
  {
    country: "PK",
    name: "Bahawalnagar",
    lat: "29.99835",
    lng: "73.25272",
  },
  {
    country: "PK",
    name: "Bahawalnagar",
    lat: "30.55083",
    lng: "73.39083",
  },
  {
    country: "PK",
    name: "Bahawalpur",
    lat: "29.39779",
    lng: "71.6752",
  },
  {
    country: "PK",
    name: "Bakhri Ahmad Khan",
    lat: "30.73586",
    lng: "70.83796",
  },
  {
    country: "PK",
    name: "Bandhi",
    lat: "26.58761",
    lng: "68.30215",
  },
  {
    country: "PK",
    name: "Bannu",
    lat: "32.98527",
    lng: "70.60403",
  },
  {
    country: "PK",
    name: "Barishal",
    lat: "36.32162",
    lng: "74.69502",
  },
  {
    country: "PK",
    name: "Barkhan",
    lat: "29.89773",
    lng: "69.52558",
  },
  {
    country: "PK",
    name: "Basirpur",
    lat: "30.57759",
    lng: "73.83912",
  },
  {
    country: "PK",
    name: "Basti Dosa",
    lat: "30.78769",
    lng: "70.86853",
  },
  {
    country: "PK",
    name: "Bat Khela",
    lat: "34.6178",
    lng: "71.97247",
  },
  {
    country: "PK",
    name: "Battagram",
    lat: "34.67719",
    lng: "73.02329",
  },
  {
    country: "PK",
    name: "Begowala",
    lat: "32.43816",
    lng: "74.26794",
  },
  {
    country: "PK",
    name: "Bela",
    lat: "26.22718",
    lng: "66.31178",
  },
  {
    country: "PK",
    name: "Berani",
    lat: "25.78497",
    lng: "68.80754",
  },
  {
    country: "PK",
    name: "Bhag",
    lat: "29.04174",
    lng: "67.82394",
  },
  {
    country: "PK",
    name: "Bhakkar",
    lat: "31.62685",
    lng: "71.06471",
  },
  {
    country: "PK",
    name: "Bhalwal",
    lat: "32.26576",
    lng: "72.89809",
  },
  {
    country: "PK",
    name: "Bhan",
    lat: "26.55831",
    lng: "67.72139",
  },
  {
    country: "PK",
    name: "Bhawana",
    lat: "31.56884",
    lng: "72.64917",
  },
  {
    country: "PK",
    name: "Bhera",
    lat: "32.48206",
    lng: "72.90865",
  },
  {
    country: "PK",
    name: "Bhimbar",
    lat: "32.97465",
    lng: "74.07846",
  },
  {
    country: "PK",
    name: "Bhiria",
    lat: "26.91041",
    lng: "68.19466",
  },
  {
    country: "PK",
    name: "Bhit Shah",
    lat: "25.80565",
    lng: "68.49143",
  },
  {
    country: "PK",
    name: "Bhopalwala",
    lat: "32.42968",
    lng: "74.3635",
  },
  {
    country: "PK",
    name: "Bozdar Wada",
    lat: "27.183",
    lng: "68.6358",
  },
  {
    country: "PK",
    name: "Bulri",
    lat: "24.86667",
    lng: "68.33333",
  },
  {
    country: "PK",
    name: "Būrewāla",
    lat: "30.16667",
    lng: "72.65",
  },
  {
    country: "PK",
    name: "Chak",
    lat: "27.85838",
    lng: "68.83378",
  },
  {
    country: "PK",
    name: "Chak Azam Sahu",
    lat: "30.75202",
    lng: "73.02834",
  },
  {
    country: "PK",
    name: "Chak Five Hundred Seventy-five",
    lat: "31.54514",
    lng: "73.82891",
  },
  {
    country: "PK",
    name: "Chak Jhumra",
    lat: "31.56808",
    lng: "73.18317",
  },
  {
    country: "PK",
    name: "Chak One Hundred Twenty Nine Left",
    lat: "30.42919",
    lng: "73.04522",
  },
  {
    country: "PK",
    name: "Chak Thirty-one -Eleven Left",
    lat: "30.42388",
    lng: "72.69737",
  },
  {
    country: "PK",
    name: "Chak Two Hundred Forty-nine Thal Development Authority",
    lat: "31.17772",
    lng: "71.2048",
  },
  {
    country: "PK",
    name: "Chakwal",
    lat: "32.93286",
    lng: "72.85394",
  },
  {
    country: "PK",
    name: "Chaman",
    lat: "30.91769",
    lng: "66.45259",
  },
  {
    country: "PK",
    name: "Chamber",
    lat: "25.29362",
    lng: "68.81176",
  },
  {
    country: "PK",
    name: "Charsadda",
    lat: "34.14822",
    lng: "71.7406",
  },
  {
    country: "PK",
    name: "Chawinda",
    lat: "32.34434",
    lng: "74.70507",
  },
  {
    country: "PK",
    name: "Chenab Nagar",
    lat: "31.75511",
    lng: "72.91403",
  },
  {
    country: "PK",
    name: "Cherat Cantonement",
    lat: "33.82342",
    lng: "71.89292",
  },
  {
    country: "PK",
    name: "Chhor",
    lat: "25.5126",
    lng: "69.78437",
  },
  {
    country: "PK",
    name: "Chichawatni",
    lat: "30.5301",
    lng: "72.69155",
  },
  {
    country: "PK",
    name: "Chilas",
    lat: "35.41287",
    lng: "74.10407",
  },
  {
    country: "PK",
    name: "Chiniot",
    lat: "31.72091",
    lng: "72.97836",
  },
  {
    country: "PK",
    name: "Chishtian",
    lat: "29.79713",
    lng: "72.85772",
  },
  {
    country: "PK",
    name: "Chitral",
    lat: "35.8518",
    lng: "71.78636",
  },
  {
    country: "PK",
    name: "Choa Saidan Shah",
    lat: "32.71962",
    lng: "72.98625",
  },
  {
    country: "PK",
    name: "Chowki Jamali",
    lat: "28.01944",
    lng: "67.92083",
  },
  {
    country: "PK",
    name: "Chuchar-kana Mandi",
    lat: "31.75",
    lng: "73.8",
  },
  {
    country: "PK",
    name: "Chuhar Jamali",
    lat: "24.3944",
    lng: "67.99298",
  },
  {
    country: "PK",
    name: "Chunian",
    lat: "30.96621",
    lng: "73.97908",
  },
  {
    country: "PK",
    name: "Dadhar",
    lat: "29.47489",
    lng: "67.65167",
  },
  {
    country: "PK",
    name: "Dadu",
    lat: "26.73033",
    lng: "67.7769",
  },
  {
    country: "PK",
    name: "Daggar",
    lat: "34.51106",
    lng: "72.48438",
  },
  {
    country: "PK",
    name: "Daira Din Panah",
    lat: "30.57053",
    lng: "70.93722",
  },
  {
    country: "PK",
    name: "Dajal",
    lat: "29.55769",
    lng: "70.37614",
  },
  {
    country: "PK",
    name: "Dalbandin",
    lat: "28.88846",
    lng: "64.40616",
  },
  {
    country: "PK",
    name: "Dandot RS",
    lat: "32.64167",
    lng: "72.975",
  },
  {
    country: "PK",
    name: "Daromehar",
    lat: "24.79382",
    lng: "68.17978",
  },
  {
    country: "PK",
    name: "Darya Khan",
    lat: "31.78447",
    lng: "71.10197",
  },
  {
    country: "PK",
    name: "Darya Khan Marri",
    lat: "26.67765",
    lng: "68.28666",
  },
  {
    country: "PK",
    name: "Daska Kalan",
    lat: "32.32422",
    lng: "74.35039",
  },
  {
    country: "PK",
    name: "Dasu",
    lat: "35.29169",
    lng: "73.2906",
  },
  {
    country: "PK",
    name: "Daud Khel",
    lat: "32.87533",
    lng: "71.57118",
  },
  {
    country: "PK",
    name: "Daulatpur",
    lat: "26.50158",
    lng: "67.97079",
  },
  {
    country: "PK",
    name: "Daultala",
    lat: "33.19282",
    lng: "73.14099",
  },
  {
    country: "PK",
    name: "Daur",
    lat: "26.45528",
    lng: "68.31835",
  },
  {
    country: "PK",
    name: "Dera Allahyar",
    lat: "28.37353",
    lng: "68.35078",
  },
  {
    country: "PK",
    name: "Dera Bugti",
    lat: "29.03619",
    lng: "69.15849",
  },
  {
    country: "PK",
    name: "Dera Ghazi Khan",
    lat: "30.04587",
    lng: "70.64029",
  },
  {
    country: "PK",
    name: "Dera Ismail Khan",
    lat: "31.83129",
    lng: "70.9017",
  },
  {
    country: "PK",
    name: "Dera Murad Jamali",
    lat: "28.54657",
    lng: "68.22308",
  },
  {
    country: "PK",
    name: "Dhanot",
    lat: "29.57991",
    lng: "71.75213",
  },
  {
    country: "PK",
    name: "Dhaunkal",
    lat: "32.40613",
    lng: "74.13706",
  },
  {
    country: "PK",
    name: "Dhoro Naro",
    lat: "25.50484",
    lng: "69.5709",
  },
  {
    country: "PK",
    name: "Digri",
    lat: "25.15657",
    lng: "69.11098",
  },
  {
    country: "PK",
    name: "Dijkot",
    lat: "31.21735",
    lng: "72.99621",
  },
  {
    country: "PK",
    name: "Dinan Bashnoian Wala",
    lat: "29.76584",
    lng: "73.26557",
  },
  {
    country: "PK",
    name: "Dinga",
    lat: "32.64101",
    lng: "73.72039",
  },
  {
    country: "PK",
    name: "Dipalpur",
    lat: "30.66984",
    lng: "73.65306",
  },
  {
    country: "PK",
    name: "Diplo",
    lat: "24.46688",
    lng: "69.58114",
  },
  {
    country: "PK",
    name: "Doaba",
    lat: "33.4245",
    lng: "70.73676",
  },
  {
    country: "PK",
    name: "Dokri",
    lat: "27.37421",
    lng: "68.09715",
  },
  {
    country: "PK",
    name: "Duki",
    lat: "30.15307",
    lng: "68.57323",
  },
  {
    country: "PK",
    name: "Dullewala",
    lat: "31.83439",
    lng: "71.43639",
  },
  {
    country: "PK",
    name: "Dunga Bunga",
    lat: "29.74975",
    lng: "73.24294",
  },
  {
    country: "PK",
    name: "Dunyapur",
    lat: "29.80275",
    lng: "71.74344",
  },
  {
    country: "PK",
    name: "Eidgah",
    lat: "35.34712",
    lng: "74.85632",
  },
  {
    country: "PK",
    name: "Eminabad",
    lat: "32.04237",
    lng: "74.25996",
  },
  {
    country: "PK",
    name: "Faisalabad",
    lat: "31.41554",
    lng: "73.08969",
  },
  {
    country: "PK",
    name: "Faqirwali",
    lat: "29.46799",
    lng: "73.03489",
  },
  {
    country: "PK",
    name: "Faruka",
    lat: "31.88642",
    lng: "72.41362",
  },
  {
    country: "PK",
    name: "Fazilpur",
    lat: "32.17629",
    lng: "75.06583",
  },
  {
    country: "PK",
    name: "Fort Abbas",
    lat: "29.19344",
    lng: "72.85525",
  },
  {
    country: "PK",
    name: "Gadani",
    lat: "25.11853",
    lng: "66.72985",
  },
  {
    country: "PK",
    name: "Gakuch",
    lat: "36.17683",
    lng: "73.76383",
  },
  {
    country: "PK",
    name: "Gambat",
    lat: "27.3517",
    lng: "68.5215",
  },
  {
    country: "PK",
    name: "Gandava",
    lat: "28.61321",
    lng: "67.48564",
  },
  {
    country: "PK",
    name: "Garh Maharaja",
    lat: "30.83383",
    lng: "71.90491",
  },
  {
    country: "PK",
    name: "Garhi Khairo",
    lat: "28.06029",
    lng: "67.98033",
  },
  {
    country: "PK",
    name: "Garhiyasin",
    lat: "27.90631",
    lng: "68.5121",
  },
  {
    country: "PK",
    name: "Gharo",
    lat: "24.74182",
    lng: "67.58534",
  },
  {
    country: "PK",
    name: "Ghauspur",
    lat: "28.13882",
    lng: "69.08245",
  },
  {
    country: "PK",
    name: "Ghotki",
    lat: "28.00437",
    lng: "69.31569",
  },
  {
    country: "PK",
    name: "Gilgit",
    lat: "35.91869",
    lng: "74.31245",
  },
  {
    country: "PK",
    name: "Gojra",
    lat: "31.14926",
    lng: "72.68323",
  },
  {
    country: "PK",
    name: "Goth Garelo",
    lat: "27.43521",
    lng: "68.07572",
  },
  {
    country: "PK",
    name: "Goth Phulji",
    lat: "26.88099",
    lng: "67.68239",
  },
  {
    country: "PK",
    name: "Goth Radhan",
    lat: "27.19846",
    lng: "67.95348",
  },
  {
    country: "PK",
    name: "Gujar Khan",
    lat: "33.25411",
    lng: "73.30433",
  },
  {
    country: "PK",
    name: "Gujranwala",
    lat: "32.15567",
    lng: "74.18705",
  },
  {
    country: "PK",
    name: "Gujrat",
    lat: "32.5742",
    lng: "74.07542",
  },
  {
    country: "PK",
    name: "Gulishah Kach",
    lat: "32.67087",
    lng: "70.33917",
  },
  {
    country: "PK",
    name: "Gwadar",
    lat: "25.12163",
    lng: "62.32541",
  },
  {
    country: "PK",
    name: "Hadali",
    lat: "32.64043",
    lng: "74.56898",
  },
  {
    country: "PK",
    name: "Hafizabad",
    lat: "32.07095",
    lng: "73.68802",
  },
  {
    country: "PK",
    name: "Hala",
    lat: "25.81459",
    lng: "68.42198",
  },
  {
    country: "PK",
    name: "Hangu",
    lat: "33.53198",
    lng: "71.0595",
  },
  {
    country: "PK",
    name: "Haripur",
    lat: "33.99783",
    lng: "72.93493",
  },
  {
    country: "PK",
    name: "Harnai",
    lat: "30.10077",
    lng: "67.93824",
  },
  {
    country: "PK",
    name: "Harnoli",
    lat: "32.27871",
    lng: "71.55429",
  },
  {
    country: "PK",
    name: "Harunabad",
    lat: "29.61206",
    lng: "73.13802",
  },
  {
    country: "PK",
    name: "Hasilpur",
    lat: "29.69221",
    lng: "72.54566",
  },
  {
    country: "PK",
    name: "Hattian Bala",
    lat: "34.1691",
    lng: "73.7432",
  },
  {
    country: "PK",
    name: "Haveli Lakha",
    lat: "30.45097",
    lng: "73.69371",
  },
  {
    country: "PK",
    name: "Havelian",
    lat: "34.05348",
    lng: "73.15993",
  },
  {
    country: "PK",
    name: "Hazro City",
    lat: "33.9099",
    lng: "72.49179",
  },
  {
    country: "PK",
    name: "Hingorja",
    lat: "27.21088",
    lng: "68.41598",
  },
  {
    country: "PK",
    name: "Hujra Shah Muqim",
    lat: "30.74168",
    lng: "73.82327",
  },
  {
    country: "PK",
    name: "Hyderabad",
    lat: "25.39242",
    lng: "68.37366",
  },
  {
    country: "PK",
    name: "Islamabad",
    lat: "33.72148",
    lng: "73.04329",
  },
  {
    country: "PK",
    name: "Islamkot",
    lat: "24.69904",
    lng: "70.17982",
  },
  {
    country: "PK",
    name: "Jacobabad",
    lat: "28.28187",
    lng: "68.43761",
  },
  {
    country: "PK",
    name: "Jahanian Shah",
    lat: "31.80541",
    lng: "72.2774",
  },
  {
    country: "PK",
    name: "Jalalpur Jattan",
    lat: "32.64118",
    lng: "74.20561",
  },
  {
    country: "PK",
    name: "Jalalpur Pirwala",
    lat: "29.5051",
    lng: "71.22202",
  },
  {
    country: "PK",
    name: "Jampur",
    lat: "29.64235",
    lng: "70.59518",
  },
  {
    country: "PK",
    name: "Jamshoro",
    lat: "25.43608",
    lng: "68.28017",
  },
  {
    country: "PK",
    name: "Jand",
    lat: "33.43304",
    lng: "72.01877",
  },
  {
    country: "PK",
    name: "Jandiala Sher Khan",
    lat: "31.82098",
    lng: "73.91815",
  },
  {
    country: "PK",
    name: "Jaranwala",
    lat: "31.3332",
    lng: "73.41868",
  },
  {
    country: "PK",
    name: "Jati",
    lat: "24.35492",
    lng: "68.26732",
  },
  {
    country: "PK",
    name: "Jatoi Shimali",
    lat: "29.51827",
    lng: "70.84474",
  },
  {
    country: "PK",
    name: "Jauharabad",
    lat: "32.29016",
    lng: "72.28182",
  },
  {
    country: "PK",
    name: "Jhang City",
    lat: "31.30568",
    lng: "72.32594",
  },
  {
    country: "PK",
    name: "Jhang Sadr",
    lat: "31.26981",
    lng: "72.31687",
  },
  {
    country: "PK",
    name: "Jhawarian",
    lat: "32.36192",
    lng: "72.62275",
  },
  {
    country: "PK",
    name: "Jhelum",
    lat: "32.93448",
    lng: "73.73102",
  },
  {
    country: "PK",
    name: "Jhol",
    lat: "25.95533",
    lng: "68.88871",
  },
  {
    country: "PK",
    name: "Jiwani",
    lat: "25.04852",
    lng: "61.74573",
  },
  {
    country: "PK",
    name: "Johi",
    lat: "26.69225",
    lng: "67.61431",
  },
  {
    country: "PK",
    name: "Jām Sāhib",
    lat: "26.29583",
    lng: "68.62917",
  },
  {
    country: "PK",
    name: "Kabirwala",
    lat: "30.40472",
    lng: "71.86269",
  },
  {
    country: "PK",
    name: "Kadhan",
    lat: "24.48041",
    lng: "68.98551",
  },
  {
    country: "PK",
    name: "Kahna Nau",
    lat: "31.36709",
    lng: "74.36899",
  },
  {
    country: "PK",
    name: "Kahror Pakka",
    lat: "29.6243",
    lng: "71.91437",
  },
  {
    country: "PK",
    name: "Kahuta",
    lat: "33.59183",
    lng: "73.38736",
  },
  {
    country: "PK",
    name: "Kakad Wari Dir Upper",
    lat: "34.99798",
    lng: "72.07295",
  },
  {
    country: "PK",
    name: "Kalabagh",
    lat: "32.96164",
    lng: "71.54638",
  },
  {
    country: "PK",
    name: "Kalaswala",
    lat: "32.20081",
    lng: "74.64858",
  },
  {
    country: "PK",
    name: "Kalat",
    lat: "29.02663",
    lng: "66.59361",
  },
  {
    country: "PK",
    name: "Kaleke Mandi",
    lat: "31.97597",
    lng: "73.59999",
  },
  {
    country: "PK",
    name: "Kallar Kahar",
    lat: "32.77998",
    lng: "72.69793",
  },
  {
    country: "PK",
    name: "Kalur Kot",
    lat: "32.15512",
    lng: "71.26631",
  },
  {
    country: "PK",
    name: "Kamalia",
    lat: "30.72708",
    lng: "72.64607",
  },
  {
    country: "PK",
    name: "Kamar Mushani",
    lat: "32.84318",
    lng: "71.36192",
  },
  {
    country: "PK",
    name: "Kambar",
    lat: "27.58753",
    lng: "68.00066",
  },
  {
    country: "PK",
    name: "Kamoke",
    lat: "31.97526",
    lng: "74.22304",
  },
  {
    country: "PK",
    name: "Kamra",
    lat: "33.74698",
    lng: "73.51229",
  },
  {
    country: "PK",
    name: "Kandhkot",
    lat: "28.24574",
    lng: "69.17974",
  },
  {
    country: "PK",
    name: "Kandiari",
    lat: "26.9155",
    lng: "68.52193",
  },
  {
    country: "PK",
    name: "Kandiaro",
    lat: "27.05918",
    lng: "68.21022",
  },
  {
    country: "PK",
    name: "Kanganpur",
    lat: "30.76468",
    lng: "74.12286",
  },
  {
    country: "PK",
    name: "Karachi",
    lat: "24.8608",
    lng: "67.0104",
  },
  {
    country: "PK",
    name: "Karak",
    lat: "33.11633",
    lng: "71.09354",
  },
  {
    country: "PK",
    name: "Karaundi",
    lat: "26.89709",
    lng: "68.40643",
  },
  {
    country: "PK",
    name: "Kario Ghanwar",
    lat: "24.80817",
    lng: "68.60483",
  },
  {
    country: "PK",
    name: "Karor",
    lat: "31.2246",
    lng: "70.95153",
  },
  {
    country: "PK",
    name: "Kashmor",
    lat: "28.4326",
    lng: "69.58364",
  },
  {
    country: "PK",
    name: "Kasur",
    lat: "31.11866",
    lng: "74.45025",
  },
  {
    country: "PK",
    name: "Keshupur",
    lat: "32.26",
    lng: "72.5",
  },
  {
    country: "PK",
    name: "Keti Bandar",
    lat: "24.14422",
    lng: "67.45094",
  },
  {
    country: "PK",
    name: "Khadan Khak",
    lat: "30.75236",
    lng: "67.71133",
  },
  {
    country: "PK",
    name: "Khadro",
    lat: "26.14713",
    lng: "68.71777",
  },
  {
    country: "PK",
    name: "Khairpur",
    lat: "28.06437",
    lng: "69.70363",
  },
  {
    country: "PK",
    name: "Khairpur Mir’s",
    lat: "27.52948",
    lng: "68.75915",
  },
  {
    country: "PK",
    name: "Khairpur Nathan Shah",
    lat: "27.09064",
    lng: "67.73489",
  },
  {
    country: "PK",
    name: "Khairpur Tamewah",
    lat: "29.58139",
    lng: "72.23804",
  },
  {
    country: "PK",
    name: "Khalabat",
    lat: "34.05997",
    lng: "72.88963",
  },
  {
    country: "PK",
    name: "Khandowa",
    lat: "32.74255",
    lng: "72.73478",
  },
  {
    country: "PK",
    name: "Khanewal",
    lat: "30.30173",
    lng: "71.93212",
  },
  {
    country: "PK",
    name: "Khangah Dogran",
    lat: "31.83294",
    lng: "73.62213",
  },
  {
    country: "PK",
    name: "Khangarh",
    lat: "29.91446",
    lng: "71.16067",
  },
  {
    country: "PK",
    name: "Khanpur",
    lat: "28.64739",
    lng: "70.65694",
  },
  {
    country: "PK",
    name: "Khanpur Mahar",
    lat: "27.84088",
    lng: "69.41302",
  },
  {
    country: "PK",
    name: "Kharan",
    lat: "28.58459",
    lng: "65.41501",
  },
  {
    country: "PK",
    name: "Kharian",
    lat: "32.81612",
    lng: "73.88697",
  },
  {
    country: "PK",
    name: "Khewra",
    lat: "32.6491",
    lng: "73.01059",
  },
  {
    country: "PK",
    name: "Khurrianwala",
    lat: "31.49936",
    lng: "73.26763",
  },
  {
    country: "PK",
    name: "Khushāb",
    lat: "32.29667",
    lng: "72.3525",
  },
  {
    country: "PK",
    name: "Khuzdar",
    lat: "27.81193",
    lng: "66.61096",
  },
  {
    country: "PK",
    name: "Kohat",
    lat: "33.58196",
    lng: "71.44929",
  },
  {
    country: "PK",
    name: "Kohlu",
    lat: "29.89651",
    lng: "69.25324",
  },
  {
    country: "PK",
    name: "Kot Addu",
    lat: "30.46907",
    lng: "70.96699",
  },
  {
    country: "PK",
    name: "Kot Diji",
    lat: "27.34156",
    lng: "68.70821",
  },
  {
    country: "PK",
    name: "Kot Ghulam Muhammad",
    lat: "32.33311",
    lng: "74.54694",
  },
  {
    country: "PK",
    name: "Kot Malik Barkhurdar",
    lat: "30.20379",
    lng: "66.98723",
  },
  {
    country: "PK",
    name: "Kot Mumin",
    lat: "32.18843",
    lng: "73.02987",
  },
  {
    country: "PK",
    name: "Kot Radha Kishan",
    lat: "31.17068",
    lng: "74.10126",
  },
  {
    country: "PK",
    name: "Kot Rajkour",
    lat: "32.41208",
    lng: "74.62855",
  },
  {
    country: "PK",
    name: "Kot Samaba",
    lat: "28.55207",
    lng: "70.46837",
  },
  {
    country: "PK",
    name: "Kot Sultan",
    lat: "30.7737",
    lng: "70.93125",
  },
  {
    country: "PK",
    name: "Kotli",
    lat: "33.51836",
    lng: "73.9022",
  },
  {
    country: "PK",
    name: "Kotli Loharan",
    lat: "32.58893",
    lng: "74.49466",
  },
  {
    country: "PK",
    name: "Kotri",
    lat: "25.36566",
    lng: "68.30831",
  },
  {
    country: "PK",
    name: "Kulachi",
    lat: "31.93058",
    lng: "70.45959",
  },
  {
    country: "PK",
    name: "Kundian",
    lat: "32.45775",
    lng: "71.47892",
  },
  {
    country: "PK",
    name: "Kunjah",
    lat: "32.52982",
    lng: "73.97486",
  },
  {
    country: "PK",
    name: "Kunri",
    lat: "25.17874",
    lng: "69.56572",
  },
  {
    country: "PK",
    name: "Lachi",
    lat: "33.38291",
    lng: "71.33733",
  },
  {
    country: "PK",
    name: "Ladhewala Waraich",
    lat: "32.15692",
    lng: "74.11564",
  },
  {
    country: "PK",
    name: "Lahore",
    lat: "31.558",
    lng: "74.35071",
  },
  {
    country: "PK",
    name: "Lakhi",
    lat: "27.84884",
    lng: "68.69972",
  },
  {
    country: "PK",
    name: "Lakki",
    lat: "32.60724",
    lng: "70.91234",
  },
  {
    country: "PK",
    name: "Lala Musa",
    lat: "32.70138",
    lng: "73.95746",
  },
  {
    country: "PK",
    name: "Lalian",
    lat: "31.82462",
    lng: "72.80116",
  },
  {
    country: "PK",
    name: "Landi Kotal",
    lat: "34.0988",
    lng: "71.14108",
  },
  {
    country: "PK",
    name: "Larkana",
    lat: "27.55898",
    lng: "68.21204",
  },
  {
    country: "PK",
    name: "Layyah",
    lat: "30.96128",
    lng: "70.93904",
  },
  {
    country: "PK",
    name: "Liliani",
    lat: "32.20393",
    lng: "72.9512",
  },
  {
    country: "PK",
    name: "Lodhran",
    lat: "29.5339",
    lng: "71.63244",
  },
  {
    country: "PK",
    name: "Loralai",
    lat: "30.37051",
    lng: "68.59795",
  },
  {
    country: "PK",
    name: "Mach",
    lat: "29.86371",
    lng: "67.33018",
  },
  {
    country: "PK",
    name: "Madeji",
    lat: "27.75314",
    lng: "68.45166",
  },
  {
    country: "PK",
    name: "Mailsi",
    lat: "29.80123",
    lng: "72.17398",
  },
  {
    country: "PK",
    name: "Malakand",
    lat: "34.56561",
    lng: "71.93043",
  },
  {
    country: "PK",
    name: "Malakwal",
    lat: "32.55449",
    lng: "73.21274",
  },
  {
    country: "PK",
    name: "Malakwal City",
    lat: "32.55492",
    lng: "73.2122",
  },
  {
    country: "PK",
    name: "Malir Cantonment",
    lat: "24.94343",
    lng: "67.20591",
  },
  {
    country: "PK",
    name: "Mamu Kanjan",
    lat: "30.83044",
    lng: "72.79943",
  },
  {
    country: "PK",
    name: "Mananwala",
    lat: "31.58803",
    lng: "73.68927",
  },
  {
    country: "PK",
    name: "Mandi Bahauddin",
    lat: "32.58704",
    lng: "73.49123",
  },
  {
    country: "PK",
    name: "Mangla",
    lat: "31.89306",
    lng: "72.38167",
  },
  {
    country: "PK",
    name: "Mankera",
    lat: "31.38771",
    lng: "71.44047",
  },
  {
    country: "PK",
    name: "Mansehra",
    lat: "34.33023",
    lng: "73.19679",
  },
  {
    country: "PK",
    name: "Mardan",
    lat: "34.19794",
    lng: "72.04965",
  },
  {
    country: "PK",
    name: "Mastung",
    lat: "29.79966",
    lng: "66.84553",
  },
  {
    country: "PK",
    name: "Matiari",
    lat: "25.59709",
    lng: "68.4467",
  },
  {
    country: "PK",
    name: "Matli",
    lat: "25.0429",
    lng: "68.65591",
  },
  {
    country: "PK",
    name: "Mehar",
    lat: "27.18027",
    lng: "67.82051",
  },
  {
    country: "PK",
    name: "Mehmand Chak",
    lat: "32.78518",
    lng: "73.82306",
  },
  {
    country: "PK",
    name: "Mehrabpur",
    lat: "28.10773",
    lng: "68.02554",
  },
  {
    country: "PK",
    name: "Mian Channun",
    lat: "30.44067",
    lng: "72.35679",
  },
  {
    country: "PK",
    name: "Mianke Mor",
    lat: "31.2024",
    lng: "73.94857",
  },
  {
    country: "PK",
    name: "Mianwali",
    lat: "32.57756",
    lng: "71.52847",
  },
  {
    country: "PK",
    name: "Minchianabad",
    lat: "30.16356",
    lng: "73.56858",
  },
  {
    country: "PK",
    name: "Mingora",
    lat: "34.7795",
    lng: "72.36265",
  },
  {
    country: "PK",
    name: "Miran Shah",
    lat: "33.00059",
    lng: "70.07117",
  },
  {
    country: "PK",
    name: "Miro Khan",
    lat: "27.75985",
    lng: "68.09195",
  },
  {
    country: "PK",
    name: "Mirpur Bhtoro",
    lat: "24.72852",
    lng: "68.2601",
  },
  {
    country: "PK",
    name: "Mirpur Khas",
    lat: "25.5276",
    lng: "69.01255",
  },
  {
    country: "PK",
    name: "Mirpur Mathelo",
    lat: "28.02136",
    lng: "69.54914",
  },
  {
    country: "PK",
    name: "Mirpur Sakro",
    lat: "24.54692",
    lng: "67.62797",
  },
  {
    country: "PK",
    name: "Mirwah Gorchani",
    lat: "25.30981",
    lng: "69.05019",
  },
  {
    country: "PK",
    name: "Mitha Tiwana",
    lat: "32.2454",
    lng: "72.10615",
  },
  {
    country: "PK",
    name: "Mithi",
    lat: "24.73701",
    lng: "69.79707",
  },
  {
    country: "PK",
    name: "Moro",
    lat: "26.66317",
    lng: "68.00016",
  },
  {
    country: "PK",
    name: "Moza Shahwala",
    lat: "30.80563",
    lng: "70.84911",
  },
  {
    country: "PK",
    name: "Multan",
    lat: "30.19679",
    lng: "71.47824",
  },
  {
    country: "PK",
    name: "Muridke",
    lat: "31.80258",
    lng: "74.25772",
  },
  {
    country: "PK",
    name: "Murree",
    lat: "33.90836",
    lng: "73.3903",
  },
  {
    country: "PK",
    name: "Musa Khel Bazar",
    lat: "30.85944",
    lng: "69.82208",
  },
  {
    country: "PK",
    name: "Mustafābād",
    lat: "30.89222",
    lng: "73.49889",
  },
  {
    country: "PK",
    name: "Muzaffargarh",
    lat: "30.07258",
    lng: "71.19379",
  },
  {
    country: "PK",
    name: "Muzaffarābād",
    lat: "34.37002",
    lng: "73.47082",
  },
  {
    country: "PK",
    name: "Nabisar",
    lat: "25.06717",
    lng: "69.6434",
  },
  {
    country: "PK",
    name: "Nankana Sahib",
    lat: "31.4501",
    lng: "73.70653",
  },
  {
    country: "PK",
    name: "Narang Mandi",
    lat: "31.90376",
    lng: "74.51587",
  },
  {
    country: "PK",
    name: "Narowal",
    lat: "32.10197",
    lng: "74.87303",
  },
  {
    country: "PK",
    name: "Nasirabad",
    lat: "27.38137",
    lng: "67.91644",
  },
  {
    country: "PK",
    name: "Naudero",
    lat: "27.66684",
    lng: "68.3609",
  },
  {
    country: "PK",
    name: "Naukot",
    lat: "24.85822",
    lng: "69.40153",
  },
  {
    country: "PK",
    name: "Naushahra Virkan",
    lat: "31.96258",
    lng: "73.97117",
  },
  {
    country: "PK",
    name: "Naushahro Firoz",
    lat: "26.8401",
    lng: "68.12265",
  },
  {
    country: "PK",
    name: "Nawabshah",
    lat: "26.23939",
    lng: "68.40369",
  },
  {
    country: "PK",
    name: "Nazir Town",
    lat: "33.30614",
    lng: "73.4833",
  },
  {
    country: "PK",
    name: "New Bādāh",
    lat: "27.34167",
    lng: "68.03194",
  },
  {
    country: "PK",
    name: "New Mirpur",
    lat: "33.14782",
    lng: "73.75187",
  },
  {
    country: "PK",
    name: "Noorabad",
    lat: "34.25195",
    lng: "71.96656",
  },
  {
    country: "PK",
    name: "Nowshera",
    lat: "34.01583",
    lng: "71.98123",
  },
  {
    country: "PK",
    name: "Nowshera Cantonment",
    lat: "33.99829",
    lng: "71.99834",
  },
  {
    country: "PK",
    name: "Nushki",
    lat: "29.55218",
    lng: "66.02288",
  },
  {
    country: "PK",
    name: "Okara",
    lat: "30.81029",
    lng: "73.45155",
  },
  {
    country: "PK",
    name: "Ormara",
    lat: "25.2088",
    lng: "64.6357",
  },
  {
    country: "PK",
    name: "Pabbi",
    lat: "34.00968",
    lng: "71.79445",
  },
  {
    country: "PK",
    name: "Pad Idan",
    lat: "26.77455",
    lng: "68.30094",
  },
  {
    country: "PK",
    name: "Paharpur",
    lat: "32.10502",
    lng: "70.97055",
  },
  {
    country: "PK",
    name: "Pakpattan",
    lat: "30.34314",
    lng: "73.38944",
  },
  {
    country: "PK",
    name: "Panjgur",
    lat: "26.97186",
    lng: "64.09459",
  },
  {
    country: "PK",
    name: "Pano Aqil",
    lat: "27.85619",
    lng: "69.11111",
  },
  {
    country: "PK",
    name: "Parachinar",
    lat: "33.89968",
    lng: "70.10012",
  },
  {
    country: "PK",
    name: "Pasni",
    lat: "25.26302",
    lng: "63.46921",
  },
  {
    country: "PK",
    name: "Pasrur",
    lat: "32.26286",
    lng: "74.66327",
  },
  {
    country: "PK",
    name: "Pattoki",
    lat: "31.02021",
    lng: "73.85333",
  },
  {
    country: "PK",
    name: "Peshawar",
    lat: "34.008",
    lng: "71.57849",
  },
  {
    country: "PK",
    name: "Phalia",
    lat: "32.43104",
    lng: "73.579",
  },
  {
    country: "PK",
    name: "Pind Dadan Khan",
    lat: "32.58662",
    lng: "73.04456",
  },
  {
    country: "PK",
    name: "Pindi Bhattian",
    lat: "31.89844",
    lng: "73.27339",
  },
  {
    country: "PK",
    name: "Pindi Gheb",
    lat: "33.24095",
    lng: "72.2648",
  },
  {
    country: "PK",
    name: "Pir Jo Goth",
    lat: "27.59178",
    lng: "68.61848",
  },
  {
    country: "PK",
    name: "Pir Mahal",
    lat: "30.76663",
    lng: "72.43455",
  },
  {
    country: "PK",
    name: "Pishin",
    lat: "30.58176",
    lng: "66.99406",
  },
  {
    country: "PK",
    name: "Pithoro",
    lat: "25.51122",
    lng: "69.37803",
  },
  {
    country: "PK",
    name: "Qadirpur Ran",
    lat: "30.29184",
    lng: "71.67164",
  },
  {
    country: "PK",
    name: "Qila Abdullah",
    lat: "30.72803",
    lng: "66.66117",
  },
  {
    country: "PK",
    name: "Qila Saifullah",
    lat: "30.70077",
    lng: "68.35984",
  },
  {
    country: "PK",
    name: "Quetta",
    lat: "30.18414",
    lng: "67.00141",
  },
  {
    country: "PK",
    name: "Rahim Yar Khan",
    lat: "28.41987",
    lng: "70.30345",
  },
  {
    country: "PK",
    name: "Raiwind",
    lat: "31.24895",
    lng: "74.21534",
  },
  {
    country: "PK",
    name: "Raja Jang",
    lat: "31.22078",
    lng: "74.25483",
  },
  {
    country: "PK",
    name: "Rajanpur",
    lat: "29.10408",
    lng: "70.32969",
  },
  {
    country: "PK",
    name: "Rajo Khanani",
    lat: "24.98391",
    lng: "68.8537",
  },
  {
    country: "PK",
    name: "Ranipur",
    lat: "27.2872",
    lng: "68.50623",
  },
  {
    country: "PK",
    name: "Rasulnagar",
    lat: "32.32794",
    lng: "73.7804",
  },
  {
    country: "PK",
    name: "Ratodero",
    lat: "27.80227",
    lng: "68.28902",
  },
  {
    country: "PK",
    name: "Rawala Kot",
    lat: "33.85782",
    lng: "73.76043",
  },
  {
    country: "PK",
    name: "Rawalpindi",
    lat: "33.59733",
    lng: "73.0479",
  },
  {
    country: "PK",
    name: "Renala Khurd",
    lat: "30.87878",
    lng: "73.59857",
  },
  {
    country: "PK",
    name: "Risalpur Cantonment",
    lat: "34.06048",
    lng: "71.99276",
  },
  {
    country: "PK",
    name: "Rohri",
    lat: "27.69203",
    lng: "68.89503",
  },
  {
    country: "PK",
    name: "Rojhan",
    lat: "28.68735",
    lng: "69.9535",
  },
  {
    country: "PK",
    name: "Rustam",
    lat: "27.96705",
    lng: "68.80386",
  },
  {
    country: "PK",
    name: "Saddiqabad",
    lat: "28.3091",
    lng: "70.12652",
  },
  {
    country: "PK",
    name: "Sahiwal",
    lat: "31.97386",
    lng: "72.33109",
  },
  {
    country: "PK",
    name: "Sahiwal",
    lat: "30.66595",
    lng: "73.10186",
  },
  {
    country: "PK",
    name: "Saidu Sharif",
    lat: "34.74655",
    lng: "72.35568",
  },
  {
    country: "PK",
    name: "Sakrand",
    lat: "26.13845",
    lng: "68.27444",
  },
  {
    country: "PK",
    name: "Samaro",
    lat: "25.28143",
    lng: "69.39623",
  },
  {
    country: "PK",
    name: "Sambrial",
    lat: "32.47835",
    lng: "74.35338",
  },
  {
    country: "PK",
    name: "Sanghar",
    lat: "26.04694",
    lng: "68.94917",
  },
  {
    country: "PK",
    name: "Sangla Hill",
    lat: "31.71667",
    lng: "73.38333",
  },
  {
    country: "PK",
    name: "Sanjwal",
    lat: "33.76105",
    lng: "72.43315",
  },
  {
    country: "PK",
    name: "Sann",
    lat: "26.0403",
    lng: "68.13763",
  },
  {
    country: "PK",
    name: "Sarai Alamgir",
    lat: "32.90495",
    lng: "73.75518",
  },
  {
    country: "PK",
    name: "Sarai Naurang",
    lat: "32.82581",
    lng: "70.78107",
  },
  {
    country: "PK",
    name: "Sarai Sidhu",
    lat: "30.59476",
    lng: "71.9699",
  },
  {
    country: "PK",
    name: "Sargodha",
    lat: "32.08586",
    lng: "72.67418",
  },
  {
    country: "PK",
    name: "Sehwan",
    lat: "26.42495",
    lng: "67.86126",
  },
  {
    country: "PK",
    name: "Setharja Old",
    lat: "27.2127",
    lng: "68.46883",
  },
  {
    country: "PK",
    name: "Shabqadar",
    lat: "34.21599",
    lng: "71.5548",
  },
  {
    country: "PK",
    name: "Shahdad Kot",
    lat: "27.84726",
    lng: "67.90679",
  },
  {
    country: "PK",
    name: "Shahdadpur",
    lat: "25.92539",
    lng: "68.6228",
  },
  {
    country: "PK",
    name: "Shahkot",
    lat: "31.5709",
    lng: "73.48531",
  },
  {
    country: "PK",
    name: "Shahpur",
    lat: "32.2682",
    lng: "72.46884",
  },
  {
    country: "PK",
    name: "Shahpur Chakar",
    lat: "26.15411",
    lng: "68.65013",
  },
  {
    country: "PK",
    name: "Shahr Sultan",
    lat: "29.57517",
    lng: "71.02209",
  },
  {
    country: "PK",
    name: "Shakargarh",
    lat: "32.26361",
    lng: "75.16008",
  },
  {
    country: "PK",
    name: "Sharqpur Sharif",
    lat: "31.46116",
    lng: "74.10091",
  },
  {
    country: "PK",
    name: "Shekhupura",
    lat: "31.71287",
    lng: "73.98556",
  },
  {
    country: "PK",
    name: "Shikarpur",
    lat: "27.95558",
    lng: "68.63823",
  },
  {
    country: "PK",
    name: "Shingli Bala",
    lat: "34.67872",
    lng: "72.98491",
  },
  {
    country: "PK",
    name: "Shinpokh",
    lat: "34.32959",
    lng: "71.17852",
  },
  {
    country: "PK",
    name: "Shorkot",
    lat: "31.91023",
    lng: "70.87757",
  },
  {
    country: "PK",
    name: "Shujaabad",
    lat: "29.88092",
    lng: "71.29344",
  },
  {
    country: "PK",
    name: "Sialkot",
    lat: "32.49268",
    lng: "74.53134",
  },
  {
    country: "PK",
    name: "Sibi",
    lat: "29.54299",
    lng: "67.87726",
  },
  {
    country: "PK",
    name: "Sillanwali",
    lat: "31.82539",
    lng: "72.54064",
  },
  {
    country: "PK",
    name: "Sinjhoro",
    lat: "26.03008",
    lng: "68.80867",
  },
  {
    country: "PK",
    name: "Skardu",
    lat: "35.29787",
    lng: "75.63372",
  },
  {
    country: "PK",
    name: "Sobhodero",
    lat: "27.30475",
    lng: "68.39715",
  },
  {
    country: "PK",
    name: "Sodhri",
    lat: "32.46211",
    lng: "74.18207",
  },
  {
    country: "PK",
    name: "Sohbatpur",
    lat: "28.52038",
    lng: "68.54298",
  },
  {
    country: "PK",
    name: "Sukheke Mandi",
    lat: "31.86541",
    lng: "73.50875",
  },
  {
    country: "PK",
    name: "Sukkur",
    lat: "27.70323",
    lng: "68.85889",
  },
  {
    country: "PK",
    name: "Surab",
    lat: "28.49276",
    lng: "66.25999",
  },
  {
    country: "PK",
    name: "Surkhpur",
    lat: "32.71816",
    lng: "74.44773",
  },
  {
    country: "PK",
    name: "Swabi",
    lat: "34.12018",
    lng: "72.46982",
  },
  {
    country: "PK",
    name: "Sīta Road",
    lat: "27.03333",
    lng: "67.85",
  },
  {
    country: "PK",
    name: "Talagang",
    lat: "32.92766",
    lng: "72.41594",
  },
  {
    country: "PK",
    name: "Talamba",
    lat: "30.52693",
    lng: "72.24079",
  },
  {
    country: "PK",
    name: "Talhar",
    lat: "24.88454",
    lng: "68.81437",
  },
  {
    country: "PK",
    name: "Tandlianwala",
    lat: "31.03359",
    lng: "73.13268",
  },
  {
    country: "PK",
    name: "Tando Adam",
    lat: "25.76818",
    lng: "68.66196",
  },
  {
    country: "PK",
    name: "Tando Allahyar",
    lat: "25.4605",
    lng: "68.71745",
  },
  {
    country: "PK",
    name: "Tando Bago",
    lat: "24.78914",
    lng: "68.96535",
  },
  {
    country: "PK",
    name: "Tando Jam",
    lat: "25.42813",
    lng: "68.52923",
  },
  {
    country: "PK",
    name: "Tando Mitha Khan",
    lat: "25.99625",
    lng: "69.20251",
  },
  {
    country: "PK",
    name: "Tando Muhammad Khan",
    lat: "25.12384",
    lng: "68.53677",
  },
  {
    country: "PK",
    name: "Tangi",
    lat: "34.3009",
    lng: "71.65238",
  },
  {
    country: "PK",
    name: "Tangwani",
    lat: "28.27886",
    lng: "68.9976",
  },
  {
    country: "PK",
    name: "Tank",
    lat: "32.21707",
    lng: "70.38315",
  },
  {
    country: "PK",
    name: "Taunsa",
    lat: "30.70358",
    lng: "70.65054",
  },
  {
    country: "PK",
    name: "Thal",
    lat: "35.47836",
    lng: "72.24383",
  },
  {
    country: "PK",
    name: "Tharu Shah",
    lat: "26.9423",
    lng: "68.11759",
  },
  {
    country: "PK",
    name: "Thatta",
    lat: "24.74745",
    lng: "67.92353",
  },
  {
    country: "PK",
    name: "Thul",
    lat: "28.2403",
    lng: "68.7755",
  },
  {
    country: "PK",
    name: "Timargara",
    lat: "34.82659",
    lng: "71.84423",
  },
  {
    country: "PK",
    name: "Toba Tek Singh",
    lat: "30.97127",
    lng: "72.48275",
  },
  {
    country: "PK",
    name: "Topi",
    lat: "34.07034",
    lng: "72.62147",
  },
  {
    country: "PK",
    name: "Turbat",
    lat: "26.00122",
    lng: "63.04849",
  },
  {
    country: "PK",
    name: "Ubauro",
    lat: "28.16429",
    lng: "69.73114",
  },
  {
    country: "PK",
    name: "Umarkot",
    lat: "25.36329",
    lng: "69.74184",
  },
  {
    country: "PK",
    name: "Upper Dir",
    lat: "35.2074",
    lng: "71.8768",
  },
  {
    country: "PK",
    name: "Usta Muhammad",
    lat: "28.17723",
    lng: "68.04367",
  },
  {
    country: "PK",
    name: "Uthal",
    lat: "25.80722",
    lng: "66.62194",
  },
  {
    country: "PK",
    name: "Utmanzai",
    lat: "34.18775",
    lng: "71.76274",
  },
  {
    country: "PK",
    name: "Vihari",
    lat: "30.0445",
    lng: "72.3556",
  },
  {
    country: "PK",
    name: "Wana",
    lat: "32.29889",
    lng: "69.5725",
  },
  {
    country: "PK",
    name: "Warah",
    lat: "27.44805",
    lng: "67.79654",
  },
  {
    country: "PK",
    name: "Wazirabad",
    lat: "32.44324",
    lng: "74.12",
  },
  {
    country: "PK",
    name: "Yazman",
    lat: "29.12122",
    lng: "71.74459",
  },
  {
    country: "PK",
    name: "Zafarwal",
    lat: "32.34464",
    lng: "74.8999",
  },
  {
    country: "PK",
    name: "Zahir Pir",
    lat: "28.81284",
    lng: "70.52341",
  },
  {
    country: "PK",
    name: "Zaida",
    lat: "34.0595",
    lng: "72.4669",
  },
  {
    country: "PK",
    name: "Zhob",
    lat: "31.34082",
    lng: "69.4493",
  },
  {
    country: "PK",
    name: "Ziarat",
    lat: "30.38244",
    lng: "67.72562",
  },
  {
    conuntry:"IN",
    name: "Gorakhpur",
    lat: "29.44702",
    lng: "75.67181",
  },
  {
    "City": "Abohar",
    "Lat": 30.144533,
    "Long": 74.19552,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Adilabad",
    "Lat": 19.4,
    "Long": 78.31,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Agartala",
    "Lat": 23.836049,
    "Long": 91.279386,
    "country": "India",
    "iso2": "IN",
    "State": "Tripura"
  },
  {
    "City": "Agra",
    "Lat": 27.187935,
    "Long": 78.003944,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Ahmadnagar",
    "Lat": 19.094571,
    "Long": 74.738432,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Ahmedabad",
    "Lat": 23.025793,
    "Long": 72.587265,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Aizawl  ",
    "Lat": 23.736701,
    "Long": 92.714596,
    "country": "India",
    "iso2": "IN",
    "State": "Mizoram"
  },
  {
    "City": "Ajmer",
    "Lat": 26.452103,
    "Long": 74.638667,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Akola",
    "Lat": 20.709569,
    "Long": 76.998103,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Alappuzha",
    "Lat": 9.494647,
    "Long": 76.331108,
    "country": "India",
    "iso2": "IN",
    "State": "Kerala"
  },
  {
    "City": "Aligarh",
    "Lat": 27.881453,
    "Long": 78.07464,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Alipurduar",
    "Lat": 26.4835,
    "Long": 89.522855,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Allahabad",
    "Lat": 25.44478,
    "Long": 81.843217,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Alwar",
    "Lat": 27.566291,
    "Long": 76.610202,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Ambala",
    "Lat": 30.360993,
    "Long": 76.797819,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Amaravati",
    "Lat": 20.933272,
    "Long": 77.75152,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Amritsar",
    "Lat": 31.622337,
    "Long": 74.875335,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Asansol",
    "Lat": 23.683333,
    "Long": 86.983333,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Aurangabad",
    "Lat": 19.880943,
    "Long": 75.346739,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Aurangabad",
    "Lat": 24.752037,
    "Long": 84.374202,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Bakshpur",
    "Lat": 25.894283,
    "Long": 80.792104,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Bamanpuri",
    "Lat": 28.804495,
    "Long": 79.040305,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Baramula",
    "Lat": 34.209004,
    "Long": 74.342853,
    "country": "India",
    "iso2": "IN",
    "State": "Jammu and Kashmir"
  },
  {
    "City": "Barddhaman",
    "Lat": 23.255716,
    "Long": 87.856906,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Bareilly",
    "Lat": 28.347023,
    "Long": 79.421934,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Belgaum",
    "Lat": 15.862643,
    "Long": 74.508534,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Bellary",
    "Lat": 15.142049,
    "Long": 76.92398,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Bengaluru",
    "Lat": 12.977063,
    "Long": 77.587106,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Bhagalpur",
    "Lat": 25.244462,
    "Long": 86.971832,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Bharatpur",
    "Lat": 27.215251,
    "Long": 77.492786,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Bharauri",
    "Lat": 27.598203,
    "Long": 81.694709,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Bhatpara",
    "Lat": 22.866431,
    "Long": 88.401129,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Bhavnagar",
    "Lat": 21.774455,
    "Long": 72.152496,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Bhilai",
    "Lat": 21.209188,
    "Long": 81.428497,
    "country": "India",
    "iso2": "IN",
    "State": "Chhattisgarh"
  },
  {
    "City": "Bhilwara",
    "Lat": 25.347071,
    "Long": 74.640812,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Bhiwandi",
    "Lat": 19.300229,
    "Long": 73.058813,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Bhiwani",
    "Lat": 28.793044,
    "Long": 76.13968,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Bhopal ",
    "Lat": 23.254688,
    "Long": 77.402892,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Bhubaneshwar",
    "Lat": 20.272411,
    "Long": 85.833853,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Bhuj",
    "Lat": 23.253972,
    "Long": 69.669281,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Bhusaval",
    "Lat": 21.043649,
    "Long": 75.785058,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Bidar",
    "Lat": 17.913309,
    "Long": 77.530105,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Bijapur",
    "Lat": 16.827715,
    "Long": 75.718988,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Bikaner",
    "Lat": 28.017623,
    "Long": 73.314955,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Bilaspur",
    "Lat": 22.080046,
    "Long": 82.155431,
    "country": "India",
    "iso2": "IN",
    "State": "Chhattisgarh"
  },
  {
    "City": "Brahmapur",
    "Lat": 19.311514,
    "Long": 84.792903,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Budaun",
    "Lat": 28.038114,
    "Long": 79.126677,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Bulandshahr",
    "Lat": 28.403922,
    "Long": 77.857731,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Calicut",
    "Lat": 11.248016,
    "Long": 75.780402,
    "country": "India",
    "iso2": "IN",
    "State": "Kerala"
  },
  {
    "City": "Chanda",
    "Lat": 19.950758,
    "Long": 79.295229,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Chandigarh ",
    "Lat": 30.736292,
    "Long": 76.788398,
    "country": "India",
    "iso2": "IN",
    "State": "Chandigarh"
  },
  {
    "City": "Chennai",
    "Lat": 13.084622,
    "Long": 80.248357,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Chikka Mandya",
    "Lat": 12.545602,
    "Long": 76.895078,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Chirala",
    "Lat": 15.823849,
    "Long": 80.352187,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Coimbatore",
    "Lat": 11.005547,
    "Long": 76.966122,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Cuddalore",
    "Lat": 11.746289,
    "Long": 79.764362,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Cuttack",
    "Lat": 20.522922,
    "Long": 85.78813,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Daman",
    "Lat": 20.414315,
    "Long": 72.83236,
    "country": "India",
    "iso2": "IN",
    "State": "Daman and Diu"
  },
  {
    "City": "Davangere",
    "Lat": 14.469237,
    "Long": 75.92375,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "DehraDun",
    "Lat": 30.324427,
    "Long": 78.033922,
    "country": "India",
    "iso2": "IN",
    "State": "Uttarakhand"
  },
  {
    "City": "Delhi",
    "Lat": 28.651952,
    "Long": 77.231495,
    "country": "India",
    "iso2": "IN",
    "State": "Delhi"
  },
  {
    "City": "Dhanbad",
    "Lat": 23.801988,
    "Long": 86.443244,
    "country": "India",
    "iso2": "IN",
    "State": "Jharkhand"
  },
  {
    "City": "Dibrugarh",
    "Lat": 27.479888,
    "Long": 94.90837,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Dindigul",
    "Lat": 10.362853,
    "Long": 77.975827,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Dispur",
    "Lat": 26.135638,
    "Long": 91.800688,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Diu",
    "Lat": 20.715115,
    "Long": 70.987952,
    "country": "India",
    "iso2": "IN",
    "State": "Daman and Diu"
  },
  {
    "City": "Faridabad",
    "Lat": 28.411236,
    "Long": 77.313162,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Firozabad",
    "Lat": 27.150917,
    "Long": 78.397808,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Fyzabad",
    "Lat": 26.775486,
    "Long": 82.150182,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Gangtok",
    "Lat": 27.325739,
    "Long": 88.612155,
    "country": "India",
    "iso2": "IN",
    "State": "Sikkim"
  },
  {
    "City": "Gaya",
    "Lat": 24.796858,
    "Long": 85.003852,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Ghandinagar",
    "Lat": 23.216667,
    "Long": 72.683333,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Ghaziabad",
    "Lat": 28.665353,
    "Long": 77.439148,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Gopalpur",
    "Lat": 26.735389,
    "Long": 83.38064,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Gulbarga",
    "Lat": 17.335827,
    "Long": 76.83757,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Guntur",
    "Lat": 16.299737,
    "Long": 80.457293,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Gurugram",
    "Lat": 28.460105,
    "Long": 77.026352,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Guwahati",
    "Lat": 26.176076,
    "Long": 91.762932,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Gwalior",
    "Lat": 26.229825,
    "Long": 78.173369,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Haldia",
    "Lat": 22.025278,
    "Long": 88.058333,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Haora",
    "Lat": 22.576882,
    "Long": 88.318566,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Hapur",
    "Lat": 28.729845,
    "Long": 77.780681,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Haripur",
    "Lat": 31.463218,
    "Long": 75.986418,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Hata",
    "Lat": 27.592698,
    "Long": 78.013843,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Hindupur",
    "Lat": 13.828065,
    "Long": 77.491425,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Hisar",
    "Lat": 29.153938,
    "Long": 75.722944,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Hospet",
    "Lat": 15.269537,
    "Long": 76.387103,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Hubli",
    "Lat": 15.349955,
    "Long": 75.138619,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Hyderabad",
    "Lat": 17.384052,
    "Long": 78.456355,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Imphal",
    "Lat": 24.808053,
    "Long": 93.944203,
    "country": "India",
    "iso2": "IN",
    "State": "Manipur"
  },
  {
    "City": "Indore",
    "Lat": 22.717736,
    "Long": 75.85859,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Itanagar",
    "Lat": 27.102349,
    "Long": 93.692047,
    "country": "India",
    "iso2": "IN",
    "State": "Arunachal Pradesh"
  },
  {
    "City": "Jabalpur",
    "Lat": 23.174495,
    "Long": 79.935903,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Jaipur",
    "Lat": 26.913312,
    "Long": 75.787872,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Jammu",
    "Lat": 32.735686,
    "Long": 74.869112,
    "country": "India",
    "iso2": "IN",
    "State": "Jammu and Kashmir"
  },
  {
    "City": "Jamshedpur",
    "Lat": 22.802776,
    "Long": 86.185448,
    "country": "India",
    "iso2": "IN",
    "State": "Jharkhand"
  },
  {
    "City": "Jhansi",
    "Lat": 25.458872,
    "Long": 78.579943,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Jodhpur",
    "Lat": 26.26841,
    "Long": 73.005943,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Jorhat",
    "Lat": 26.757509,
    "Long": 94.203055,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Kagaznagar",
    "Lat": 19.331589,
    "Long": 79.466051,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Kakinada",
    "Lat": 16.960361,
    "Long": 82.238086,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Kalyan",
    "Lat": 19.243703,
    "Long": 73.135537,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Karimnagar",
    "Lat": 18.436738,
    "Long": 79.13222,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Karnal",
    "Lat": 29.691971,
    "Long": 76.984483,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Karur",
    "Lat": 10.960277,
    "Long": 78.076753,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Kavaratti",
    "Lat": 10.566667,
    "Long": 72.616667,
    "country": "India",
    "iso2": "IN",
    "State": "Lakshadweep"
  },
  {
    "City": "Khammam",
    "Lat": 17.247672,
    "Long": 80.143682,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Khanapur",
    "Lat": 21.273716,
    "Long": 76.117376,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Kochi",
    "Lat": 9.947743,
    "Long": 76.253802,
    "country": "India",
    "iso2": "IN",
    "State": "Kerala"
  },
  {
    "City": "Kohima",
    "Lat": 25.674673,
    "Long": 94.110988,
    "country": "India",
    "iso2": "IN",
    "State": "Nagaland"
  },
  {
    "City": "Kolar",
    "Lat": 13.137679,
    "Long": 78.129989,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Kolhapur",
    "Lat": 16.695633,
    "Long": 74.231669,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Kolkata ",
    "Lat": 22.562627,
    "Long": 88.363044,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Kollam",
    "Lat": 8.881131,
    "Long": 76.584694,
    "country": "India",
    "iso2": "IN",
    "State": "Kerala"
  },
  {
    "City": "Kota",
    "Lat": 25.182544,
    "Long": 75.839065,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Krishnanagar",
    "Lat": 23.405761,
    "Long": 88.490733,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Krishnapuram",
    "Lat": 12.869617,
    "Long": 79.719469,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Kumbakonam",
    "Lat": 10.959789,
    "Long": 79.377472,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Kurnool",
    "Lat": 15.828865,
    "Long": 78.036021,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Latur",
    "Lat": 18.399487,
    "Long": 76.584252,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Lucknow",
    "Lat": 26.839281,
    "Long": 80.923133,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Ludhiana",
    "Lat": 30.912042,
    "Long": 75.853789,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Machilipatnam",
    "Lat": 16.187466,
    "Long": 81.13888,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Madurai",
    "Lat": 9.917347,
    "Long": 78.119622,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Mahabubnagar",
    "Lat": 16.75,
    "Long": 78,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Malegaon Camp",
    "Lat": 20.569974,
    "Long": 74.515415,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Mangalore",
    "Lat": 12.865371,
    "Long": 74.842432,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Mathura",
    "Lat": 27.503501,
    "Long": 77.672145,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Meerut",
    "Lat": 28.980018,
    "Long": 77.706356,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Mirzapur",
    "Lat": 25.144902,
    "Long": 82.565335,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Moradabad",
    "Lat": 28.838931,
    "Long": 78.776838,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Mumbai",
    "Lat": 18.987807,
    "Long": 72.836447,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Muzaffarnagar",
    "Lat": 29.470914,
    "Long": 77.703324,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Muzaffarpur",
    "Lat": 26.122593,
    "Long": 85.390553,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Mysore",
    "Lat": 12.292664,
    "Long": 76.638543,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Nagercoil",
    "Lat": 8.177313,
    "Long": 77.43437,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Nalgonda",
    "Lat": 17.05,
    "Long": 79.27,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Nanded",
    "Lat": 19.160227,
    "Long": 77.314971,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Nandyal",
    "Lat": 15.477994,
    "Long": 78.483605,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Nasik",
    "Lat": 19.999963,
    "Long": 73.776887,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Navsari",
    "Lat": 20.85,
    "Long": 72.916667,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Nellore",
    "Lat": 14.449918,
    "Long": 79.986967,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "New Delhi",
    "Lat": 28.6,
    "Long": 77.2,
    "country": "India",
    "iso2": "IN",
    "State": "Delhi"
  },
  {
    "City": "Nizamabad",
    "Lat": 18.673151,
    "Long": 78.10008,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Ongole",
    "Lat": 15.503565,
    "Long": 80.044541,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Pali",
    "Lat": 25.775125,
    "Long": 73.320611,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Panaji",
    "Lat": 15.498289,
    "Long": 73.824541,
    "country": "India",
    "iso2": "IN",
    "State": "Goa"
  },
  {
    "City": "Panchkula",
    "Lat": 30.691512,
    "Long": 76.853736,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Panipat",
    "Lat": 29.387471,
    "Long": 76.968246,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Parbhani",
    "Lat": 19.268553,
    "Long": 76.770807,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Pathankot",
    "Lat": 32.274842,
    "Long": 75.652865,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Patiala",
    "Lat": 30.336245,
    "Long": 76.392199,
    "country": "India",
    "iso2": "IN",
    "State": "Punjab"
  },
  {
    "City": "Patna",
    "Lat": 25.615379,
    "Long": 85.101027,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Pilibhit",
    "Lat": 28.631245,
    "Long": 79.804362,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Porbandar",
    "Lat": 21.641346,
    "Long": 69.600868,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Port Blair",
    "Lat": 11.666667,
    "Long": 92.75,
    "country": "India",
    "iso2": "IN",
    "State": "Andaman and Nicobar Islands"
  },
  {
    "City": "Proddatur",
    "Lat": 14.7502,
    "Long": 78.548129,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Puducherry",
    "Lat": 11.933812,
    "Long": 79.829792,
    "country": "India",
    "iso2": "IN",
    "State": "Puducherry"
  },
  {
    "City": "Pune",
    "Lat": 18.513271,
    "Long": 73.849852,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Puri",
    "Lat": 19.798254,
    "Long": 85.824938,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Purnea",
    "Lat": 25.776703,
    "Long": 87.473655,
    "country": "India",
    "iso2": "IN",
    "State": "Bihar"
  },
  {
    "City": "Raichur",
    "Lat": 16.205459,
    "Long": 77.35567,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Raipur",
    "Lat": 21.233333,
    "Long": 81.633333,
    "country": "India",
    "iso2": "IN",
    "State": "Chhattisgarh"
  },
  {
    "City": "Rajahmundry",
    "Lat": 17.005171,
    "Long": 81.777839,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Rajapalaiyam",
    "Lat": 9.451111,
    "Long": 77.556121,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Rajkot",
    "Lat": 22.291606,
    "Long": 70.793217,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Ramagundam",
    "Lat": 18.45,
    "Long": 79.28,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Rampura",
    "Lat": 26.884682,
    "Long": 75.789336,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Ranchi",
    "Lat": 23.347768,
    "Long": 85.338564,
    "country": "India",
    "iso2": "IN",
    "State": "Jharkhand"
  },
  {
    "City": "Ratlam",
    "Lat": 23.330331,
    "Long": 75.040315,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Raurkela",
    "Lat": 22.224964,
    "Long": 84.864143,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Rohtak",
    "Lat": 28.894473,
    "Long": 76.589166,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Saharanpur",
    "Lat": 29.967896,
    "Long": 77.545221,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Saidapur",
    "Lat": 27.598784,
    "Long": 80.75089,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Saidpur",
    "Lat": 34.318174,
    "Long": 74.457093,
    "country": "India",
    "iso2": "IN",
    "State": "Jammu and Kashmir"
  },
  {
    "City": "Salem",
    "Lat": 11.651165,
    "Long": 78.158672,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Samlaipadar",
    "Lat": 21.478072,
    "Long": 83.990505,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Sangli",
    "Lat": 16.856777,
    "Long": 74.569196,
    "country": "India",
    "iso2": "IN",
    "State": "Maharashtra"
  },
  {
    "City": "Saugor",
    "Lat": 23.838766,
    "Long": 78.738738,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Shahbazpur",
    "Lat": 27.874116,
    "Long": 79.879327,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Shiliguri",
    "Lat": 26.710035,
    "Long": 88.428512,
    "country": "India",
    "iso2": "IN",
    "State": "West Bengal"
  },
  {
    "City": "Shillong ",
    "Lat": 25.573987,
    "Long": 91.896807,
    "country": "India",
    "iso2": "IN",
    "State": "Meghalaya"
  },
  {
    "City": "Shimla",
    "Lat": 31.104423,
    "Long": 77.166623,
    "country": "India",
    "iso2": "IN",
    "State": "Himachal Pradesh"
  },
  {
    "City": "Shimoga",
    "Lat": 13.932424,
    "Long": 75.572555,
    "country": "India",
    "iso2": "IN",
    "State": "Karnataka"
  },
  {
    "City": "Sikar",
    "Lat": 27.614778,
    "Long": 75.138671,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Silchar",
    "Lat": 24.827327,
    "Long": 92.797868,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Silvassa",
    "Lat": 20.273855,
    "Long": 72.996728,
    "country": "India",
    "iso2": "IN",
    "State": "Dadra and Nagar Haveli"
  },
  {
    "City": "Sirsa",
    "Lat": 29.534893,
    "Long": 75.028981,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Sonipat",
    "Lat": 28.994778,
    "Long": 77.019375,
    "country": "India",
    "iso2": "IN",
    "State": "Haryana"
  },
  {
    "City": "Srinagar",
    "Lat": 34.085652,
    "Long": 74.805553,
    "country": "India",
    "iso2": "IN",
    "State": "Jammu and Kashmir"
  },
  {
    "City": "Surat",
    "Lat": 21.195944,
    "Long": 72.830232,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Tezpur",
    "Lat": 26.633333,
    "Long": 92.8,
    "country": "India",
    "iso2": "IN",
    "State": "Assam"
  },
  {
    "City": "Thanjavur",
    "Lat": 10.785233,
    "Long": 79.139093,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Tharati Etawah",
    "Lat": 26.758236,
    "Long": 79.014875,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Thiruvananthapuram",
    "Lat": 8.485498,
    "Long": 76.949238,
    "country": "India",
    "iso2": "IN",
    "State": "Kerala"
  },
  {
    "City": "Tiruchchirappalli",
    "Lat": 10.815499,
    "Long": 78.696513,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Tirunelveli",
    "Lat": 8.725181,
    "Long": 77.684519,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Tirupati",
    "Lat": 13.635505,
    "Long": 79.419888,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Tiruvannamalai",
    "Lat": 12.230204,
    "Long": 79.072954,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Tonk",
    "Lat": 26.168672,
    "Long": 75.786111,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Tuticorin",
    "Lat": 8.805038,
    "Long": 78.151884,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Udaipur",
    "Lat": 24.57951,
    "Long": 73.690508,
    "country": "India",
    "iso2": "IN",
    "State": "Rajasthan"
  },
  {
    "City": "Ujjain",
    "Lat": 23.182387,
    "Long": 75.776433,
    "country": "India",
    "iso2": "IN",
    "State": "Madhya Pradesh"
  },
  {
    "City": "Vadodara",
    "Lat": 22.299405,
    "Long": 73.208119,
    "country": "India",
    "iso2": "IN",
    "State": "Gujarat"
  },
  {
    "City": "Valparai",
    "Lat": 10.325163,
    "Long": 76.955299,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Varanasi",
    "Lat": 25.31774,
    "Long": 83.005811,
    "country": "India",
    "iso2": "IN",
    "State": "Uttar Pradesh"
  },
  {
    "City": "Vellore",
    "Lat": 12.905769,
    "Long": 79.137104,
    "country": "India",
    "iso2": "IN",
    "State": "Tamil Nadu "
  },
  {
    "City": "Vishakhapatnam",
    "Lat": 17.704052,
    "Long": 83.297663,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Vizianagaram",
    "Lat": 18.11329,
    "Long": 83.397743,
    "country": "India",
    "iso2": "IN",
    "State": "Andhra Pradesh"
  },
  {
    "City": "Warangal",
    "Lat": 17.978423,
    "Long": 79.600209,
    "country": "India",
    "iso2": "IN",
    "State": "Telangana"
  },
  {
    "City": "Jorapokhar",
    "Lat": 23.7,
    "Long": 86.41267,
    "country": "India",
    "iso2": "IN",
    "State": "Jharkhand"
  },
  {
    "City": "Brajrajnagar",
    "Lat": 21.82,
    "Long": 83.92,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  },
  {
    "City": "Talcher",
    "Lat": 20.95,
    "Long": 85.23,
    "country": "India",
    "iso2": "IN",
    "State": "Odisha"
  }
];