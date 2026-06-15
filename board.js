import {
  board,
  pieseInMana,
  pieseLuate,
  jucatorCurent,
  numePj1,
  numePj2,
  mesajMoara,
  seteazaNumeJucator1,
  seteazaNumeJucator2,
  plaseazaPiesa,
  deseneazaPiese,
  restartJoc,
} from "./pieces.js";

let marime_canvas;
let noduri = [];
let jocPornit = false;
let mesajIntroducere = "Introdu numele jucatorului 1.";

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
  pregatesteFormulareNume();
  actualizeazaCaseteJucatori();
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
  deseneazaPiese(noduri, marime_canvas);
  restartButton.draw();
  actualizeazaCaseteJucatori();

  fill(200, 168, 75);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  let numeActual = jucatorCurent === 1 ? numePj1 : numePj2;
  let mesaj = numeActual + " plaseaza o piesa.";

  if (!jocPornit || mesajIntroducere !== "") {
    mesaj = mesajIntroducere;
  } else if (mesajMoara !== "") {
    mesaj = mesajMoara;
  }

  text(mesaj, marime_canvas / 2, marime_canvas - 14);
}

function mousePressed() {
  restartButton.checkIfClicked();

  if (!jocPornit) {
    return;
  }

  mesajIntroducere = "";

  let idx = getNodLaClick(mouseX, mouseY);
  if (idx !== -1) {
    plaseazaPiesa(idx);
  }
}

function calculeazaMarimaCanvas() {
  let latimeDisponibila = windowWidth - 460;

  if (windowWidth <= 900) {
    latimeDisponibila = windowWidth - 40;
  }

  let spatiu = min(latimeDisponibila, windowHeight - 120);
  return max(spatiu, 280);
}

function actualizeazaCaseteJucatori() {
  let pieseJucator1 = 0;
  let pieseJucator2 = 0;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === 1) {
      pieseJucator1++;
    }

    if (board[i] === 2) {
      pieseJucator2++;
    }
  }

  document.getElementById("nume-jucator-1").textContent =
    numePj1 === "" ? "Nume necompletat" : numePj1;
  document.getElementById("nume-jucator-2").textContent =
    numePj2 === "" ? "Nume necompletat" : numePj2;
  document.getElementById("piese-tabla-1").textContent = pieseJucator1;
  document.getElementById("piese-tabla-2").textContent = pieseJucator2;
  document.getElementById("piese-ramase-1").textContent = pieseInMana[1];
  document.getElementById("piese-ramase-2").textContent = pieseInMana[2];
  document.getElementById("piese-luate-1").textContent = pieseLuate[1];
  document.getElementById("piese-luate-2").textContent = pieseLuate[2];
}

function pregatesteFormulareNume() {
  let inputJucator1 = document.getElementById("input-jucator-1");
  let inputJucator2 = document.getElementById("input-jucator-2");
  let butonJucator1 = document.getElementById("buton-jucator-1");
  let butonJucator2 = document.getElementById("buton-jucator-2");

  butonJucator1.onclick = function () {
    confirmaNumeJucator1();
  };

  butonJucator2.onclick = function () {
    confirmaNumeJucator2();
  };

  inputJucator1.onkeydown = function (event) {
    if (event.key === "Enter") {
      confirmaNumeJucator1();
    }
  };

  inputJucator2.onkeydown = function (event) {
    if (event.key === "Enter") {
      confirmaNumeJucator2();
    }
  };

  inputJucator1.focus();
}

function confirmaNumeJucator1() {
  let inputJucator1 = document.getElementById("input-jucator-1");
  let nume = inputJucator1.value.trim();

  if (nume === "") {
    mesajIntroducere = "Introdu numele jucatorului 1.";
    return;
  }

  seteazaNumeJucator1(nume);
  document.getElementById("formular-jucator-1").style.display = "none";

  let inputJucator2 = document.getElementById("input-jucator-2");
  let butonJucator2 = document.getElementById("buton-jucator-2");
  inputJucator2.disabled = false;
  butonJucator2.disabled = false;
  inputJucator2.focus();

  mesajIntroducere = "Introdu numele jucatorului 2.";
  actualizeazaCaseteJucatori();
}

function confirmaNumeJucator2() {
  let inputJucator2 = document.getElementById("input-jucator-2");
  let nume = inputJucator2.value.trim();

  if (nume === "") {
    mesajIntroducere = "Introdu numele jucatorului 2.";
    return;
  }

  seteazaNumeJucator2(nume);
  document.getElementById("formular-jucator-2").style.display = "none";
  mesajIntroducere = "Distractie la joc!";
  jocPornit = true;
  actualizeazaCaseteJucatori();
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

window.setup = setup;
window.windowResized = windowResized;
window.draw = draw;
window.mousePressed = mousePressed;
