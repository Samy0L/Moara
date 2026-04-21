// board.js - canvas p5.js: desenarea tablei si gestionarea click-urilor
//
// Indexarea nodurilor (0-23):
//   Inel exterior : noduri  0-7
//   Inel mijlociu : noduri  8-15
//   Inel interior : noduri 16-23
//
// Ordinea in fiecare inel (sensul acelor de ceasornic, start stanga-sus):
//   TL(0), T(1), TR(2), R(3), BR(4), B(5), BL(6), L(7)

let MARIME_CANVAS;
let noduri = [];

function setup() {
  MARIME_CANVAS = calculeazaMarimaCanvas();
  let cnv = createCanvas(MARIME_CANVAS, MARIME_CANVAS);
  cnv.parent('canvas-container');
  calculeazaNoduri();
  actualizeazaUI();
}

function windowResized() {
  MARIME_CANVAS = calculeazaMarimaCanvas();
  resizeCanvas(MARIME_CANVAS, MARIME_CANVAS);
  calculeazaNoduri();
}

function draw() {
  background('#1a1a1a');
  deseneazaTabla();
  deseneazaNoduri();
  deseneazaMori();
  deseneazaDestinatieMutare();
  deseneazaEleminabile();
  deseneazaPiese();
}

function mousePressed() {
  if (jocTerminat) return;
  let idx = getNodLaClick(mouseX, mouseY);
  if (idx !== -1) {
    handleClick(idx);
  }
}

// Calculeaza dimensiunea canvasului in functie de ecran
function calculeazaMarimaCanvas() {
  let spatiu = min(windowWidth - 320, windowHeight - 120);
  return max(spatiu, 280);
}

// Calculeaza coordonatele x,y ale celor 24 de noduri
function calculeazaNoduri() {
  noduri = [];
  let s  = MARIME_CANVAS;
  let cx = s / 2;
  let cy = s / 2;
  let margine = s * 0.08;
  let pas = (s / 2 - margine) / 3;

  let jumatati = [
    s / 2 - margine,
    s / 2 - margine - pas,
    s / 2 - margine - pas * 2
  ];

  for (let inel = 0; inel < 3; inel++) {
    let h = jumatati[inel];
    noduri.push(
      { x: cx - h, y: cy - h }, // TL
      { x: cx,     y: cy - h }, // T
      { x: cx + h, y: cy - h }, // TR
      { x: cx + h, y: cy     }, // R
      { x: cx + h, y: cy + h }, // BR
      { x: cx,     y: cy + h }, // B
      { x: cx - h, y: cy + h }, // BL
      { x: cx - h, y: cy     }  // L
    );
  }
}

// Returneaza indexul nodului cel mai aproape de click (-1 daca e prea departe)
function getNodLaClick(mx, my) {
  let prag = MARIME_CANVAS * 0.05;
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

// Deseneaza cele 3 patrate si cele 4 linii radiale
function deseneazaTabla() {
  stroke(200, 168, 75);
  strokeWeight(MARIME_CANVAS * 0.004);
  noFill();

  // 3 patrate concentrice
  for (let inel = 0; inel < 3; inel++) {
    let tl = noduri[inel * 8 + 0];
    let br = noduri[inel * 8 + 4];
    rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  // 4 linii radiale (leaga mijlocul fiecarei laturi)
  for (let mi of [1, 3, 5, 7]) {
    line(noduri[mi].x, noduri[mi].y, noduri[16 + mi].x, noduri[16 + mi].y);
  }
}

// Deseneaza un punct mic la fiecare nod liber
function deseneazaNoduri() {
  let r = MARIME_CANVAS * 0.018;

  for (let i = 0; i < noduri.length; i++) {
    if (board[i] !== 0) continue; // nodul ocupat e desenat de deseneazaPiese

    stroke(200, 168, 75);
    strokeWeight(1.5);
    fill('#1a1a1a');
    ellipse(noduri[i].x, noduri[i].y, r * 2, r * 2);

    noStroke();
    fill(200, 168, 75, 160);
    ellipse(noduri[i].x, noduri[i].y, r * 0.6, r * 0.6);
  }
}