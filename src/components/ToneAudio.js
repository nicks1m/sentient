import React, { useState, useEffect, useRef } from 'react'
import Button from './Button'
import {Tone,Player,Players,Context,start,Synth,GrainPlayer,ToneAudioBuffer,Reverb,FeedbackDelay,
Distortion, PitchShift,Chorus,LFO,Volume,Panner,AutoFilter, CrossFade} from "tone"
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import load_anim from "./assets/load.gif"
import logo from "./assets/web_logo.png"
import playing from "./assets/playing.gif"

function normalize(value,min,max){
  const norm = (value - min)/(max-min)
  return norm
}
// use tone meter to get lfo value to modulate more Params


export default function ToneAudio(props){

    const [src, setSrc] = useState(
      {
       src: "data:audio/wav;base64, " + props.data["src"],
       panner: props.data["pan"],
       params: props.data["weather"]
     }
    )


    const [noiseData, setNoise] = useState({data:"null", isLoaded:false, loading:false});
    const [noiseData2, setNoise2] = useState({data:"null", isLoaded:false, loading:false});
    const [data, setData] = useState({seed1:src["params"].sunrise,seed2:src["params"].sunset});

    const [pan, setPan] = useState(props.data["pan"]);
    const [play, setPlay] = useState(false);
    const [loop, setLoop] = useState(true);
    const [vol, setVol] = useState(0);
    const [mute, setMute] = useState(false);
    const [grainSize, setGrainsize] = useState(normalize(src["params"].temp,0,36));
    const [detune, setDetune] = useState(normalize(src["params"].pressure,900,1200)*100);
    const [reverse, setReverse] = useState(false);
    const [pbRate, setPbRate] = useState(normalize(src["params"].wind_speed,0,30));
    const [pitchValue, setPitch] = useState(normalize(-src["params"].temp,-12,12)*100);


    const player = useRef();
    const filter_c1 = useRef();
    const lfo_c1 = useRef();
    const lfo_c1_2 = useRef();
    const lfo_c1_ps = useRef();
    const volumeFX_c1 = useRef();
    const pitch_c1 = useRef();
    const panner_c1 = useRef();
    const dist_c1 = useRef();
    const reverb = useRef();

    const player2 = useRef();
    const filter_c2 = useRef();
    const lfo_c2 = useRef();
    const lfo_c2_2 = useRef();
    const lfo_c2_ps = useRef();
    const volumeFX_c2 = useRef();
    const pitch_c2 = useRef();
    const panner_c2 = useRef();
    const dist_c2 = useRef();

    const cf = useRef();
    const lfo_cf = useRef();

    useEffect(() => {
        cf.current = new CrossFade(0.5);
        lfo_cf.current = new LFO(0.1,0,1);
        lfo_cf.current.start();
        lfo_cf.current.connect(cf.current.fade);
    }, [])

    useEffect(() => {
        if(noiseData2["isLoaded"]){
          setNoise({data:"null", isLoaded:false, loading:true})
          const res = fetch('/interpolate', {
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
            },
            body: JSON.stringify(data),
          }).then(res => res.json())
          .then(
            y => {
              setNoise({data:y["audio"], isLoaded:true, loading:false})
            }
          )
        }
    }, [noiseData2["loading"]])

    useEffect(() => {
        if(noiseData["isLoaded"]){
          setNoise2({data:"null", isLoaded:false, loading:true})
          const res = fetch('/interpolate', {
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
            },
            body: JSON.stringify(data),
          }).then(res => res.json())
          .then(
            y => {
              setNoise2({data:y["audio"],isLoaded:true, loading:false})
            }
          )
        }
    }, [noiseData["loading"]])



    useEffect(() => {
      //LFO initializations
      player.current = new GrainPlayer({
          url:"data:audio/wav;base64, " + noiseData["data"],
          loop: loop,
          playbackRate : pbRate,
          grainSize : grainSize,
          detune: detune,
          onload:()=> {
            player.current.start()
            setTimeout(function(){
              console.log("player disposed")
              player.current.dispose();
            }, 900000)
          }
        });

      panner_c1.current = new Panner(pan).toDestination();
      dist_c1.current = new Distortion(0.6).toDestination();
      reverb.current = new Reverb().toDestination();

      lfo_c1.current = new LFO(0.1,-60,10)
      lfo_c1.current.start();
      lfo_c1.current.type = "sawtooth";

      lfo_c1_2.current = new LFO(0.1,0,100)
      lfo_c1_2.current.start();
      lfo_c1_2.current.type = "sine";

      lfo_c1_ps.current = new LFO(0.03,0,(src["params"].clouds/100))
      lfo_c1_ps.current.start();
      lfo_c1_ps.current.type = "sine";

      pitch_c1.current = new PitchShift(pitchValue);
      filter_c1.current = new AutoFilter(1).toDestination();
      filter_c1.current.filter.type = "highpass"
      volumeFX_c1.current = new Volume(0);
      lfo_c1_ps.current.connect(pitch_c1.current.wet);
      lfo_c1.current.connect(volumeFX_c1.current.volume);

      player.current.connect(pitch_c1.current);
      pitch_c1.current.connect(volumeFX_c1.current);

      volumeFX_c1.current.connect(cf.current.a);
      volumeFX_c1.current.toDestination();

    }, [noiseData])

    useEffect(() => {
      //LFO initializations
      player2.current = new GrainPlayer({
          url:"data:audio/wav;base64, " + noiseData2["data"],
          loop: loop,
          playbackRate : pbRate,
          grainSize : grainSize,
          detune: detune,
          onload:()=> {
            player2.current.start()
            setTimeout(function(){
              console.log("player disposed")
              player2.current.dispose();
            }, 900000)
          }
        });

      panner_c2.current = new Panner(pan).toDestination();
      dist_c2.current = new Distortion(0.6).toDestination();

      lfo_c2.current = new LFO(0.1,-60,10)
      lfo_c2.current.start();
      lfo_c2.current.type = "sawtooth";

      lfo_c2_2.current = new LFO(0.1,0,100)
      lfo_c2_2.current.start();
      lfo_c2_2.current.type = "sine";

      lfo_c2_ps.current = new LFO(0.03,0,(src["params"].clouds/100))
      lfo_c2_ps.current.start();
      lfo_c2_ps.current.type = "sine";

      pitch_c2.current = new PitchShift(pitchValue);
      filter_c2.current = new AutoFilter(1).toDestination();
      filter_c2.current.filter.type = "highpass"
      volumeFX_c2.current = new Volume(0);
      lfo_c2_ps.current.connect(pitch_c2.current.wet);
      lfo_c2.current.connect(volumeFX_c2.current.volume);

      player2.current.connect(pitch_c2.current);
      pitch_c2.current.connect(volumeFX_c2.current);

      volumeFX_c2.current.connect(cf.current.b);
      volumeFX_c2.current.toDestination();


    }, [noiseData2])

    useEffect(() => {
        player.current.loop = loop;
        player.current.volume.value = vol;
        player.current.mute = mute;
        player2.current.mute = mute;
        player.current.grainSize = grainSize;
        player.current.detune = detune;
        player.current.reverse = reverse;
    }, [loop, vol, mute, grainSize, detune, reverse]);



  const playSynth = () => {
    console.log("started")
    player.current.start();
  }

  const toggleLoop = () => {
    console.log("loop" + loop)
    setLoop(!loop)
  }

  const stopSynth = () => {
    console.log("stopped")
    player.current.stop();
  }

  const toneStart = () => {
    start();
    console.log("audio ready")
  }

  const mutePlayer = () => {
    console.log("muted" + mute)
    setMute(!mute)
  }

  const volume = (event) => {
    console.log(event.target.value)
    setVol(event.target.value)
  }

  const grain = (event) => {
    console.log(event.target.value)
    setGrainsize(event.target.value)
  }

  const detuned = (event) => {
    console.log(event.target.value)
    setDetune(event.target.value)
  }

  const toggle_reverse = (event) =>{
    console.log("reverse is " + reverse)
    setReverse(!reverse)
  }

      return(

        <div>


            <div className="channel">
              {/* <img src={logo} width="250px" height="150px" alt="not so sentient automaton"/> */}
              <div>
                <h1>Not So Sentient Radio</h1>
              </div>

              {/* <audio className="audio_controls" id='noise' controls></audio>
              <audio className="audio_controls" id='noise2' controls></audio> */}
              <div className="inner_container">
                {(noiseData["isLoaded"] || noiseData2["isLoaded"]) ? <img width="100" height="100" src={playing} alt="playing..." /> : "" }
                {noiseData["loading"] ? <img width="100" height="100" src={load_anim} alt="loading..." /> : <Button className='btn_generate' id='btn_noise' text='Generate' border='1px' color='white' onClick={

                  async() => {
                    setNoise({data:null, isLoaded:false, loading:true})
                    const res = fetch("/generatefromz").then(
                    res => res.json()
                    ).then(
                      y => {
                        setNoise({data:y["audio"], isLoaded:true, loading:false})
                        // document.getElementById('noise').src="data:audio/wav;base64, " + y["audio"];
                      }
                    )}
                }/>
              }

              <Button id='tone_mute' text={mute ? <FaVolumeMute size={29}/> : <FaVolumeUp size={30}/>} color='transparent' border='0px' onClick={mutePlayer}/>
              </div>





              {/* {noiseData["loading"] ? <div><img width="100" height="100" src={load_anim} alt="loading..." /></div> : <div><p></p></div>}
              {noiseData["isLoaded"] ? <div><p>chn1 connected</p></div> : <div><p></p></div>}
              {noiseData2["loading"] ? <div><img width="100" height="100" src={load_anim} alt="loading..." /></div> : <div><p></p></div>}
              {noiseData2["isLoaded"] ? <div><p>chn2 connected</p></div> : <div><p></p></div> } */}


            </div>


        {/* <div> */}
        {/* <p>Controls</p> */}
        {/*<Button id='tone_start' text='TONE_START' color='white' onClick={toneStart}/>*/}
        {/*<Button id='tone_play' text='TONE_PLAY' color='white' onClick={playSynth}/>*/}
        {/*<Button id='tone_mute' text='TONE_STOP' color='white' onClick={stopSynth}/>*/}
        {/* <Button id='tone_loop' text='LOOP_TOGGLE' color='white' onClick={toggleLoop}/> */}
        {/*<Button id='tone_reverse' text='REVERSE' color='white' onClick={toggle_reverse}/>*/}
        {/* </div> */}
        {/* <p>vol slider</p>
        <input
        value={vol}
        type='range'
        min='-40'
        max='10'
        step='0.1'
        onChange={volume}
        />
        <p>grain size</p>
        <input
        value={grainSize}
        type='range'
        min='0.1'
        max='0.9'
        step='0.1'
        onChange={grain}
        />
        <p>detune slider</p>
        <input
        value={detune}
        type='range'
        min='-100'
        max='100'
        step='1'
        onChange={detuned}
        /> */}
        {/*<p>grain size: {grainSize}</p>*/}
        {/*<p>detune: {detune}</p>*/}
        {/*<p>playback Rate: {pbRate}</p>*/}
        {/*<p>pitch: {pitchValue}</p>*/}
        </div>


      )
}
