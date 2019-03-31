"use strict";
let isTilt = false;
let orientationBeta, orientationGamma;
//Add callback for device orientation change
window.addEventListener("deviceorientation", handleOrientation, true);
//Indicator div and constants
let visualDIV = document.createElement("DIV");
const leftPercentage = 40;
const topPercentage = 31;
const minRotation = 15;

let generatedColourArray = [];
let inputColourArray = [];
let inputArrayLength = 0;
let difficultyLevel = 4;
let sequencesPassed = 0;
let hasFailed = false;
/*
 * This callback function will be called when any of the game buttons on the
 * screen is clicked on by the user (note that the user will not be able to
 * 'double-click' buttons, they will only be clickable once a button has
 * gone dark again)
 * hello
 * This function has a single parameter 'whichButton' that can take the
 * following values:
 *    "blue"
 *    "green"
 *    "yellow"
 *     "red"
*/


function buttonSelected(whichButton)

{
  let correctColoursInput = 0;
  inputColourArray.push(whichButton);
  inputArrayLength++;
  if (inputArrayLength === difficultyLevel)
  {
    for (let i=0; i < difficultyLevel; i++)
    {
      if (inputColourArray[i] === generatedColourArray[i])
      {
        correctColoursInput++;
      }
    }
    if (correctColoursInput === difficultyLevel)
    {
      console.log("You win");
      showSuccess();
      sequencesPassed++;
      displayToastMessage("nice");
      hasFailed = false;
    }
    else {
      console.log("You lose");
      showFailure();
      sequencesPassed=0;
      if(difficultyLevel>4){
          difficultyLevel--;
      }
      if(hasFailed){
        difficultyLevel = 4;
      }
      hasFailed = true;
    }
    correctColoursInput=0;
    inputArrayLength = 0;
    inputColourArray=[];
  }
  if (sequencesPassed === (difficultyLevel - 2))
  {
    difficultyLevel++;
    sequencesPassed = 0;
  }
}

/*
 * This callback function will be called regularly by the main.js page.
 * It is called when it is time for a new sequence to display to the user.
 * You should return a list of strings, from the following possible strings:
 *    "blue"
 *    "green"
 *    "yellow"
 *    "red"
*/
function giveNextSequence()
{
  generatedColourArray = [];
  let colourNumber = 0;
  for(let progress = 0; progress < difficultyLevel; progress++)
  {
    colourNumber = Math.floor(Math.random() * 4);
    if (colourNumber === 0)
    {
      generatedColourArray.push("blue");
    }
    else if (colourNumber === 1)
    {
      generatedColourArray.push("red");
    }
    else if (colourNumber === 2)
    {
      generatedColourArray.push("yellow");
    }
    else if (colourNumber === 3)
    {
      generatedColourArray.push("green");
    }
  }
  console.log(generatedColourArray);
  return generatedColourArray;
}


/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed()
{
    // Include your own code here
}

/*
 * This callback function will be called if the user takes too long to make
 * a choice.  You can generally treat a call to this function as meaning the
 * user has 'given up'. This should be counted as an incorrect sequence given
 * by the user.
 *
 * When the app is is "tilt" input mode (see Step 7) then you might instead
 * use this function to select the button that the phone is tilted towards,
 * by calling one of the following functions:
 *    selectYellowButton
 *    selectRedButton
 *    selectBlueButton
 *    selectGreenButton
*/
function userChoiceTimeout()
{
  console.log(orientationBeta + " " + orientationGamma);
  //selecting red button when phone is rotated beyond 45 degrees both ways
  if(orientationBeta >= minRotation){
    if(orientationGamma >= minRotation){
      selectRedButton();
    }
    //selecting yellow if phone is rotated 45 degrees in beta direction and -45 degrees in gamma direction
    else if(orientationGamma <= -minRotation){
      selectYellowButton();
    }
  }
  else if(orientationBeta <= -minRotation){
    if(orientationGamma >= minRotation){
      selectGreenButton();
    }
    else if(orientationGamma <= -minRotation){
      selectBlueButton();
    }
  }
}
//Callback for device orientation change
//Code copied from https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation
function handleOrientation(event) {
  // assigning beta and gamma to global variables
  orientationBeta = event.beta;
  orientationGamma = event.gamma;
  updateTiltIndicator();
}
/*
 * This callback function will be called when the user taps the button at the
 * top-right of the title bar to toggle between touch- and tilt-based input.
 *
 * The mode parameter will be set to the newly selected mode, one of:
 *    TOUCH_MODE
 *    TILT_MODE
*/
function changeMode(mode)
{
  //check if mode is set to touch mode
  if(mode === TOUCH_MODE){
    isTilt = false;
    removeTiltIndicator();
  }
  //if mode is not touch mode, check if its tilt mode, then this is executed
  else if(mode === TILT_MODE){
    isTilt = true;
    addTiltIndicator();
  }
}
//Add the tilt indicator to the page and style it
function addTiltIndicator(){
  visualDIV.style.width = "40px";
  visualDIV.style.height = "40px";
  visualDIV.style.position = "absolute";
  visualDIV.style.top = topPercentage + "%";
  visualDIV.style.left = leftPercentage + "%";
  visualDIV.style.borderRadius = "20px";
  document.getElementsByClassName("page-content")[0].appendChild(visualDIV);
}
//remove the tilt indicator from the DOM
function removeTiltIndicator(){
  visualDIV.remove();
}
//Update the position of the tilt indicator
function updateTiltIndicator(){
  visualDIV.style.top = (topPercentage + orientationBeta) + "%";
  visualDIV.style.left = (leftPercentage + orientationGamma) + "%";
  updateTiltIndicatorColour();
}
//Update colour of indicator if it is in the correct range
function updateTiltIndicatorColour(){
  let colour = "black";
  if(orientationBeta >= minRotation){
    if(orientationGamma >= minRotation){
      colour = "red";
    }
    //selecting yellow if phone is rotated minRotation degrees in beta direction and -minRotation degrees in gamma direction
    else if(orientationGamma <= -minRotation){
      colour = "yellow";
    }
  }
  else if(orientationBeta <= -minRotation){
    if(orientationGamma >= minRotation){
      colour = "green";
    }
    else if(orientationGamma <= -minRotation){
      colour = "blue";
    }
  }
  visualDIV.style.background = colour;
}
