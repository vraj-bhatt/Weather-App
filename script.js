document.getElementById('weather-form').addEventListener('submit', function(e) {
    e.preventDefault();

    let city = document.getElementById('city').value;
    let apiKey = '7d2db1ff1c8349a481700841241407'; // Replace this with your actual WeatherAPI key
    let geoDbApiKey = '8e7c4de003msha210954716358d5p13f7c0jsn4035375f6a08'; // Replace this with your actual GeoDB API key

    // Clear previous results
    document.getElementById('weather-result').innerHTML = '';
    document.querySelector('#weather-table tbody').innerHTML = '';

    // Fetch the main city's weather data
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.location && data.current) {
                // Display main city's weather at the top
                let weatherResult = `
                    <h2>${data.location.name}, ${data.location.country}</h2>
                    <p><strong>Weather:</strong> ${data.current.condition.text}</p>
                    <p><strong>Temperature:</strong> ${data.current.temp_c} °C</p>
                    <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                    <p><strong>Wind Speed:</strong> ${data.current.wind_kph} km/h</p>
                `;
                document.getElementById('weather-result').innerHTML = weatherResult;

                // Add main city's weather to the table
                let tableRow = `
                    <tr>
                        <td>${data.location.name}</td>
                        <td>${data.current.condition.text}</td>
                        <td>${data.current.temp_c} °C</td>
                        <td>${data.current.humidity}%</td>
                        <td>${data.current.wind_kph} km/h</td>
                    </tr>
                `;
                document.querySelector('#weather-table tbody').insertAdjacentHTML('beforeend', tableRow);

                // Fetch nearby cities based on the main city's coordinates
                let lat = data.location.lat;
                let lon = data.location.lon;
                fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/locations/${lat}${lon}/nearbyCities?radius=100&minPopulation=10000`, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
                        "x-rapidapi-key": geoDbApiKey
                    }
                })
                .then(response => response.json())
                .then(nearbyCities => {
                    nearbyCities.data.forEach(nearbyCity => {
                        fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${nearbyCity.name}`)
                            .then(response => response.json())
                            .then(nearbyData => {
                                if (nearbyData && nearbyData.current) {
                                    // Add nearby city's weather to the table
                                    let nearbyTableRow = `
                                        <tr>
                                            <td>${nearbyData.location.name}</td>
                                            <td>${nearbyData.current.condition.text}</td>
                                            <td>${nearbyData.current.temp_c} °C</td>
                                            <td>${nearbyData.current.humidity}%</td>
                                            <td>${nearbyData.current.wind_kph} km/h</td>
                                        </tr>
                                    `;
                                    document.querySelector('#weather-table tbody').insertAdjacentHTML('beforeend', nearbyTableRow);
                                }
                            })
                            .catch(error => console.error('Error fetching nearby city weather:', error));
                    });
                })
                .catch(error => console.error('Error fetching nearby cities:', error));
            } else {
                document.getElementById('weather-result').innerHTML = `<p class="text-danger">City not found or API limit reached</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching main city weather:', error);
            document.getElementById('weather-result').innerHTML = `<p class="text-danger">An error occurred. Please try again.</p>`;
        });
});
