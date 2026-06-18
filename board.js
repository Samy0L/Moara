// board.js - fisierul principal al jocului

import {
  state,
  ADIACENTE,
  plaseazaPiesa,
  mutaPiesa,
  eliminaPiesa,
  verificaInfrangere,
  restartJoc,
  piesaLa,
} from "./pieces.js";

import { mutareCalculator } from "./computer.js";

import {
  calculeazaNoduri,
  getNodLaClick,
  deseneazaTabla,
  deseneazaNoduri,
  deseneazaPiese,
  deseneazaMesaj,
} from "./render.js";

import {
  actualizeazaUI,
  pregatesteSelectareMod,
  getModJocSelectat,
  actualizeazaTextMod,
  pregatesteFormulareNume,
  arataFormularJucator2,
  ascundeFormularJucator1,
  ascundeFormularJucator2,
  resetFormulare,
  citesteNumeJucator1,
  citesteNumeJucator2,
  arataVictorie,
  ascundeVictorie,
} from "./ui.js";

let marime_canvas;
let noduri = [];
let jocPornit = false;
let mesajIntroducere = "Alege modul de joc.";
let modJoc = "human-human";
let calculatorLucreaza = false;

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
  checkIfClicked: function (mx, my) {
    if (
      mx >= this.x &&
      mx <= this.x + this.w &&
      my >= this.y &&
      my <= this.y + this.h
    ) {
      restartComplet();
    }
  },
};

function setup() {
  marime_canvas = calculeazaMarimaCanvas();
  let cnv = createCanvas(marime_canvas, marime_canvas + 60);
  cnv.parent("canvas-container");
  noduri = calculeazaNoduri(marime_canvas);
  restartButton.init();

  modJoc = getModJocSelectat();
  actualizeazaTextMod(modJoc);
  pregatesteSelectareMod(schimbaModJoc);
  pregatesteFormulareNume(
    confirmaNumeJucator1,
    confirmaNumeJucator2,
    restartComplet
  );
  actualizeazaUI(jocPornit);
}

function windowResized() {
  marime_canvas = calculeazaMarimaCanvas();
  resizeCanvas(marime_canvas, marime_canvas + 60);
  noduri = calculeazaNoduri(marime_canvas);
  restartButton.init();
}

function draw() {
  background("#1a1a1a");
  deseneazaTabla(marime_canvas, noduri);
  deseneazaNoduri(marime_canvas, noduri);
  deseneazaPiese(marime_canvas, noduri);
  restartButton.draw();
  actualizeazaUI(jocPornit);
  deseneazaMesaj(marime_canvas, jocPornit, mesajIntroducere);

  if (jocPornit && esteRandulCalculatorului() && !calculatorLucreaza) {
    ruleazaCalculator();
  }
}

function mousePressed() {
  restartButton.checkIfClicked(mouseX, mouseY);

  if (!jocPornit || state.jocTerminat || esteRandulCalculatorului()) {
    return;
  }

  mesajIntroducere = "";
  let idx = getNodLaClick(mouseX, mouseY, noduri, marime_canvas);
  if (idx === -1) return;

  handleClick(idx);
}

async function handleClick(idx) {
  if (state.trebuieEliminata) {
    let rezultat = await eliminaPiesa(idx);
    proceseazaRezultat(rezultat);
    return;
  }

  let faza = state.faza[state.jucatorCurent];

  if (faza === 1) {
    let rezultat = await plaseazaPiesa(idx);
    if (rezultat) verificaVictorie();
    return;
  }

  if (piesaLa(idx) === state.jucatorCurent) {
    selecteazaPiesa(idx, faza);
    return;
  }

  if (state.nodSelectat !== -1 && piesaLa(idx) === 0) {
    let rezultat = await mutaPiesa(state.nodSelectat, idx);
    if (rezultat) verificaVictorie();
    return;
  }

  state.mesaj = "Selecteaza mai intai una din piesele tale.";
}

function selecteazaPiesa(idx, faza) {
  if (faza === 2) {
    let mutari = ADIACENTE[idx].filter((n) => piesaLa(n) === 0);
    if (mutari.length === 0) {
      state.mesaj = "Aceasta piesa nu are mutari disponibile.";
      state.nodSelectat = -1;
      return;
    }
  }

  state.nodSelectat = idx;
  state.mesaj = faza === 3
    ? "Piesa selectata. Alege orice nod liber."
    : "Piesa selectata. Alege unde sa mute.";
}

function verificaVictorie() {
  if (state.trebuieEliminata) return;

  let jucatorDeVerificat = state.jucatorCurent;
  if (verificaInfrangere(jucatorDeVerificat)) {
    let castigator = jucatorDeVerificat === 1 ? 2 : 1;
    declanseazaVictorie(castigator);
  }
}

function proceseazaRezultat(rezultat) {
  if (rezultat && rezultat.castigator) {
    declanseazaVictorie(rezultat.castigator);
    return;
  }

  if (rezultat) {
    verificaVictorie();
  }
}

function declanseazaVictorie(castigator) {
  state.jocTerminat = true;
  arataVictorie(castigator);
}

function esteRandulCalculatorului() {
  return modJoc !== "human-human" && state.jucatorCurent === 2;
}

async function ruleazaCalculator() {
  calculatorLucreaza = true;
  await mutareCalculator(modJoc, proceseazaRezultat, declanseazaVictorie);
  calculatorLucreaza = false;
}

function confirmaNumeJucator1() {
  let nume = citesteNumeJucator1();
  if (!nume) {
    mesajIntroducere = "Introdu numele jucatorului 1.";
    return;
  }

  state.numePj1 = nume;
  ascundeFormularJucator1();

  if (modJoc === "human-human") {
    arataFormularJucator2();
    mesajIntroducere = "Introdu numele jucatorului 2.";
  } else {
    state.numePj2 = modJoc === "computer-easy"
      ? "Calculator Easy"
      : "Calculator Moderate";
    ascundeFormularJucator2();
    mesajIntroducere = "";
    jocPornit = true;
  }

  actualizeazaUI(jocPornit);
}

function confirmaNumeJucator2() {
  let nume = citesteNumeJucator2();
  if (!nume) {
    mesajIntroducere = "Introdu numele jucatorului 2.";
    return;
  }

  state.numePj2 = nume;
  ascundeFormularJucator2();
  mesajIntroducere = "";
  jocPornit = true;
  actualizeazaUI(jocPornit);
}

function schimbaModJoc(noulMod) {
  modJoc = noulMod;
  restartComplet();
}

function restartComplet() {
  restartJoc();
  jocPornit = false;
  calculatorLucreaza = false;
  mesajIntroducere = "Introdu numele jucatorului 1.";
  modJoc = getModJocSelectat();
  actualizeazaTextMod(modJoc);
  ascundeVictorie();
  resetFormulare();
  actualizeazaUI(jocPornit);
}

function calculeazaMarimaCanvas() {
  let latimeDisponibila = windowWidth <= 900 ? windowWidth - 40 : windowWidth - 460;
  return max(min(latimeDisponibila, windowHeight - 120), 280);
}

window.setup = setup;
window.windowResized = windowResized;
window.draw = draw;
window.mousePressed = mousePressed;
