import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Grp204WeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        loading: false,
        data: {},
        error: false,
    });
    const [favorites, setFavorites] = useState([]);
    const [theme, setTheme] = useState('day'); // Day or Night theme

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(savedFavorites);
        detectUserLocation(); // Automatically detect user's location on app load
    }, []);

    const toDateFunction = () => {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const currentDate = new Date();
        const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
        return date;
    };

    const updateTheme = (timezone) => {
        const localTime = new Date(new Date().getTime() + timezone * 1000);
        const hours = localTime.getUTCHours(); // Local hour based on timezone
        if (hours >= 6 && hours < 18) {
            setTheme('day'); // Set to light theme for day
        } else {
            setTheme('night'); // Set to dark theme for night
        }
    };

    const search = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            fetchWeatherByCity(input);
        }
    };

    const fetchWeatherByCity = async (city) => {
        setInput('');
        setWeather({ ...weather, loading: true });
        const url = 'https://api.openweathermap.org/data/2.5/weather';
        const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
        await axios
            .get(url, {
                params: {
                    q: city,
                    units: 'metric',
                    appid: api_key,
                },
            })
            .then((res) => {
                setWeather({ data: res.data, loading: false, error: false });
                updateTheme(res.data.timezone); // Update theme based on city's timezone
            })
            .catch((error) => {
                setWeather({ ...weather, data: {}, error: true });
            });
    };

    const fetchWeatherByCoordinates = async (lat, lon) => {
        setWeather({ ...weather, loading: true });
        const url = 'https://api.openweathermap.org/data/2.5/weather';
        const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
        await axios
            .get(url, {
                params: {
                    lat,
                    lon,
                    units: 'metric',
                    appid: api_key,
                },
            })
            .then((res) => {
                setWeather({ data: res.data, loading: false, error: false });
                updateTheme(res.data.timezone); // Update theme based on city's timezone
            })
            .catch((error) => {
                setWeather({ ...weather, data: {}, error: true });
            });
    };

    const detectUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoordinates(latitude, longitude); // Fetch weather using detected coordinates
                },
                () => {
                    console.error('Location access denied by user');
                    setWeather({ ...weather, error: true });
                }
            );
        } else {
            console.error('Geolocation not supported by this browser');
            setWeather({ ...weather, error: true });
        }
    };

    const addToFavorites = () => {
        if (weather.data.name && !favorites.includes(weather.data.name)) {
            const updatedFavorites = [...favorites, weather.data.name];
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    };

    const loadFavoriteCity = (city) => {
        fetchWeatherByCity(city);
    };

    return (
        <div className={`App ${theme}`}>
            <h1 className="app-name">Application Météo grp206</h1>
            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Entrez le nom de la ville..."
                    name="query"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyPress={search}
                />
                <button onClick={addToFavorites}>Ajouter aux favoris</button>
            </div>
            <div className="favorites">
                <h3>Villes Favorites</h3>
                {favorites.map((city, index) => (
                    <button key={index} onClick={() => loadFavoriteCity(city)}>
                        {city}
                    </button>
                ))}
            </div>
            {weather.loading && <span>Chargement...</span>}
            {weather.error && <span className="error-message">Erreur lors de la récupération des données météo</span>}
            {weather && weather.data && weather.data.main && (
                <div>
                    <h2>{weather.data.name}, {weather.data.sys.country}</h2>
                    <span>{toDateFunction()}</span>
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                        alt={weather.data.weather[0].description}
                    />
                    <p>{Math.round(weather.data.main.temp)}°C</p>
                    <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
                </div>
            )}
        </div>
    );
}

export default Grp204WeatherApp;
