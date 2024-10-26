document.addEventListener('DOMContentLoaded', function () {
    const citySelect = document.getElementById('city');
    const formatSelect = document.getElementById('format');
    const weatherInfo = document.querySelector('.weather-info');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const feelsLike = document.getElementById('feels-like');
    const condition = document.getElementById('condition');
    const lastUpdated = document.getElementById('last-updated');
    const weatherAnimation = document.getElementById('weather-animation');
    const summaryContent = document.getElementById('summary-content');
    
    const alertCard = document.getElementById('alert-card');
    const alertMessage = document.getElementById('alert-message');
    const showPreviousDataButton = document.getElementById('show-previous-data');
    const previousDataCard = document.getElementById('previous-data-card');
    const previousDataContent = document.getElementById('previous-data-content');
    const weatherConditions = {
        Clear: 'https://lottie.host/9b35da43-5793-4ffe-ba38-910f052a6d6e/GcdJ3e1bV5.json',
        Rain: 'https://lottie.host/ed89c9c9-7bbe-43e2-bf04-b5aca58ef8b2/1smPfeNgqb.json',
        Clouds: 'https://lottie.host/5f590309-1462-4cbf-b193-c6e514edbd37/TBQxVG8o8f.json',
        Mist: 'https://lottie.host/f93b1bba-f265-4a53-a949-1b614d8713bd/jucodQwESI.json',
        Haze: 'https://lottie.host/da96dd80-72a1-4739-9964-5cc30c2ac543/rcmeGYkcRg.json',
        Thunderstorm: 'https://lottie.host/89e06258-5971-4b5dd-620e3409d3bb/eNnmM8ORMg.json',
        Smoke : 'https://lottie.host/164faffc-81e1-4675-ab24-68dadb4b706a/tUY7HVt204.json'
        
    };

    let currentAnimation = null; 
    let lastTemperatures = []; 
    let weatherInterval; 

    function showAlert(message) {
        alertMessage.textContent = message;
        alertCard.style.display = 'block'; // Show the alert card

        // Optionally, fade out after a specific duration
        setTimeout(() => {
            alertCard.style.display = 'none';
        }, 3000); // Uncomment to auto-hide after 3 seconds
    }

    function hideAlert() {
        alertCard.style.display = 'none'; // Hide the alert card
    }

    function loadWeather() {
        const city = citySelect.value;
        const format = formatSelect.value;

        if (!city) {
            showAlert("Please select a city.");
            return;
        }

        fetch(`/api/weather?city=${city}&format=${format}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    showAlert(data.error);
                } else {
                    cityName.textContent = `City: ${city}`;
                    temperature.textContent = `Temperature: ${data.temp}° ${format}`;
                    feelsLike.textContent = `Feels Like: ${data.feels_like}° ${format}`;
                    condition.textContent = `Condition: ${data.condition}`;
                    lastUpdated.textContent = `Last Updated: ${data.time}`;
                    weatherInfo.classList.add('show');

                    // Convert current temperature to Celsius for alert checking
                    const currentTempCelsius = convertToCelsius(data.temp);
                    checkTemperatureAlert(currentTempCelsius); // Check for alerts

                    loadAnimation(data.condition);
                    loadSummary(); 
                }
            })
            .catch(error => {
                console.error("Error fetching weather:", error);
                showAlert(error.message);
                weatherInfo.classList.remove('show');
                clearAnimation();
            });
    }

    function checkTemperatureAlert(currentTempCelsius) {
        lastTemperatures.push(currentTempCelsius);

        if (lastTemperatures.length > 2) {
            lastTemperatures.shift();
        }

        if (lastTemperatures.length === 2 && lastTemperatures[0] > 20 && lastTemperatures[1] > 20) {
            showAlert("Alert: High temperature detected! 🌡️");
        }
    }

    function convertToCelsius(temp) {
        const format = formatSelect.value;

        if (format === 'Kelvin') {
            return temp - 273.15; // Convert from Kelvin to Celsius
        } else if (format === 'Fahrenheit') {
            return (temp - 32) * (5 / 9); // Convert from Fahrenheit to Celsius
        }
        return temp; // If already in Celsius
    }

    function loadAnimation(weatherCondition) {
        const animationUrl = weatherConditions[weatherCondition] || weatherConditions['Clear'];
        clearAnimation(); 

        currentAnimation = lottie.loadAnimation({
            container: weatherAnimation,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animationUrl
        });

        setInterval(() => {
            const randomX = Math.random() * 100; 
            const randomY = Math.random() * 100; 
            weatherAnimation.style.top = `${randomY}%`;
            weatherAnimation.style.left = `${randomX}%`;
            weatherAnimation.style.transform = 'translate(-50%, -50%)'; 
        }, 5000);
    }

    function clearAnimation() {
        if (currentAnimation) {
            currentAnimation.destroy(); 
            currentAnimation = null;
        }
    }

    function startWeatherUpdateInterval() {
        if (weatherInterval) {
            clearInterval(weatherInterval); 
        }
        weatherInterval = setInterval(loadWeather, 6000);
    }

    citySelect.addEventListener('change', () => {
        loadWeather(); 
        startWeatherUpdateInterval(); 
    });
    
    formatSelect.addEventListener('change', () => {
        loadWeather(); 
        startWeatherUpdateInterval(); 
    });

    loadWeather();
    startWeatherUpdateInterval(); 
    function showPreviousDataCard() {
        fetch(`/api/summary?city=${citySelect.value}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const previousData = data.map(entry => `
                        <div>
                            <p>Date: ${new Date(entry.date).toLocaleDateString()}</p>
                            <p>Avg Temp: ${convertTemperature(entry.avg_temp, formatSelect.value)}</p>
                            <p>Min Temp: ${convertTemperature(entry.min_temp, formatSelect.value)}</p>
                            <p>Max Temp: ${convertTemperature(entry.max_temp, formatSelect.value)}</p>
                            <p>Condition: ${entry.condition}</p>
                        </div>
                    `).join('');
                    
                    previousDataContent.innerHTML = previousData;
                    previousDataCard.style.display = 'block';
                } else {
                    previousDataContent.innerHTML = '<p>No previous data available.</p>';
                    previousDataCard.style.display = 'block';
                }
            })
            .catch(error => {
                showAlert('Error fetching previous data');
            });
    }

    // Function to hide the previous data card
    function hidePreviousDataCard() {
        previousDataCard.style.display = 'none';
    }

    // Event listener for the button to show previous data
   

    function convertTemperature(kelvin, format) {
        if (format === 'Celsius') return (kelvin - 273.15).toFixed(2) + '°C';
        if (format === 'Fahrenheit') return ((kelvin - 273.15) * 9/5 + 32).toFixed(2) + '°F';
        return kelvin.toFixed(2) + ' K';
    } 
    

    
});
