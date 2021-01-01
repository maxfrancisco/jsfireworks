const GRAVITY = 0.2;
const SHELLTYPES = [
  "simple",
  "split",
  "burst",
  "double",
  "mega",
  "writer",
  "pent",
  "comet",
];

let PAUSED = true;
let MUTE = false;

var shells = [];
var sparkles = [];
var sounds = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  strokeWeight(1);
  colorMode(HSB);
  for (let i = 0; i < 3; i++) {
    sounds.push(loadSound("sounds/explosion" + i + ".mp3"));
  }
}

/*
From p5.js docs: Called directly after setup(), the draw() function continuously
executes the lines of code contained inside its block until the program is
stopped or noLoop() is called.
*/
function draw() {
  translate(width / 2, height);
  background("rgba(0, 0, 0, 0.2)");

  /* Remove the exploded shells and burnt out sparkles */
  shells = shells.filter((shell) => !shell.exploded);
  sparkles = sparkles.filter((sparkle) => sparkle.brt > 0);

  /* Draw the shells and sparkles */
  for (let shell of shells) shell.draw();
  for (let sparkle of sparkles) sparkle.draw();

  /* Generate new shell with small probability */
  if (random() < 0.03) {
    let s = new Shell();
    shells.push(s);
  }
}

function touchMoved() {
  touchStarted();
  return false;
}

function touchStarted() {
  let speed = createVector(0, 0);
  let pos = createVector(mouseX - width / 2, mouseY - height);
  let s = new Shell(pos, speed);
  s.explode();
  return false;
}

