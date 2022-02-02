import React from "react";
import Sketch from "react-p5";
import "./globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";





// export default (props) => {
// 	const setup = (p5, canvasParentRef) => {
// 		// use parent to render the canvas in this ref
// 		// (without that p5 will render the canvas outside of your component)
// 		mySound = p5.loadSound('./reconstructions_0.wav');
// 		p5.createCanvas(500, 500).parent(canvasParentRef);
//     p5.background(255);
// 		p5.text("sentient machine", 50,50)
//
// 	};
//
// 	const draw = (p5) => {
//
// 		mySound.play();
//
// 		//p5.ellipse(p5.mouseX, p5.mouseY, 70, 70);
// 		// NOTE: Do not use setState in the draw function or in functions that are executed
// 		// in the draw function...
// 		// please use normal variables or class properties for these purposes
// 		x++;
// 	};
//
// 	return <Sketch setup={setup} draw={draw} />;
// };

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
