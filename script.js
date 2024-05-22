let canvas = document.getElementById("myCanvas");
const restartBtn = document.querySelector(".restart-btn");
const modal = document.querySelector(".modal");
let colors = [
  "#7BD3EA",
  "#A1EEBD",
  "#F6F7C4",
  "#F6D6D6",
  "#FFC6AC",
  "#FFF6DC",
  "#C4C1A4",
  "#9E9FA5",
];
let previousColorIndex = -1;
let context = canvas.getContext("2d");
context.font = "normal 30px Arcade";
let scrollCounter, cameraY, current, mode, xSpeed;
let ySpeed = 5;
let height = 50;
let boxes = [];
boxes[0] = {
  x: 300,
  y: 300,
  width: 200,
  color: getRandomColor(),
};
let debris = {
  x: 0,
  width: 0,
};

const LEFT = 1; // 0001
const RIGHT = 2; // 0010
const BOTTOM = 4; // 0100
const TOP = 8; // 1000

function computeOutCode(x, y, width) {
  let code = 0;

  if (x < 0)
    // to the left of canvas
    code |= LEFT;
  else if (x + width > canvas.width)
    // to the right of canvas
    code |= RIGHT;
  if (y < 0)
    // below the canvas
    code |= BOTTOM;
  else if (y > canvas.height)
    // above the canvas
    code |= TOP;

  return code;
}

function cohenSutherlandClipping(box1, box2) {
  let code1 = computeOutCode(box1.x, box1.y, box1.width);
  let code2 = computeOutCode(box2.x, box2.y, box2.width);

  if (!(code1 | code2)) {
    console.log("No clipping needed");
  } else if (code1 & code2) {
    console.log("Boxes do not interact");
  } else {
    console.log("Clipping needed");
  }
}

function getRandomColor() {
  let newColorIndex;
  do {
    newColorIndex = Math.floor(Math.random() * colors.length);
  } while (newColorIndex === previousColorIndex);
  previousColorIndex = newColorIndex;
  return colors[newColorIndex];
}

function newBox() {
  boxes[current] = {
    x: 0,
    y: (current + 10) * height,
    width: boxes[current - 1].width,
    color: getRandomColor(),
  };
}

function gameOver() {
  modal.classList.remove("hide");
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  mode = "gameOver";
}

function animate() {
  if (mode != "gameOver") {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillText("Score: " + (current - 1).toString(), 25, 45);
    for (let n = 0; n < boxes.length; n++) {
      let box = boxes[n];
      context.fillStyle = box.color;
      context.fillRect(box.x, 600 - box.y + cameraY, box.width, height);
      if (n > 0) cohenSutherlandClipping(boxes[n], boxes[n - 1]);
    }
    context.fillStyle = "#4A5B75";
    context.fillRect(debris.x, 600 - debris.y + cameraY, debris.width, height);
    if (mode == "bounce") {
      boxes[current].x = boxes[current].x + xSpeed;
      if (xSpeed > 0 && boxes[current].x + boxes[current].width > canvas.width)
        xSpeed = -xSpeed;
      if (xSpeed < 0 && boxes[current].x < 0) xSpeed = -xSpeed;
    }
    if (mode == "fall") {
      boxes[current].y = boxes[current].y - ySpeed;

      if (boxes[current].y == boxes[current - 1].y + height) {
        mode = "bounce";
        let difference = boxes[current].x - boxes[current - 1].x;
        if (Math.abs(difference) >= boxes[current].width) {
          gameOver();
        } else if (difference !== 0) {
          playCutSound();
        }
        debris = {
          y: boxes[current].y,
          width: difference,
        };
        if (boxes[current].x > boxes[current - 1].x) {
          boxes[current].width = boxes[current].width - difference;
          debris.x = boxes[current].x + boxes[current].width;
        } else {
          debris.x = boxes[current].x - difference;
          boxes[current].width = boxes[current].width + difference;
          boxes[current].x = boxes[current - 1].x;
        }
        if (xSpeed > 0) xSpeed++;
        else xSpeed--;
        current++;
        scrollCounter = height;

        newBox();
      }
    }
    debris.y = debris.y - ySpeed;
    if (scrollCounter) {
      cameraY++;
      scrollCounter--;
    }
  }
  window.requestAnimationFrame(animate);
}

function playCutSound() {
  const cutSound = document.getElementById("cutSound");
  cutSound.currentTime = 0;
  cutSound.play();
}

function restart() {
  boxes.splice(1, boxes.length - 1);
  mode = "bounce";
  cameraY = 0;
  scrollCounter = 0;
  xSpeed = 2;
  current = 1;
  newBox();
  debris.y = 0;
  modal.classList.add("hide");
  backgroundMusic.play();
}

function start() {
  boxes.splice(1, boxes.length - 1);
  mode = "bounce";
  cameraY = 0;
  scrollCounter = 0;
  xSpeed = 2;
  current = 1;
  newBox();
  debris.y = 0;
  modal.classList.add("hide");
}

restartBtn.onclick = function () {
  restart();
};

canvas.onpointerdown = function () {
  if (mode == "gameOver") {
    restart();
  } else {
    if (mode == "bounce") mode = "fall";
  }
};

window.onload = function () {
  let preModal = document.getElementById("loadingScreen");
  let mainContent = document.getElementById("mainContent");
  preModal.style.display = "block";
  setTimeout(function () {
    preModal.style.display = "none";
    mainContent.style.display = "block";
    let backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.play();
  }, 4000);
};

start();
animate();
