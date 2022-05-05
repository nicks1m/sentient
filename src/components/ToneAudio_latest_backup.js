import React, { useState, useEffect, useRef } from 'react'
import Button from './Button'
import {Tone,Player,Context,start,Synth,GrainPlayer,ToneAudioBuffer,Reverb,FeedbackDelay,
Distortion, PitchShift,Chorus,LFO,Volume,Panner,AutoFilter} from "tone"

function normalize(value,min,max){
  const norm = (value - min)/(max-min)
  return norm
}

export default function ToneAudio(props){

    const [src, setSrc] = useState(
      {
       src: "data:audio/wav;base64, " + props.data["src"],
       panner: props.data["pan"],
       params: props.data["weather"]
     }
    )

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
    const filter = useRef();
    const lfo = useRef();
    const lfo2 = useRef();
    const lfo_ps = useRef();
    const volumeFX = useRef();
    const pitch = useRef();
    const panner = useRef();
    const dist = useRef();
    const reverb = useRef();

    console.log("rerender")


    //Params to modulate
    //grain size 0.1 - 0.9
    //playback rate 1 - 5
    //detune settings
    //LFO settings
    //reverse boolewan
    //auto filter fx
    //reverb fx


    useEffect(() => {
      //LFO initializations
      player.current = new GrainPlayer({
          url:src["src"],
          loop: loop,
          playbackRate : pbRate,
          grainSize : grainSize,
          detune: detune,
          onload:()=> {
            player.current.start().stop("+420")
            setTimeout(function(){
              console.log("player disposed")
              player.current.dispose();
            }, 420000)
          }
        });

      panner.current = new Panner(pan).toDestination();
      dist.current = new Distortion(0.6).toDestination();
      reverb.current = new Reverb().toDestination();

      lfo.current = new LFO(0.1,-60,10)
      lfo.current.start();
      lfo.current.type = "sawtooth";

      lfo2.current = new LFO(0.1,0,100)
      lfo2.current.start();
      lfo2.current.type = "sine";

      lfo_ps.current = new LFO(0.03,0,(src["params"].clouds/100))
      lfo_ps.current.start();
      lfo_ps.current.type = "sine";

      pitch.current = new PitchShift(pitchValue);
      filter.current = new AutoFilter(1).toDestination();
      filter.current.filter.type = "highpass"
      volumeFX.current = new Volume(0);
      lfo_ps.current.connect(pitch.current.wet);
      lfo.current.connect(volumeFX.current.volume);

      volumeFX.current.toDestination();
      player.current.connect(pitch.current);
      pitch.current.connect(volumeFX.current);
    }, [])

    useEffect(() => {
        player.current.loop = loop;
        player.current.volume.value = vol;
        player.current.mute = mute;
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
        <p>Controls</p>
        <Button id='tone_start' text='TONE_START' color='white' onClick={toneStart}/>
        <Button id='tone_play' text='TONE_PLAY' color='white' onClick={playSynth}/>
        <Button id='tone_mute' text='TONE_STOP' color='white' onClick={stopSynth}/>
        <Button id='tone_loop' text='LOOP_TOGGLE' color='white' onClick={toggleLoop}/>
        <Button id='tone_mute' text='MUTE_TOGGLE' color='white' onClick={mutePlayer}/>
        <Button id='tone_reverse' text='REVERSE' color='white' onClick={toggle_reverse}/>
        <p>vol slider</p>
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
        />
        <p>grain size: {grainSize}</p>
        <p>detune: {detune}</p>
        <p>playback Rate: {pbRate}</p>
        <p>pitch: {pitchValue}</p>
        </div>


      )
}
