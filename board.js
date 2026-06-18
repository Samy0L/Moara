// board.js — p5.js canvas: desenare + gestionare click-uri + UI HTML

import {
  state,
  ADIACENTE,
  plaseazaPiesa,
  mutaPiesa,
  eliminaPiesa,
  verificaInfrângere,
  actualizeazaFaza,
  numarPieseBoard,
  numeJucator,
  restartJoc,
  boardCaMatrice,
  idxToRC,
} from "./pieces.js";

let marime_canvas;
let noduri = [];
let jocPornit = false;
let mesajIntroducere = "Introdu numele jucatorului 1.";

// ── Buton Restart (desenat pe canvas) ──────────────────────────────────────

const restartButton = {
  x: 0, y: 0, w: 100, h: 32,
  init() {
    this.x = marime_canvas / 2 - this.w / 2;
    this.y = marime_canvas + 12;
  },
  draw() {
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
  checkIfClicked(mx, my) {
    if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
      restartJoc();
      jocPornit = false;
      mesajIntroducere = "Introdu numele jucatorului 1.";
      state.jocTerminat = false;
      document.getElementById("win-overlay").classList.add("hidden");
      document.getElementById("formular-jucator-1").style.display = "";
      document.getElementById("formular-jucator-2").style.display = "";
      document.getElementById("input-jucator-1").value = "";
      document.getElementById("input-jucator-2").value = "";
      document.getElementById("input-jucator-1").disabled = false;
      document.getElementById("buton-jucator-1").disabled = false;
      document.getElementById("input-jucator-2").disabled = true;
      document.getElementById("buton-jucator-2").disabled = true;
      document.getElementById("input-jucator-1").focus();
      actualizeazaUI();
    }
  },
};

// ── p5 lifecycle ──────────────────────────────────────────────────────────

function setup() {
  marime_canvas = calculeazaMarimaCanvas();
  const cnv = createCanvas(marime_canvas, marime_canvas + 60);
  cnv.parent("canvas-container");
  calculeazaNoduri();
  restartButton.init();
  pregatesteFormulareNume();
  actualizeazaUI();
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
  actualizeazaUI();
  deseneazaMesaj();
}

function mousePressed() {
  restartButton.checkIfClicked(mouseX, mouseY);
  if (!jocPornit || state.jocTerminat) return;

  mesajIntroducere = "";
  const idx = getNodLaClick(mouseX, mouseY);
  if (idx === -1) return;

  handleClick(idx); // async — nu blocheaza desenarea (draw loop-ul p5)
}

// ── Logica click ──────────────────────────────────────────────────────────

async function handleClick(idx) {
  // Elimina piesa adversarului dupa moara
  if (state.trebuieEliminata) {
    const rezultat = await eliminaPiesa(idx);
    if (rezultat && rezultat.castigator) {
      // Victoria se detecteaza imediat ce adversarul ramane cu < 3 piese
      declanseazaVictorie(rezultat.castigator);
    } else if (rezultat) {
      verificaVictorie();
    }
    return;
  }

  const faza = state.faza[state.jucatorCurent];

  // Faza 1 — plasare piesa
  if (faza === 1) {
    if (await plaseazaPiesa(idx)) {
      verificaVictorie();
    }
    return;
  }

  // Faza 2 / 3 — mutare / zbor
  // Selecteaza propria piesa
  if (state.board[idx] === state.jucatorCurent) {
    if (faza === 2) {
      const mutari = ADIACENTE[idx].filter((n) => state.board[n] === 0);
      if (mutari.length === 0) {
        state.mesaj = "⚠ Aceasta piesa nu are mutari disponibile.";
        state.nodSelectat = -1;
        return;
      }
    }
    state.nodSelectat = idx;
    state.mesaj = faza === 3
      ? "Piesa selectata. Alege orice nod liber."
      : "Piesa selectata. Alege unde sa mute.";
    return;
  }

  // Muta piesa selectata pe nodul liber
  if (state.nodSelectat !== -1 && state.board[idx] === 0) {
    if (await mutaPiesa(state.nodSelectat, idx)) {
      verificaVictorie();
    }
    return;
  }

  state.mesaj = "⚠ Selecteaza mai intai una din piesele tale.";
}

function verificaVictorie() {
  if (state.trebuieEliminata) return;
  const adversar = state.jucatorCurent === 1 ? 2 : 1;
  if (verificaInfrângere(adversar)) {
    declanseazaVictorie(state.jucatorCurent);
  }
}


