import React, { useState, useEffect } from 'react'
import Button from './Button'
import {Tone} from "tone"
import {Player} from "tone"
import {Context} from "tone"
import {start} from "tone"
import {Synth} from "tone"

class ToneAudio extends React.Component{

  constructor(props){
    super(props)

    this.playSynth = this.playSynth.bind(this)
    this.toneStart = this.toneStart.bind(this)
    this.stopSynth = this.stopSynth.bind(this)
    this.loop = this.loop.bind(this)
    // this.synth = new Synth().toDestination();
    this.now = new Context().now();
    this.player = new Player('/fetch_audio').toDestination();
    this.player.loop = true;


  }


  playSynth(){
    // this.synth.triggerAttackRelease("C4", "8n", this.now)
    // this.synth.triggerAttackRelease("E4", "8n", this.now + 0.5)
    // this.synth.triggerAttackRelease("G4", "8n", this.now + 1)

    this.player.start();
    console.log("played")

  }

  loop(){
    this.player.loop = !this.player.loop
  }

  stopSynth(){
    this.player.stop();
    console.log("stopped")
  }

  toneStart(){
    start();
    console.log("audio ready")

  }


  render(){
    return(
      <div>
      <Button id='tone_start' text='TONE_START' color='white' onClick={this.toneStart}/>
      <Button id='tone_play' text='TONE_PLAY' color='white' onClick={this.playSynth}/>
      <Button id='tone_stop' text='TONE_STOP' color='white' onClick={this.stopSynth}/>
      <Button id='tone_loop' text='LOOP_TOGGLE' color='white' onClick={this.loop}/>
      </div>





    )
  }
}

export default ToneAudio
