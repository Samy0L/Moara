import {
  state,
  ADIACENTE,
  numeJucator,
  piesaLa,
  poateEliminaPiesa,
} from "./pieces.js";

export function calculeazaNoduri(marime_canvas) {
  let noduri = [];
  let s = marime_canvas;
  let cx = s / 2;
  let cy = s / 2;
  let margine = s * 0.08;
  let pas = (s / 2 - margine) / 3;

  for (let inel = 0; inel < 3; inel++) {
    let h = s / 2 - margine - inel * pas;
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

  return noduri;
}

export function getNodLaClick(mx, my, noduri, marime_canvas) {
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

export function deseneazaTabla(marime_canvas, noduri) {
  stroke(200, 168, 75);
  strokeWeight(marime_canvas * 0.004);
  noFill();

  for (let inel = 0; inel < 3; inel++) {
    let tl = noduri[inel * 8 + 0];
    let br = noduri[inel * 8 + 4];
    rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  for (const mi of [1, 3, 5, 7]) {
    line(noduri[mi].x, noduri[mi].y, noduri[16 + mi].x, noduri[16 + mi].y);
  }
}

export function deseneazaNoduri(marime_canvas, noduri) {
  let r = marime_canvas * 0.018;

  for (let i = 0; i < noduri.length; i++) {
    if (piesaLa(i) !== 0) continue;

    let esteDestinatie = esteDestinatieValida(i);

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

function esteDestinatieValida(idx) {
  if (state.nodSelectat === -1) return false;
  if (state.faza[state.jucatorCurent] === 3) return true;
  return ADIACENTE[state.nodSelectat].includes(idx);
}

export function deseneazaPiese(marime_canvas, noduri) {
  let r = marime_canvas * 0.032;

  for (let i = 0; i < 24; i++) {
    let piesa = piesaLa(i);
    if (piesa === 0) continue;

    let nod = noduri[i];
    let eJ1 = piesa === 1;
    let inMoara = state.noduriMoara.includes(i);
    let eSelectat = i === state.nodSelectat;
    let eEliminabil =
      state.trebuieEliminata && poateEliminaPiesa(i, state.eliminaPentru);

    if (eJ1) {
      fill(220, 215, 200);
      stroke(150, 140, 130);
    } else {
      fill(35, 25, 12);
      stroke(200, 168, 75);
    }

    if (inMoara) {
      stroke(80, 220, 100);
      strokeWeight(4);
    } else if (eSelectat) {
      stroke(96, 170, 255);
      strokeWeight(4);
    } else if (eEliminabil) {
      stroke(255, 60, 60);
      strokeWeight(3);
    } else {
      strokeWeight(2);
    }

    ellipse(nod.x, nod.y, r * 2, r * 2);
  }
}

export function deseneazaMesaj(marime_canvas, jocPornit, mesajIntroducere) {
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
    let faza = state.faza[state.jucatorCurent];
    let nume = numeJucator(state.jucatorCurent);

    if (faza === 1) mesaj = `${nume} plaseaza o piesa.`;
    else if (faza === 2) mesaj = `${nume} muta o piesa.`;
    else mesaj = `${nume} zboara cu o piesa.`;
  }

  text(mesaj, marime_canvas / 2, marime_canvas - 14);
}
