import React, { useState, useEffect } from 'react'
import Button from './Button'


class SeedForm extends React.Component{
    constructor(props){
      super(props)
      const toggle = true;
      this.state = {seed1: ' ',
                    seed2: ' '}

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
        console.log("change states")
      } else {
        document.getElementById('btn_interpolate').style.visibility = "visible";
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
        this.toggleButton();
      });
  }

    render(){
      return(
        <form onSubmit={this.handleSubmit}>
        <label>
        Seed 1
        <input type="number" name="seed1" value = {this.state.seed1} onChange={this.handleInputChange}/>
        </label>
        <label>
        Seed 2
        <input type="number" name="seed2" value = {this.state.seed2} onChange={this.handleInputChange}/>
        </label>
         <Button id="btn_interpolate" text="INTERPOLATE" color="white" onClick={this.onSubmit}/>
        </form>
      )
    }


}

export default SeedForm
