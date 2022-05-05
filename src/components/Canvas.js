import React from "react";
import Sketch from "react-p5";
import "./globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";




const s = ( p ) => {

  let x = 100;
  let y = 100;
	let mySound;
  window.myp5 = p;


  p.mousePressed = p5 => {
		console.log("clicked")

	}
	p.preload = () => {
		mySound = window.myp5.loadSound("./fetch_audio");
	};

  p.setup = () => {
    p.createCanvas(200, 200);


  };

  p.draw = () => {
		p.background(255);
		p.ellipse(50,50,50,50)
		p.ellipse(0,0,20)


		if(mySound.isPlaying() === false){
			//mySound.play();
		}

    p.text('sentient machine',p.mouseX,p.mouseY)
  };
};

export default s
