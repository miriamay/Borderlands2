//Reset audio context
document.documentElement.addEventListener("mousedown", () => {
  if (Tone.context.state !== "running") Tone.context.resume();
});
let is_running = false;
let demo_button = document.getElementById("start_demo");
let currentMovement = "1";

console.log("v9");

const gainNode = new Tone.Gain(0).toDestination();
const gainNode2 = new Tone.Gain(0).connect(gainNode);
const reverb = new Tone.Reverb(3).connect(gainNode);
reverb.wet.value = 0.4;
const lowpass = new Tone.Filter({
  Q: 10,
  frequency: 18000,
  type: "lowpass",
}).connect(reverb);
const Lyre = new Tone.Player({
  url: "https://miriamay.github.io/Borderlands/Audio/LyreNatural.mp3",
  onload: ready(),
}).connect(gainNode2);
const Flute = new Tone.Player({
  url: "https://miriamay.github.io/Borderlands/Audio/Flute.mp3",
  loop: true,
  playbackRate: 1,
  loopStart: 0,
  loopEnd: 1,
}).connect(gainNode2);
const Frog1 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog1.mp3"
).toDestination();
const Frog2 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog2.mp3"
).toDestination();
const Frog3 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog3.mp3"
).toDestination();
const Frog4 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog4.mp3"
).toDestination();
const Witches = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Witches.mp3"
).connect(lowpass);
const Owl = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/OwlNatural.mp3"
).connect(gainNode2);

function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

//exponential scale
let powerScale = d3
  .scalePow()
  .exponent(2)
  .domain([0, 180])
  .range([200, 8000])
  .clamp(true);

const frogDict = {
  1: Frog1,
  2: Frog2,
  3: Frog3,
  4: Frog4,
};

//listen for updates to movement
movement.onchange = function () {
  currentMovement = movement.value;
  if (currentMovement !== "1") {
    Lyre.stop();
  } else {
    reverb.wet.value = 0.4;
    reverb.decay = 3;
  }
  if (currentMovement !== "3") {
    Witches.stop();
  }
  if (currentMovement !== "4") {
    Owl.stop();
  }
  if (currentMovement !== "5") Flute.stop();
  demo_button.innerHTML = "START";
  document.getElementById("circle").style.background = "green";
  is_running = false;
};

function handleOrientation(event) {
  if (currentMovement === "1") {
    gainNode2.gain.rampTo(
      scaleValue(Math.abs(event.beta), [0, 180], [0, 1]),
      0.1
    );
  }
  if (currentMovement === "3") {
    lowpass.frequency.value = powerScale(Math.abs(event.beta));
  }
  if (currentMovement === "4") {
    gainNode2.gain.rampTo(
      scaleValue(Math.abs(event.beta), [0, 180], [0, 1]),
      0.1
    );
  }
  if (currentMovement === "5") {
    Flute.playbackRate = scaleValue(event.beta, [-50, 150], [0.25, 2.5]);
    Flute.loopStart = scaleValue(Math.abs(event.gamma), [0, 90], [0, 140]);
    Flute.loopEnd = Flute.loopStart + 1;
  }
}

function handleMotion(event) {}

function ready() {
  demo_button.innerHTML = "START";
  document.getElementById("circle").style.background = "green";
}

demo_button.onclick = function (e) {
  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    window.removeEventListener("shake", shakeEventDidOccur, false);
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    myShakeEvent.stop();
    gainNode.gain.rampTo(0, 0.1);
    Lyre.stop();
    Flute.stop();
    Witches.stop();
    Owl.stop();
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("shake", shakeEventDidOccur, false);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
    myShakeEvent.start();
    if (currentMovement === "1") {
      Lyre.start();
    }
    if (currentMovement === "3") {
      Witches.start();
    }
    if (currentMovement === "4") {
      Owl.start();
    }
    if (currentMovement === "5") {
      gainNode.gain.rampTo(0, 0.1);
      Flute.start();
    }
    gainNode.gain.rampTo(1, 0.1);
    is_running = true;
  }
};

document.addEventListener("visibilitychange", function () {
  document.documentElement.addEventListener("mousedown", () => {
    if (Tone.context.state !== "running") Tone.context.resume();
  });
  if (document.visibilityState === "hidden") {
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    gainNode.gain.rampTo(0, 0.1);
    Lyre.stop();
    Flute.stop();
    Witches.stop();
    Owl.stop();
    is_running = false;
  }
});

var myShakeEvent = new Shake({
  threshold: 0.5, // optional shake strength threshold
  timeout: 500, // optional, determines the frequency of event generation
});

//function to call when shake occurs
function shakeEventDidOccur() {
  if (currentMovement === "2") frogDict[Math.floor(Math.random() * 5)].start();
  if (currentMovement === "5") {
    gainNode2.gain.rampTo(0.8, 0.1);
    setTimeout(function () {
      gainNode2.gain.rampTo(0, 1);
    }, 500);
  }
  //alert('shake!');
}
