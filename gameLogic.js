"use strict";
/*
* Purpose: This file is the logic for the memory training game
* Organization/Team: Team 17
* Version: 1.0
*/
let isTilt = false;
let orientationBeta, orientationGamma, orientationZ;
let hasOriented = false;
//Add callback for device orientation change
//Orientation Sensor
let deviceAbsoluteSensor = null;

//Indicator div and constants
let visualDIV = document.createElement("DIV");
let outputDIV = document.getElementById("output");
//Style the output DIV
outputDIV.style.margin = "20px 0 0 20px";
//Constants
const DEFAULT_LEFT_PERCENTAGE = 40;
const DEFAULT_TOP_PERCENTAGE = 31;
const MIN_ROTATION_RANGE = 10;

let generatedColourArray = [];
let inputColourArray = [];
let difficultyLevel = 4;
let sequencesPassed = 0;
let hasFailed = false;

//Show the output
updateOutputMessage();

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
function buttonSelected(whichButton){
  let correctColoursInput = 0;
  //Adds selected colour to the end of inputColourArray
  inputColourArray.push(whichButton);
  //If statement checks whether the required amount of colours are entered
  if (inputColourArray.length === difficultyLevel){
  //For loops verfies whether or not the user has entered the entire sequence correctly
    for (let i=0; i < difficultyLevel; i++){
      if (inputColourArray[i] === generatedColourArray[i]){
        correctColoursInput++;
      }
    }
    //If statement runs if the correct sequence was entered and increments the sequencesPassed counter
    if (correctColoursInput === difficultyLevel){
      showSuccess();
      sequencesPassed++;
      //hasFailed tracks consecutive fails
      hasFailed = false;
      //Check to see if we need to go to the next level
      if (sequencesPassed === (difficultyLevel - 2)){
        difficultyLevel++;
        sequencesPassed = 0;
        displayToastMessage("Nice, you are now on level " + (difficultyLevel-3));
      }
    }
    //Else statement Runs if the incorrect sequence was entered
    else {
      //Calls upon the reduceDifficulty function to decrease difficulty accordingly
      reduceDifficulty();
    }
    //Resets variables to initial conditions
    correctColoursInput=0;
    inputColourArray=[];
  }
  updateOutputMessage();
}

//Display the output message. enterSequence has a default value of false
function updateOutputMessage(enterSequence = false, displayingSequence = false){
  let outputText = "";
  if(enterSequence){
    outputText += "<b>Enter the sequence</b> <br />";
  }
  else if(displayingSequence){
    outputText += "<b>Remember this sequence</b> <br />";
  }
//Output messages relating to what user has entered and needs to enter to progress
  outputText += "Colours left: " + (difficultyLevel - inputColourArray.length) + "<br />";
  outputText += "Sequence length: " + (difficultyLevel) + "<br />";
  outputText += "Correct sequences needed: " + (difficultyLevel-2) + "<br />";
  outputText += "Correct sequences remaining: " + (difficultyLevel-2-sequencesPassed) + "<br />";
  outputDIV.innerHTML = outputText;
  return outputText;
}

//Reduces the difficuty level
function reduceDifficulty(){
  showFailure();
  sequencesPassed=0;
  if(difficultyLevel>4){
      difficultyLevel--;
  }
  if(hasFailed){
    difficultyLevel = 4;
  }
  hasFailed = true;
  displayToastMessage("Bad luck, you are now on level " + (difficultyLevel-3));
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
  //Empty the array so we can add entries later
  generatedColourArray = [];
  let colourNumber = 0;
  //For loop generates random integer from 1 to 4 and pairs it to a colour which is added to the generatedColourArray
  for(let progress = 0; progress < difficultyLevel; progress++){
    colourNumber = Math.floor(Math.random() * 4);
    if (colourNumber === 0){
      generatedColourArray.push("blue");
    }
    else if (colourNumber === 1){
      generatedColourArray.push("red");
    }
    else if (colourNumber === 2){
      generatedColourArray.push("yellow");
    }
    else if (colourNumber === 3){
      generatedColourArray.push("green");
    }
  }
  updateOutputMessage(false, true);
  return generatedColourArray;
}


