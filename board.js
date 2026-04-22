let marime_canvas;
let noduri = [];

const restartButton = {
  x: 0,
  y: 0,
  w: 100,
  h: 32,
  init: function () {
    this.x = marime_canvas / 2 - this.w / 2;
    this.y = marime_canvas + 12;
  },
  draw: function () {
    fill(50, 45, 40);
    stroke(200, 168, 75);
    strokeWeight(1);
    rect(this.x, this.y, this.w, this.h, 4);

    fill(200, 168, 75);
    noStroke();
    textSize(13);
    textAlign(CENTER, CENTER);
    text("Restart", this.x + this.w / 2, this.y + this.h / 2);
  },
  checkIfClicked: function () {
    if (
      mouseX >= this.x &&
      mouseX <= this.x + this.w &&
      mouseY >= this.y &&
      mouseY <= this.y + this.h
    ) {
      restartJoc();
    }
  },
};

function setup() {
  marime_canvas = calculeazaMarimaCanvas();
  let cnv = createCanvas(marime_canvas, marime_canvas + 60);
  cnv.parent("canvas-container");
  calculeazaNoduri();
  restartButton.init();
}

function windowResized() {
  marime_canvas = calculeazaMarimaCanvas();
  resizeCanvas(marime_canvas, marime_canvas + 60);
  calculeazaNoduri();
  restartButton.init();
}

function draw() {
  background("#1a1a1a");
  deseneazaTabla();
  deseneazaNoduri();
  deseneazaPiese();
  restartButton.draw();

  fill(200, 168, 75);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  let numeActual = jucatorCurent === 1 ? numePj1 : numePj2;
  text(
    numeActual + " plaseaza o piesa.",
    marime_canvas / 2,
    marime_canvas -14,
  );
}

function mousePressed() {
  restartButton.checkIfClicked();

  let idx = getNodLaClick(mouseX, mouseY);
  if (idx !== -1) {
    plaseazaPiesa(idx);
  }
}

function calculeazaMarimaCanvas() {
  let spatiu = min(windowWidth - 40, windowHeight - 120);
  return max(spatiu, 280);
}

function calculeazaNoduri() {
  noduri = [];
  let s = marime_canvas;
  let cx = s / 2;
  let cy = s / 2;
  let margine = s * 0.08;
  let pas = (s / 2 - margine) / 3;

  let jumatati = [
    s / 2 - margine,
    s / 2 - margine - pas,
    s / 2 - margine - pas * 2,
  ];

  for (let inel = 0; inel < 3; inel++) {
    let h = jumatati[inel];
    noduri.push(
      { x: cx - h, y: cy - h },
      { x: cx, y: cy - h },
      { x: cx + h, y: cy - h },
      { x: cx + h, y: cy },
      { x: cx + h, y: cy + h },
      { x: cx, y: cy + h },
      { x: cx - h, y: cy + h },
      { x: cx - h, y: cy },
    );
  }
}

function getNodLaClick(mx, my) {
  let prag = marime_canvas * 0.05;
  let celMaiBun = -1;
  let distMin = prag;

  for (let i = 0; i < noduri.length; i++) {
    let d = dist(mx, my, noduri[i].x, noduri[i].y);
    if (d < distMin) {
      distMin = d;
      celMaiBun = i;
    }
  }
  return celMaiBun;
}

function deseneazaTabla() {
  stroke(200, 168, 75);
  strokeWeight(marime_canvas * 0.004);
  noFill();

  for (let inel = 0; inel < 3; inel++) {
    let tl = noduri[inel * 8 + 0];
    let br = noduri[inel * 8 + 4];
    rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  for (let mi of [1, 3, 5, 7]) {
    line(noduri[mi].x, noduri[mi].y, noduri[16 + mi].x, noduri[16 + mi].y);
  }
}

function deseneazaNoduri() {
  let r = marime_canvas * 0.018;

  for (let i = 0; i < noduri.length; i++) {
    if (board[i] !== 0) continue;

    stroke(200, 168, 75);
    strokeWeight(1.5);
    fill("#1a1a1a");
    ellipse(noduri[i].x, noduri[i].y, r * 2, r * 2);

    noStroke();
    fill(200, 168, 75, 160);
    ellipse(noduri[i].x, noduri[i].y, r * 0.6, r * 0.6);
  }
}
