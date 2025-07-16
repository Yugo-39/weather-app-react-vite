import { useEffect, useState } from "react";
import "./App.css";

const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
const unsplashApiKey = import.meta.env.VITE_UNSPLASH_API_KEY;

const weatherToIcon = {
  Clear: "bi-sun-fill",
  Clouds: "bi-clouds-fill",
  Rain: "bi-cloud-rain-fill",
  Drizzle: "bi-cloud-drizzle-fill",
  Thunderstorm: "bi-cloud-lightning-fill",
  Snow: "bi-snow",
  Mist: "bi-cloud-haze-fill",
  Fog: "bi-cloud-haze-fill",
  Haze: "bi-cloud-haze-fill",
};

function App() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [weather, setWeather] = useState(""); // お天気の状態
  const [locationName, setLocationName] = useState(""); // 地名
  const [temp, setTemp] = useState(0); // 気温

  const determineTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "midnight";
    if (hour < 12) return "morning";
    if (hour < 18) return "noon";
    return "night";
  };

  const fetchImages = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const timeOfDay = determineTimeOfDay();

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}`
        );
        const weatherData = await weatherRes.json();

        const weatherMain = weatherData.weather?.[0]?.main;
        setWeather(weatherMain);
        setLocationName(weatherData.name);

        const kelvin = weatherData.main.temp;
        const celsius = kelvin - 273.15;
        setTemp(celsius);

        const keyword = `${timeOfDay} ${weatherMain.toLowerCase()}`;
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${keyword}&per_page=5&client_id=${unsplashApiKey}`
        );
        const data = await res.json();
        setImages(data.results.map((result) => result.urls.full));
      });
    } catch (e) {
      console.error("画像取得エラー", e);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [images]);

  const iconClass = weatherToIcon[weather] || "bi-question-circle";

  return (
    <div className="container">
      {images.map((image, i) => (
        <div
          key={i}
          className="bg-layer"
          style={{
            backgroundImage: `url(${image})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}
      <div className="content">
        <i className={`bi ${iconClass} weather-icon`} />
        <h1>現在のお天気 : {weather}</h1>
        <p>現在地： {locationName}</p>
        <p>気温： {temp.toFixed(1)}℃</p>
      </div>
    </div>
  );
}

export default App;