/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed(){
    //Ask the user to input the sequence
    updateOutputMessage(true);
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
function userChoiceTimeout(){
  if(isTilt){
    //Selecting the required colour if phone is rotated MIN_ROTATION_RANGE degrees in beta direction and -MIN_ROTATION_RANGE degrees in gamma direction
    let buttonSelectionLookup = [selectRedButton, selectYellowButton, selectGreenButton, selectBlueButton, function(){return -1}];
    if(buttonSelectionLookup[checkRotationRange()]() !== -1){
          return;
    }
  }
  //Display timeout message
  displayToastMessage("You failed to choose an option!");
  //Reset the level
  buttonPressesRemaining = 0;
  checkUserFinished();
  reduceDifficulty();
}

//Callback for device orientation change
function handleOrientation(event) {
  // Assigning beta and gamma to global variables
  orientationBeta = Math.floor(event.quaternion[0]*100);
  orientationGamma = Math.floor(event.quaternion[1]*100);
  orientationZ = event.quaternion[2];
  updateTiltIndicator();
  if(!hasOriented){
    checkUserOrientation();
  }
}
/*
 * This callback function will be called when the user taps the button at the
 * top-right of the title bar to toggle between touch- and tilt-based input.
 *
 * The mode parameter will be set to the newly selected mode, one of:
 *    TOUCH_MODE
 *    TILT_MODE
*/
function changeMode(mode){
  //This checks if mode is set to touch mode
  if(mode === TOUCH_MODE){
    isTilt = false;
    removeTiltIndicator();
  }
  //Check if mode is set to tilt mode, then tilt mode is initialised
  else if(mode === TILT_MODE){
    isTilt = true;
    hasOriented = false;
    addTiltIndicator();
    initOrientationSensor();
  }
}
//Add the tilt indicator to the page and style it
function addTiltIndicator(){
  visualDIV.style.width = "40px";
  visualDIV.style.height = "40px";
  visualDIV.style.position = "absolute";
  visualDIV.style.top = DEFAULT_TOP_PERCENTAGE + "%";
  visualDIV.style.left = DEFAULT_LEFT_PERCENTAGE + "%";
  visualDIV.style.borderRadius = "20px";
  document.getElementsByClassName("page-content")[0].appendChild(visualDIV);
}
//Remove the tilt indicator from the DOM
function removeTiltIndicator(){
  visualDIV.remove();
}
//Initialise the orientationSensor
function initOrientationSensor(){
  deviceAbsoluteSensor = new AbsoluteOrientationSensor({ frequency: 10 });
  deviceAbsoluteSensor.addEventListener('reading', () => handleOrientation(deviceAbsoluteSensor));
  deviceAbsoluteSensor.start();
}
  //Get the user to position themselves at z=0
function checkUserOrientation(){
  let outputText = "To enable tilt support please rotate your body to the ";
  if(orientationZ < -0.3){
    outputText += "left";
  }
  else if(orientationZ > 0.3){
    outputText += "right";
  }
  else {
    displayToastMessage("You are now oriented correctly");
    outputText = updateOutputMessage();
    hasOriented = true;
  }
  outputDIV.innerHTML = outputText;
}
//Update the position of the tilt indicator
function updateTiltIndicator(){
  visualDIV.style.top = (DEFAULT_TOP_PERCENTAGE + orientationBeta) + "%";
  visualDIV.style.left = (DEFAULT_LEFT_PERCENTAGE + orientationGamma) + "%";
  updateTiltIndicatorColour();
}
//Update colour of indicator if it is in the correct range
function updateTiltIndicatorColour(){
  //Selecting the required colour if phone is rotated MIN_ROTATION_RANGE degrees in beta direction and -MIN_ROTATION_RANGE degrees in gamma direction
  let colourLookup = ["red", "yellow", "green", "blue", "black"];
  let colour = colourLookup[checkRotationRange()];
  visualDIV.style.background = colour;
}

//Returns a number representing the range and 4 if it is outside
function checkRotationRange(){
  if(orientationBeta >= MIN_ROTATION_RANGE){
    if(orientationGamma >= MIN_ROTATION_RANGE){
      return 0;
    }
    else if(orientationGamma <= -MIN_ROTATION_RANGE){
      return 1;
    }
  }
  else if(orientationBeta <= -MIN_ROTATION_RANGE){
    if(orientationGamma >= MIN_ROTATION_RANGE){
      return 2;
    }
    else if(orientationGamma <= -MIN_ROTATION_RANGE){
      return 3;
    }
  }
  return 4
}
