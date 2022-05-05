
import './App.css';
import Header from './components/Header'
import SeedForm from './components/SeedForm'
import React, { useState, useEffect } from 'react'
import Button from './components/Button'
import ToneAudio from './components/ToneAudio'
import {Players} from "tone"
{/*import s from './components/Canvas'*/}


{/*import p5 from 'p5'*/}

//import Sketch from './components/Canvas'

function App() {

  const [noiseData, setNoise] = useState({data:"null", isLoaded:false, loading:false})
  const [noiseData2, setNoise2] = useState({data:"null", isLoaded:false, loading:false})
  const [resynthData, setResynth] = useState({data:"null", loading:true})
  const [interpData, setInterp] = useState([{}])
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

  const masterPlayer = new Players();
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





  useEffect(() => {
      if(noiseData2["isLoaded"]){
        setNoise({data:"null", isLoaded:false, loading:true})
        const res = fetch("/generatefromz").then(
        res => res.json()
        ).then(
          y => {
            console.log(y["audio"])
            setNoise({data:y["audio"], isLoaded:true, loading:false})
            document.getElementById('noise').src="data:audio/wav;base64, " + y["audio"];
          }
        )
      }
  }, [noiseData2["loading"]])

  useEffect(() => {
      if(noiseData["isLoaded"]){
        setNoise2({data:"null", isLoaded:false, loading:true})
        const res = fetch("/generatefromz").then(
        res => res.json()
        ).then(
          y => {
            console.log(y["audio"])
            setNoise2({data:y["audio"],isLoaded:true, loading:false})
            document.getElementById('noise2').src="data:audio/wav;base64, " + y["audio"];
          }
        )
      }
  }, [noiseData["loading"]])





  return (

    <div className="App">
    <div>
    {/*/<Sketch></Sketch>*/}
    {/*<div id = "p5sketch"/>*/}

    {/* Generate from Noise Z Block*/}
    <div className="audio_stream">
        <div className="channel">
          <p className ="title">noise stream 1</p>


          <audio id='noise' controls></audio>
          {noiseData["loading"] ? <p>loading...</p> : <p></p>}
          {noiseData["isLoaded"] ? <ToneAudio data={{src:noiseData["data"],"weather":weatherData,"pan":"-1",}}></ToneAudio> : <p></p>}

          <Button className='btn_generate' id='btn_noise' text='NOISE' color='white' onClick={

            async() => {
              setNoise({data:null, isLoaded:false, loading:true})
              const res = fetch("/generatefromz").then(
              res => res.json()
              ).then(
                y => {
                  setNoise({data:y["audio"], isLoaded:true, loading:false})
                  document.getElementById('noise').src="data:audio/wav;base64, " + y["audio"];
                }
              )}
          }/>
        </div>
      </div>

      <div className="channel">
          <p className="title">noise stream 2</p>
          <audio id='noise2' controls></audio>
          {noiseData2["loading"] ? <p>loading...</p> : <p></p>}
          {noiseData2["isLoaded"] ? <ToneAudio data={{src:noiseData2["data"], "weather":weatherData, "pan":"1"}}></ToneAudio> : <p></p> }

          <Button id='btn_noise2' text='NOISE2' color='white' onClick={
            async() => {
              const res = fetch("/generatefromz").then(
              res => res.json()
              ).then(
                y => {
                  setNoise2({data:y["audio"], isLoaded:true, loading:false})
                  document.getElementById('noise2').src="data:audio/wav;base64, " + y["audio"];
                }
              )}
          }/>

      </div>
    </div>

    <div className="channel">
        {/*Resynthesis Block*/}
        <p className="title"> Resynthesis Stream </p>


        <audio id='resynthesis' controls></audio>
        <p></p>
        {resynthData["loading"]? <p>loading...</p> : <ToneAudio data={resynthData["audio"]}></ToneAudio>}

        <Button id='btn_resynthesis' text='RESYNTHESIS' color='white' onClick={
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

    <div className="channel">
        <p className="title">Interpolate Stream</p>
        <SeedForm/>


    </div>

    <div>

    </div>
    </div>
  );



}
export default App;
