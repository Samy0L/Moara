// pieces.js - starea jocului si logica de baza

const MAX_PIESE = 9;

export const MORI_POSIBILE = [
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

const POZITII_MATRICE = [
  [0, 0], [0, 3], [0, 6],
  [1, 1], [1, 3], [1, 5],
  [2, 2], [2, 3], [2, 4],
  [3, 0], [3, 1], [3, 2],
  [3, 4], [3, 5], [3, 6],
  [4, 2], [4, 3], [4, 4],
  [5, 1], [5, 3], [5, 5],
  [6, 0], [6, 3], [6, 6],
];

export const ADIACENTE = buildAdiacente();

export const state = {
  board: creeazaMatriceBoard(),
  pieseInMana: { 1: MAX_PIESE, 2: MAX_PIESE },
  pieseLuate: { 1: 0, 2: 0 },
  faza: { 1: 1, 2: 1 },
  jucatorCurent: 1,
  numePj1: "",
  numePj2: "",
  trebuieEliminata: false,
  eliminaPentru: 0,
  noduriMoara: [],
  mesaj: "",
  nodSelectat: -1,
  jocTerminat: false,
};

function creeazaMatriceBoard() {
  const matrice = Array.from({ length: 7 }, () => Array(7).fill(null));

  for (let i = 0; i < POZITII_MATRICE.length; i++) {
    const [r, c] = POZITII_MATRICE[i];
    matrice[r][c] = 0;
  }

  return matrice;
}

function buildAdiacente() {
  const adj = Array.from({ length: 24 }, () => new Set());

  for (const [a, b, c] of MORI_POSIBILE) {
    adj[a].add(b);
    adj[b].add(a);
    adj[b].add(c);
    adj[c].add(b);
  }

  return adj.map((s) => [...s]);
}

function idxToRC(idx) {
  return POZITII_MATRICE[idx];
}

export function piesaLa(idx) {
  const [r, c] = idxToRC(idx);
  return state.board[r][c];
}

export function punePiesaLa(idx, valoare) {
  const [r, c] = idxToRC(idx);
  state.board[r][c] = valoare;
}

function pozitiiGoale() {
  const pozitii = [];

  for (let i = 0; i < 24; i++) {
    if (piesaLa(i) === 0) {
      pozitii.push(i);
    }
  }

  return pozitii;
}

export function pozitiiJucator(jucator) {
  const pozitii = [];

  for (let i = 0; i < 24; i++) {
    if (piesaLa(i) === jucator) {
      pozitii.push(i);
    }
  }

  return pozitii;
}

export function numarPieseBoard(jucator) {
  return pozitiiJucator(jucator).length;
}

export function actualizeazaFaza(jucator) {
  if (state.pieseInMana[jucator] > 0) {
    state.faza[jucator] = 1;
    return;
  }

  state.faza[jucator] = numarPieseBoard(jucator) <= 3 ? 3 : 2;
}

export function verificaMoara(idx, jucator) {
  let gasita = false;
  const nouNoduri = [];

  for (const moara of MORI_POSIBILE) {
    if (
      moara.includes(idx) &&
      piesaLa(moara[0]) === jucator &&
      piesaLa(moara[1]) === jucator &&
      piesaLa(moara[2]) === jucator
    ) {
      gasita = true;

      for (const n of moara) {
        if (!nouNoduri.includes(n)) {
          nouNoduri.push(n);
        }
      }
    }
  }

  if (gasita) {
    state.noduriMoara = nouNoduri;
  }

  return gasita;
}

export function estePiesaInMoara(idx, jucator) {
  return MORI_POSIBILE.some(
    (moara) =>
      moara.includes(idx) &&
      piesaLa(moara[0]) === jucator &&
      piesaLa(moara[1]) === jucator &&
      piesaLa(moara[2]) === jucator
  );
}

export function poateEliminaPiesa(idx, jucatorCareElimina) {
  const adversar = jucatorCareElimina === 1 ? 2 : 1;

  if (piesaLa(idx) !== adversar) {
    return false;
  }

  if (estePiesaInMoara(idx, adversar)) {
    return false;
  }

  return true;
}

export function existaPiesaEliminabila(jucatorCareElimina) {
  for (let i = 0; i < 24; i++) {
    if (poateEliminaPiesa(i, jucatorCareElimina)) {
      return true;
    }
  }

  return false;
}

export function mutariDisponibile(jucator) {
  actualizeazaFaza(jucator);

  if (state.faza[jucator] === 1) {
    return pozitiiGoale().map((to) => ({ from: -1, to }));
  }

  if (state.faza[jucator] === 3) {
    const mutari = [];
    const piese = pozitiiJucator(jucator);
    const goale = pozitiiGoale();

    for (const from of piese) {
      for (const to of goale) {
        mutari.push({ from, to });
      }
    }

    return mutari;
  }

  const mutari = [];

  for (let i = 0; i < 24; i++) {
    if (piesaLa(i) !== jucator) continue;

    for (const j of ADIACENTE[i]) {
      if (piesaLa(j) === 0) {
        mutari.push({ from: i, to: j });
      }
    }
  }

  return mutari;
}

export function verificaInfrangere(jucator) {
  actualizeazaFaza(jucator);

  if (state.pieseInMana[jucator] === 0 && numarPieseBoard(jucator) < 3) {
    return true;
  }

  if (state.faza[jucator] === 2 && mutariDisponibile(jucator).length === 0) {
    return true;
  }

  return false;
}

function asteapta(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function plaseazaPiesa(idx) {
  if (piesaLa(idx) !== 0) {
    state.mesaj = "Nodul este ocupat.";
    return false;
  }

  if (state.pieseInMana[state.jucatorCurent] <= 0) {
    return false;
  }

  await asteapta(150);

  punePiesaLa(idx, state.jucatorCurent);
  state.pieseInMana[state.jucatorCurent]--;
  state.noduriMoara = [];

  finalizeazaMutarea(idx);
  return true;
}

export async function mutaPiesa(from, to) {
  const faza = state.faza[state.jucatorCurent];

  if (piesaLa(from) !== state.jucatorCurent || piesaLa(to) !== 0) {
    state.mesaj = "Mutarea nu este valida.";
    return false;
  }

  if (faza === 2 && !ADIACENTE[from].includes(to)) {
    state.mesaj = "Noduri neadiacente. Alege un vecin liber.";
    return false;
  }

  await asteapta(150);

  punePiesaLa(to, state.jucatorCurent);
  punePiesaLa(from, 0);
  state.nodSelectat = -1;
  state.noduriMoara = [];

  finalizeazaMutarea(to);
  return true;
}

function finalizeazaMutarea(idx) {
  if (!verificaMoara(idx, state.jucatorCurent)) {
    schimbaJucatorul();
    return;
  }

  const nume = numeJucator(state.jucatorCurent);

  if (existaPiesaEliminabila(state.jucatorCurent)) {
    state.mesaj = `${nume} a format o MOARA! Alege o piesa adversa.`;
    state.trebuieEliminata = true;
    state.eliminaPentru = state.jucatorCurent;
    return;
  }

  state.mesaj =
    `${nume} a format o MOARA, dar adversarul are doar piese protejate.`;
  schimbaJucatorul();
}

export async function eliminaPiesa(idx) {
  const castigator = state.eliminaPentru;
  const adversar = castigator === 1 ? 2 : 1;

  if (piesaLa(idx) !== adversar) {
    state.mesaj = "Alege o piesa a adversarului.";
    return false;
  }

  if (!poateEliminaPiesa(idx, castigator)) {
    state.mesaj = "Piesa este protejata de moara deja existenta. Alege alta.";
    return false;
  }

  await asteapta(150);

  punePiesaLa(idx, 0);
  state.pieseLuate[castigator]++;
  state.trebuieEliminata = false;
  state.eliminaPentru = 0;
  state.noduriMoara = [];
  state.mesaj = "";

  actualizeazaFaza(adversar);
  if (state.pieseInMana[adversar] === 0 && numarPieseBoard(adversar) < 3) {
    return { castigator };
  }

  schimbaJucatorul();
  return true;
}

function schimbaJucatorul() {
  state.jucatorCurent = state.jucatorCurent === 1 ? 2 : 1;
  state.nodSelectat = -1;
  actualizeazaFaza(1);
  actualizeazaFaza(2);
}

export function numeJucator(jucator) {
  if (jucator === 1) {
    return state.numePj1 || "Jucatorul 1";
  }

  return state.numePj2 || "Jucatorul 2";
}

export function restartJoc() {
  state.board = creeazaMatriceBoard();
  state.pieseInMana[1] = MAX_PIESE;
  state.pieseInMana[2] = MAX_PIESE;
  state.pieseLuate[1] = 0;
  state.pieseLuate[2] = 0;
  state.faza[1] = 1;
  state.faza[2] = 1;
  state.jucatorCurent = 1;
  state.numePj1 = "";
  state.numePj2 = "";
  state.trebuieEliminata = false;
  state.eliminaPentru = 0;
  state.noduriMoara = [];
  state.mesaj = "";
  state.nodSelectat = -1;
  state.jocTerminat = false;
}
