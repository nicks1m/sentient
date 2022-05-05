
import './App.css';
import Header from './components/Header'
import SeedForm from './components/SeedForm'
import React, { useState, useEffect } from 'react'
import Button from './components/Button'
import ToneAudio from './components/ToneAudio'
import {Players, CrossFade} from "tone"
import resynth_logo from "./components/assets/resynth_logo.png"
import interp_logo from "./components/assets/interp.png"

{/*import s from './components/Canvas'*/}


{/*import p5 from 'p5'*/}

//import Sketch from './components/Canvas'

function App() {


  const [resynthData, setResynth] = useState({data:"null", isLoaded:false, loading:false})
  const [interpData, setInterp] = useState([{}])
  const [loaded, setLoaded] = useState(false)
  const [weatherData, setWeather] = useState({
    clouds:"",
    temp:"",
    feels_like:"",
    humidity:"",
    pressure:"",
    wind_speed:"",
    wind_gust:"",
    sunrise:"",
    sunset:"",
  })


  const key = "https://api.openweathermap.org/data/2.5/onecall?lat=51.509865&lon=-0.118092&units=metric&exclude=minutely,hourly,alerts&appid=e6f432c901f11938194cf7e308d2f872"

  const getData = async() => {
    try {
      const res = await fetch(key).then(
        res => res.json()
      ).then(
        y => {
          console.log(y)
          setWeather({
            clouds:y["current"].clouds,
            temp:y["current"].temp,
            feels_like:y["current"].feels_like,
            humidity:y["current"].humidity,
            pressure:y["current"].pressure,
            wind_speed:y["current"].wind_speed,
            wind_gust:y["current"].wind_gust,
            sunrise:y["current"].sunrise,
            sunset:y["current"].sunset,
          });
          setLoaded(true)
        }
      ).then(
        console.log(weatherData)
      )
    } catch (e){
      console.log(e);
    }
  }

  useEffect(() => {
      getData();
  }, [])

  useEffect(() => {
      const intervalCall = setInterval(() => {
        getData();
      }, 360000);
      return () => {
          clearInterval(intervalCall);
      }
  }, [])



  return (

    <div className="App">

    {/* Generate from Noise Z Block*/}

    {loaded ? <ToneAudio data={{"weather":weatherData,"pan":"-1",}}></ToneAudio> : "fetching data" }
    <div>
    <div className="channel">
        {/*Resynthesis Block*/}
        {/*<img src={resynth_logo} width="250px" height="150px" alt="resynthesis"/>*/}
        <h1>Resynthesis</h1>

        <div>
            <audio id='resynthesis' controls></audio>
            {resynthData["loading"] ? <p>loading...</p> :
            <div>
            <Button id='btn_resynthesis' text='Resynthesis' color='transparent' border='1px' onClick={
              async() => {
                const res = fetch("/resynthesis").then(
                res => res.json()
                ).then(
                  resynthData => {
                    setResynth(resynthData)
                    document.getElementById('resynthesis').src="data:audio/wav;base64, " + resynthData["audio"];
                    console.log(resynthData)
                  }
                )
              }
            }/>
            </div>
          }
        </div>
    </div>
    </div>

    <div>
        <SeedForm/>
    </div>
    </div>




  );



}
export default App;