function keyPressed() {
  if (keyCode == 32) {
    /* Space bar */
    if (PAUSED) {
      PAUSED = false;
      /* Draw a pause symbol in top right corner */
      strokeWeight(1);
      fill(255);
      rect(width / 2 - 30, -height + 20, 10, 30);
      rect(width / 2 - 50, -height + 20, 10, 30);
      noLoop();
    } else {
      PAUSED = true;
      loop();
    }
    return false;
  }
  if (keyCode == 83) {
    /* 's' for sound effects */
    MUTE = !MUTE;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function Shell(pos, vel, type, sparkleTrail) {
  this.pos = pos || createVector(int(random(-width / 4, width / 4)), 0);
  this.vel = vel || createVector(random(-2, 2), -random(11, 16));
  this.sparkleTrail = sparkleTrail || random() < 0.5;
  this.fuse = random(-3, -1);
  this.hue = round(random(0, 360));
  this.type = type;
  this.exploded = false;

  // Get random type, if not set
  if (this.type == undefined) {
    let randIndex = floor(random(0, SHELLTYPES.length));
    this.type = SHELLTYPES[randIndex];
  }

  this.draw = () => {
    // Remove burnt-out sparkles
    // sparkles = sparkles.filter((sparkle) => sparkle.brt > 0);

    // Explode if at the apex (i.e., vel )
    if (this.fuse < this.vel.y) {
      this.explode();
      return;
    }

    // Sparkle trail
    if (this.sparkleTrail) {
      // Random sparkle direction between 0 and 2 pi
      let sparkleDir = random(0, TWO_PI);
      // Random velocity between 0 and 1
      let sparkleVel = random(0, 1);
      // Random speed? - maybe the jitter?
      let sparkleSpd = createVector(
        sparkleVel * cos(sparkleDir),
        sparkleVel * sin(sparkleDir)
      );
      // Sparkle position
      let sparklePos = createVector(
        this.pos.x + sparkleSpd.x,
        this.pos.y + sparkleSpd.y
      );
      let s = new Sparkle(
        sparklePos,
        sparkleSpd,
        random(50, 75),
        floor(random(20, 40)),
        floor(random(0, 30))
      );
      sparkles.push(s);
    }

    // Color shell ±10 hue and 0-20 saturation, fixed brightness
    stroke(this.hue + round(random(-10, 10)), random(0, 20), 90);
    point(this.pos.x, this.pos.y);

    // Update shell position
    this.pos.add(this.vel);
    this.vel.y = this.vel.y + GRAVITY;
  };

  this.drawSparkles = (
    numSparkles,
    velMin,
    velMax,
    fadeMin,
    fadeMax,
    type,
    baseDir,
    angle
  ) => {
    for (let i = 0; i < numSparkles; i++) {
      let dir = random(0, TWO_PI);
      if (baseDir != undefined) dir = baseDir + random(0, PI / angle);
      let vel = random(velMin, velMax);
      let sparkleSpd = createVector(
        this.vel.x + vel * cos(dir),
        this.vel.y + vel * sin(dir)
      );
      let hue = this.hue + round(random(-10, 10));
      let sat = round(random(0, 40));
      let fade = random(fadeMin, fadeMax);
      let sparkle = new Sparkle(
        this.pos.copy(),
        sparkleSpd,
        fade,
        hue,
        sat,
        type
      );
      sparkles.push(sparkle);
    }
  };

  this.explode = () => {
    if (this.type == "split") {
      this.drawSparkles(30, 3, 5, 3, 8, "writer");
      this.drawSparkles(10, 3, 5, 3, 6, "sparkler");
    } else if (this.type == "burst") {
      this.drawSparkles(60, 0, 6, 3, 8, "sparkler");
    } else if (this.type == "double") {
      this.drawSparkles(90, 3, 5, 2, 4);
      this.drawSparkles(90, 0.5, 2, 4, 6, "writer");
    } else if (this.type == "mega") {
      this.drawSparkles(600, 0, 8, 3, 8);
    } else if (this.type == "writer") {
      this.drawSparkles(100, 0, 5, 1, 3, "writer");
    } else if (this.type == "simple") {
      this.drawSparkles(100, 0, 5, 1, 3);
    } else if (this.type == "pent") {
      let baseDir = random(0, TWO_PI);
      this.drawSparkles(20, 3, 5, 3, 8, "writer", baseDir + (2 / 5) * PI, 6);
      this.drawSparkles(20, 3, 5, 3, 8, "writer", baseDir + (4 / 5) * PI, 6);
      this.drawSparkles(20, 3, 5, 3, 8, "writer", baseDir + (6 / 5) * PI, 6);
      this.drawSparkles(20, 3, 5, 3, 8, "writer", baseDir + (8 / 5) * PI, 6);
      this.drawSparkles(20, 3, 5, 3, 8, "writer", baseDir + (10 / 5) * PI, 6);
    } else if (this.type == "comet") {
      let baseDir = random(0, TWO_PI);
      this.drawSparkles(
        10,
        3,
        7,
        3,
        8,
        "sparkler",
        baseDir + (2 / 3) * PI,
        128
      );
      this.drawSparkles(
        10,
        3,
        7,
        3,
        8,
        "sparkler",
        baseDir + (4 / 3) * PI,
        128
      );
      this.drawSparkles(
        10,
        3,
        7,
        3,
        8,
        "sparkler",
        baseDir + (6 / 3) * PI,
        128
      );
      this.drawSparkles(200, 0, 8, 3, 8, "writer");
    }
    this.exploded = true;
    if (!MUTE) {
      let randIndex = floor(random(0, sounds.length));
      sounds[randIndex].play();
    }
  };
}

function Sparkle(pos, vel, fade, hue, sat, type = "default") {
  this.pos = pos;
  this.vel = vel;
  this.fade = fade;
  this.hue = hue;
  this.sat = sat;
  this.type = type;

  this.brt = 255;
  this.burntime = 0;

  this.draw = () => {
    // Color Sparkle
    stroke(this.hue, this.sat, this.brt);

    // Trail
    let newXPos = this.pos.x + log(this.burntime) * 8 * this.vel.x;
    let newYPos =
      this.pos.y +
      log(this.burntime) * 8 * this.vel.y +
      this.burntime * GRAVITY;
    point(newXPos, newYPos);

    if (this.type == "writer" && this.burntime > 1) {
      line(
        newXPos,
        newYPos,
        this.pos.x + log(this.burntime - 2) * 8 * this.vel.x,
        this.pos.y +
          log(this.burntime - 2) * 8 * this.vel.y +
          this.burntime * GRAVITY
      );
    }

    if (this.type == "sparkler") {
      let dir = random(0, TWO_PI);
      let vel = random(0, 1);
      let sparkleSpd = createVector(vel * cos(dir), vel * sin(dir));
      let sparkle = new Sparkle(
        createVector(newXPos + sparkleSpd.x, newYPos + sparkleSpd.y),
        sparkleSpd,
        random(50, 75),
        round(random(20, 40)),
        round(random(0, 30))
      );
      sparkles.push(sparkle);
    }

    // Fade
    this.brt -= this.fade;
    this.burntime++;
  };
}
