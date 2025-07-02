import { useEffect, useReducer, useState } from "react";
import "./App.css";

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
  const [weather, setWeather] = useState(""); //お天気の状態
  const [locationName, setLocationName] = useState(""); //地名
  const [temp, setTemp] = useState(0); //気温
  // const determineTimeOfDay = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 6) return "深夜";
  //   if (hour < 12) return "朝";
  //   if (hour < 18) return "昼";
  //   return "夜";
  // };

  /* 時間帯ワードを英語に修正 */

  const determineTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "mid night";
    if (hour < 12) return "morning";
    if (hour < 18) return "noon";
    return "night";
  };

  const fetchImages = async () => {
    try {
      //　フェーズ４：　位置情報の取得
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const timeOfDay = determineTimeOfDay();
        // console.log(latitude, longitude);
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${"2efeaa1df657e9166e5457f2c512dfad"}`
        );
        const weatherData = await weatherRes.json();
        // console.log(weatherData);
        const weatherMain = weatherData.weather?.[0]?.main;
        setWeather(weatherMain);
        setLocationName(weatherData.name);

        const kelvin = weatherData.main.temp;
        const celsius = kelvin - 273.15;
        setTemp(celsius);

        // フェーズ1：　Unsplashからの画像データを入れる変数
        const keyword = `${timeOfDay} ${weatherMain.toLowerCase()}`;
        const apikey = "3vBz5TClOFgo4ddftdofxTr0km0I7vjHPe2bo4jZxDw";
        const res = await fetch(
          //←await が必要（Promiseを返す）
          `https://api.unsplash.com/search/photos?query=${keyword}&per_page=5&client_id=${apikey}`
        );
        const data = await res.json(); //　←await 必要　（Promise を返す
        // console.log(data);
        setImages(data.results.map((result) => result.urls.full)); //await 不必要
      });
    } catch (e) {
      console.error("画像取得エラー", e);
      //setImages(代替画像)
    }
  };
  useEffect(() => {
    // fetchImages関数を画面読み込み読み込み時に実行。
    //上記setImagesで配列imagesにURLデータが格納される
    fetchImages();
  }, []);

  useEffect(() => {
    //indexを一つずつ進めていく（0 1 2 3 4 0 1.....)
    //inmfes.lengthで配列数内でループするよう　％　を使用
    //indexが変わるたびに、opacity: 1 の画像が切り替わり、それ以外はopactiy:0になる。
    //cssのtransitionによって、前の画像がゆっくりフェードアウト　→ 次の画像がフェードイン

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
      //prevは現在の表示index
      //スライド
    }, 10000);
    return () => clearInterval(timer);
  }, [images]);

  const iconClass = weatherToIcon[weather] || "bi-question-circle";
  return (
    <>
      <div className="container">
        {/* フェーズ３：配列 */}
        {images.map((image, i) => (
          <div
            key={i}
            className="bg-layer"
            style={{
              backgroundImage: `url(${image})`,
              opacity: i === index ? 1 : 0,
              //表示：非表示を切り替え
              //indexは現在表示する画像のindex
              //画像　i(各画像のこと)　が今の表示像indexと同じなら
              //opactiy: 1(見える)、そうでなければ0(透明)
            }}
          />
        ))}
        <div className="content">
          <i className={`bi ${iconClass} weather-icon`} />
          <h1>現在のお天気 : {weather}</h1>
          <p>現在地： {locationName}</p>
          <p>気温： {temp.toFixed(1)}</p>
        </div>
      </div>
    </>
  );
}

export default App;
