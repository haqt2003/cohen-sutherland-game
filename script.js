let canvas = document.getElementById("myCanvas");
const restartBtn = document.querySelector(".restart-btn");
const modal = document.querySelector(".modal");
// const mute = document.querySelector(".mute-icon");
// const speak = document.querySelector(".speak-icon");
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

// Hàm chọn màu ngẫu nhiên không trùng
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

// mute.onclick = function () {
//   mute.classList.add("hide");
//   speak.classList.remove("hide");
// };

// speak.onclick = function () {
//   speak.classList.add("hide");
//   mute.classList.remove("hide");
// };

canvas.onpointerdown = function () {
  if (mode == "gameOver") {
    restart();
  } else {
    if (mode == "bounce") mode = "fall";
  }
};

// Hiển thị màn hình load
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
