
import './App.css';
import Header from './components/Header'
import SeedForm from './components/SeedForm'
import React, { useState, useEffect } from 'react'
import Button from './components/Button'
import ToneAudio from './components/ToneAudio'
{/*import s from './components/Canvas'*/}


{/*import p5 from 'p5'*/}

//import Sketch from './components/Canvas'

function App() {

  //implement api call to load model first
  {/*let myp5 = new window.p5(s, 'p5sketch');/*}
  {/*const synth = new Tone.Synth().toDestination();*/}
  const [noiseData, setNoise] = useState([{}])
  const [toneData, setTone] = useState([{}])
  const [resynthData, setResynth] = useState([{}])
  const [interpData, setInterp] = useState([{}])
  const [data, setData] = useState([{}])



  return (

    <div className="App">
    <div>
    {/*/<Sketch></Sketch>*/}
    <div id = "p5sketch">

    </div>
    {/* Generate from Noise Z Block*/}
    <audio id='noise' controls></audio>

    <Button id='btn_noise' text='NOISE' color='white' onClick={
      async() => {
        const res = fetch("/generatefromz").then(
        res => res.json()
        ).then(
          noiseData => {
            setNoise(noiseData)
            document.getElementById('noise').src="data:audio/wav;base64, " + noiseData["audio"];
            console.log(noiseData)
          }
        )
      }
    }/>
    </div>

    <div>
    {/*Resynthesis Block*/}
    <audio id='resynthesis' controls></audio>
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

    <div>
    <audio id='interpolate' controls></audio>
    <SeedForm/>
    </div>

    <div>
    <ToneAudio></ToneAudio>
    </div>




    </div>
  );



}
export default App;
