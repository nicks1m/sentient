import React, { useState, useEffect } from 'react'
import ToneAudio from './ToneAudio'
import Button from './Button'
import {Tone} from "tone"
import {Player} from "tone"
import {Context} from "tone"
import {start} from "tone"
import {Synth} from "tone"
import {GrainPlayer} from "tone"
import {ToneAudioBuffer} from "tone"
import {Reverb} from "tone"
import {FeedbackDelay} from "tone"
import {Distortion} from "tone"
import {ToneAudioNode} from "tone"
import {PitchShift} from "tone"
import {Chorus} from "tone"
import {LFO} from "tone"
import {Volume} from "tone"
import {AutoFilter} from "tone"
import interp_logo from "./assets/interp.png"


class SeedForm extends React.Component{
    constructor(props){
      super(props)
      const toggle = true;
      this.state = {seed1: ' ',
                    seed2: ' ',
                    src: '',
                    isLoaded: false}

      this.handleInputChange = this.handleInputChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.toggleButton = this.toggleButton.bind(this)


    }


    handleInputChange(event){
      const target = event.target
      const name = target.name
      const value = target.value
      this.setState({[name] : value})
    }


    toggleButton(){
      this.toggle = !this.toggle;
      if(this.toggle === true){
        document.getElementById('btn_interpolate').style.visibility = "hidden";
        document.getElementById('msg').style.visibility = "visible"
      } else {
        document.getElementById('btn_interpolate').style.visibility = "visible";
        document.getElementById('msg').style.visibility = "hidden"
      }
    }

    handleSubmit(e) {
    e.preventDefault();
    const data = { "seed1": this.state.seed1,
                   "seed2": this.state.seed2 };
    console.log('submit');
    console.log(data);
    this.toggleButton();
    const res = fetch('/interpolate', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => {

        document.getElementById('interpolate').src="data:audio/wav;base64, " + res["audio"]
        this.setState({["src"] : res["audio"], ["isLoaded"] : true})
        this.toggleButton();
      });
  }

    render(){
      return(
        <div className="channel">
        {/* <img src={interp_logo} width="250px" height="150px" alt="interpolate"/> */}
        <h1>Interpolation</h1>
        <h2>interpolate between points in the latent space</h2>
        <div>
        <audio id='interpolate' controls></audio>
        <form onSubmit={this.handleSubmit}>
        <label>
        Seed 1
        <input type="number" name="seed1" value = {this.state.seed1} onChange={this.handleInputChange}/>
        </label>
        <label>
        Seed 2
        <input type="number" name="seed2" value = {this.state.seed2} onChange={this.handleInputChange}/>
        </label>
        <Button id="btn_interpolate" text="Interpolate" color='transparent' border='1px' onClick={this.onSubmit}/>
        </form>
        <p id='msg' style={{visibility:"hidden"}}>conjuring audio...</p>
        {/* {this.state["isLoaded"] ? <ToneAudio data={{src:this.state["src"], "grain":false}}></ToneAudio> : <p></p> } */}
        </div>
        </div>

              )
    }


}

export default SeedForm
