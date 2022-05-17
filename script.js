//Reset audio context
document.documentElement.addEventListener("mousedown", () => {
  if (Tone.context.state !== "running") Tone.context.resume();
});
let is_running = false;
let demo_button = document.getElementById("start_demo");
let currentMovement = "1";

console.log("v60");

const gainNode = new Tone.Gain(0).toDestination();
const gainNode2 = new Tone.Gain(0).connect(gainNode);
const reverb = new Tone.Reverb(3).connect(gainNode);
reverb.wet.value = 0.4;
// const phaser = new Tone.Phaser({
//   frequency: 15,
//   octaves: 5,
//   baseFrequency: 1000,
// }).connect(reverb);
const lowpass = new Tone.Filter({
  Q: 10,
  frequency: 18000,
  type: "lowpass",
}).connect(reverb);
const pitchShift = new Tone.PitchShift(0).connect(reverb);
// const pluckedEnv = new Tone.AmplitudeEnvelope({
//   attack: 0.05,
//   decay: 0.1,
//   sustain: 0.15,
//   release: 0.1,
//   decayCurve: "exponential",
// }).connect(pitchShift);
const Lyre = new Tone.Player({
  url: "https://miriamay.github.io/Borderlands/Audio/LyreNatural.mp3",
  onload: ready(),
}).connect(pitchShift);
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

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

let t1on = false;
let accelActivate = 2;
let accelDeactivate = 0.2;

//trigger Frog
function trigger2(accel) {
  if (accel >= accelActivate) {
    if (t1on) return;
    t1on = true;
    frogDict[Math.floor(Math.random() * 5)].start();
  }
  if (accel < accelDeactivate) {
    t1on = false;
  }
}

//trigger Flute Mimicry
function trigger5(accel) {
  if (accel >= accelActivate) {
    if (t1on) return;
    t1on = true;
    gainNode2.gain.rampTo(0.8, 0.1);
    setTimeout(function () {
      gainNode2.gain.rampTo(0, 0.5);
    }, 1000);
  }
  if (accel < accelDeactivate) {
    t1on = false;
  }
}

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
    pitchShift.pitch = 0;
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
    if (event.beta < 10) pitchShift.pitch = 5;
    if (10 <= event.beta && event.beta < 60) pitchShift.pitch = 0;
    if (60 <= event.beta && event.beta < 100) pitchShift.pitch = -2;
    if (event.beta >= 100) pitchShift.pitch = -9;
  }
  if (currentMovement === "3") {
    lowpass.frequency.value = powerScale(Math.abs(event.beta));
  }
  if (currentMovement === "4") {
    //lowpass.frequency.value = powerScale(event.beta);
    gainNode2.gain.rampTo(
      scaleValue(Math.abs(event.beta), [0, 180], [0, 1]),
      0.1
    );
    // phaser.frequency.value = scaleValue(event.beta, [-50, 150], [0, 15]);
    // phaser.baseFrequency = scaleValue(
    //   Math.abs(event.gamma),
    //   [0, 90],
    //   [100, 2000]
    // );
  }
  if (currentMovement === "5") {
    Flute.playbackRate = scaleValue(event.beta, [-50, 150], [0.25, 2.5]);
    Flute.loopStart = scaleValue(Math.abs(event.gamma), [0, 90], [0, 140]);
    Flute.loopEnd = Flute.loopStart + 1;
  }
}

let accel;
function handleMotion(event) {
  accel =
    event.acceleration.x ** 2 +
    event.acceleration.y ** 2 +
    event.acceleration.z ** 2;
  if (currentMovement === "2") trigger2(accel);
  if (currentMovement === "5") trigger5(accel);
}

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
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    gainNode.gain.rampTo(0, 0.1);
    Lyre.stop();
    Flute.stop();
    Witches.stop();
    Owl.stop();
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
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
    console.log("hidden");
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