function declanseazaVictorie(castigator) {
  state.jocTerminat = true;
  const perdant = castigator === 1 ? 2 : 1;
  document.getElementById("win-title").textContent = "🏆 Victorie!";
  document.getElementById("win-desc").textContent =
    `${numeJucator(castigator)} a castigat! ${numeJucator(perdant)} nu mai poate juca.`;
  document.getElementById("win-overlay").classList.remove("hidden");
}

// ── Desenare ──────────────────────────────────────────────────────────────

function deseneazaTabla() {
  stroke(200, 168, 75);
  strokeWeight(marime_canvas * 0.004);
  noFill();

  for (let inel = 0; inel < 3; inel++) {
    const tl = noduri[inel * 8 + 0];
    const br = noduri[inel * 8 + 4];
    rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  for (const mi of [1, 3, 5, 7]) {
    line(noduri[mi].x, noduri[mi].y, noduri[16 + mi].x, noduri[16 + mi].y);
  }
}

function deseneazaNoduri() {
  const r = marime_canvas * 0.018;

  for (let i = 0; i < noduri.length; i++) {
    if (state.board[i] !== 0) continue;

    // Marcheaza destinatii valide cand o piesa e selectata
    const esteDestinatie = state.nodSelectat !== -1 && (() => {
      const faza = state.faza[state.jucatorCurent];
      if (faza === 3) return true;
      return ADIACENTE[state.nodSelectat].includes(i);
    })();

    if (esteDestinatie) {
      stroke(96, 170, 255);
      strokeWeight(2);
      fill(96, 170, 255, 60);
    } else {
      stroke(200, 168, 75);
      strokeWeight(1.5);
      fill("#1a1a1a");
    }
    ellipse(noduri[i].x, noduri[i].y, r * 2, r * 2);

    if (!esteDestinatie) {
      noStroke();
      fill(200, 168, 75, 160);
      ellipse(noduri[i].x, noduri[i].y, r * 0.6, r * 0.6);
    }
  }
}

function deseneazaPiese() {
  const r = marime_canvas * 0.032;
  const matrice = boardCaMatrice(); // board-ul ca matrice 7x7

  for (let i = 0; i < 24; i++) {
    const [rr, cc] = idxToRC(i);
    if (matrice[rr][cc] === 0) continue;

    const nod = noduri[i];
    const eJ1 = matrice[rr][cc] === 1;
    const inMoara = state.noduriMoara.includes(i);
    const eSelectat = i === state.nodSelectat;
    const eElim =
      state.trebuieEliminata && state.board[i] !== state.eliminaPentru;

    if (eJ1) { fill(220, 215, 200); stroke(150, 140, 130); }
    else       { fill(35, 25, 12);   stroke(200, 168, 75); }

    if (inMoara)   { stroke(80, 220, 100); strokeWeight(4); }
    else if (eSelectat) { stroke(96, 170, 255); strokeWeight(4); }
    else if (eElim) { stroke(255, 60, 60); strokeWeight(3); }
    else            { strokeWeight(2); }

    ellipse(nod.x, nod.y, r * 2, r * 2);
  }
}

function deseneazaMesaj() {
  fill(200, 168, 75);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);

  let mesaj;
  if (!jocPornit || mesajIntroducere !== "") {
    mesaj = mesajIntroducere;
  } else if (state.jocTerminat) {
    mesaj = "";
  } else if (state.mesaj !== "") {
    mesaj = state.mesaj;
  } else {
    const faza = state.faza[state.jucatorCurent];
    const nume = numeJucator(state.jucatorCurent);
    if (faza === 1)      mesaj = `${nume} plaseaza o piesa.`;
    else if (faza === 2) mesaj = `${nume} muta o piesa.`;
    else                 mesaj = `${nume} zboara cu o piesa.`;
  }

  text(mesaj, marime_canvas / 2, marime_canvas - 14);
}

// ── UI HTML ────────────────────────────────────────────────────────────────

function actualizeazaUI() {
  let pieseJ1 = 0, pieseJ2 = 0;
  for (const v of state.board) {
    if (v === 1) pieseJ1++;
    if (v === 2) pieseJ2++;
  }

  document.getElementById("nume-jucator-1").textContent =
    state.numePj1 || "Nume necompletat";
  document.getElementById("nume-jucator-2").textContent =
    state.numePj2 || "Nume necompletat";
  document.getElementById("piese-tabla-1").textContent = pieseJ1;
  document.getElementById("piese-tabla-2").textContent = pieseJ2;
  document.getElementById("piese-ramase-1").textContent = state.pieseInMana[1];
  document.getElementById("piese-ramase-2").textContent = state.pieseInMana[2];
  document.getElementById("piese-luate-1").textContent = state.pieseLuate[1];
  document.getElementById("piese-luate-2").textContent = state.pieseLuate[2];

  // Evidentiaza panoul jucatorului activ
  document.getElementById("player-box-1").classList.toggle(
    "active-turn", jocPornit && state.jucatorCurent === 1 && !state.jocTerminat
  );
  document.getElementById("player-box-2").classList.toggle(
    "active-turn", jocPornit && state.jucatorCurent === 2 && !state.jocTerminat
  );
}

// ── Formulare nume ─────────────────────────────────────────────────────────

function pregatesteFormulareNume() {
  document.getElementById("buton-jucator-1").onclick = confirmaNumeJucator1;
  document.getElementById("buton-jucator-2").onclick = confirmaNumeJucator2;
  document.getElementById("input-jucator-1").onkeydown = (e) => {
    if (e.key === "Enter") confirmaNumeJucator1();
  };
  document.getElementById("input-jucator-2").onkeydown = (e) => {
    if (e.key === "Enter") confirmaNumeJucator2();
  };
  document.getElementById("input-jucator-1").focus();

  // Buton din win overlay
  document.getElementById("win-restart-btn").onclick = () => {
    restartButton.checkIfClicked(
      restartButton.x + 1,
      restartButton.y + 1
    );
  };
}

function confirmaNumeJucator1() {
  const input = document.getElementById("input-jucator-1");
  const nume = input.value.trim();
  if (!nume) { mesajIntroducere = "Introdu numele jucatorului 1."; return; }

  state.numePj1 = nume;
  document.getElementById("formular-jucator-1").style.display = "none";

  const inp2 = document.getElementById("input-jucator-2");
  const btn2 = document.getElementById("buton-jucator-2");
  inp2.disabled = false;
  btn2.disabled = false;
  inp2.focus();

  mesajIntroducere = "Introdu numele jucatorului 2.";
  actualizeazaUI();
}

function confirmaNumeJucator2() {
  const input = document.getElementById("input-jucator-2");
  const nume = input.value.trim();
  if (!nume) { mesajIntroducere = "Introdu numele jucatorului 2."; return; }

  state.numePj2 = nume;
  document.getElementById("formular-jucator-2").style.display = "none";
  mesajIntroducere = "";
  jocPornit = true;
  actualizeazaUI();
}

// ── Calcule geometrie ──────────────────────────────────────────────────────

function calculeazaMarimaCanvas() {
  let latimeDisponibila = windowWidth - 460;
  if (windowWidth <= 900) latimeDisponibila = windowWidth - 40;
  return max(min(latimeDisponibila, windowHeight - 120), 280);
}

function calculeazaNoduri() {
  noduri = [];
  const s = marime_canvas;
  const cx = s / 2, cy = s / 2;
  const margine = s * 0.08;
  const pas = (s / 2 - margine) / 3;

  for (let inel = 0; inel < 3; inel++) {
    const h = s / 2 - margine - inel * pas;
    noduri.push(
      { x: cx - h, y: cy - h }, { x: cx, y: cy - h }, { x: cx + h, y: cy - h },
      { x: cx + h, y: cy },
      { x: cx + h, y: cy + h }, { x: cx, y: cy + h }, { x: cx - h, y: cy + h },
      { x: cx - h, y: cy },
    );
  }
}

function getNodLaClick(mx, my) {
  const prag = marime_canvas * 0.05;
  let celMaiBun = -1, distMin = prag;
  for (let i = 0; i < noduri.length; i++) {
    const d = dist(mx, my, noduri[i].x, noduri[i].y);
    if (d < distMin) { distMin = d; celMaiBun = i; }
  }
  return celMaiBun;
}

// ── Expune functiile p5 global ─────────────────────────────────────────────

window.setup = setup;
window.windowResized = windowResized;
window.draw = draw;
window.mousePressed = mousePressed;
