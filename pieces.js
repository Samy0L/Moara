// pieces.js — starea jocului si logica de baza (plasare, mori, eliminare)

export const MAX_PIESE = 9;

export const MORI_POSIBILE = [
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export const ADIACENTE = buildAdiacente();

function buildAdiacente() {
  const adj = Array.from({ length: 24 }, () => new Set());
  for (const [a, b, c] of MORI_POSIBILE) {
    adj[a].add(b); adj[b].add(a);
    adj[b].add(c); adj[c].add(b);
  }
  return adj.map((s) => [...s]);
}

export const state = {
  board: new Array(24).fill(0),
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

export function numarPieseBoard(jucator) {
  return state.board.filter((v) => v === jucator).length;
}

export function actualizeazaFaza(jucator) {
  if (state.pieseInMana[jucator] > 0) { state.faza[jucator] = 1; return; }
  state.faza[jucator] = numarPieseBoard(jucator) <= 3 ? 3 : 2;
}

export function verificaMoara(idx, jucator) {
  let gasita = false;
  const nouNoduri = [];
  for (const moara of MORI_POSIBILE) {
    if (
      moara.includes(idx) &&
      state.board[moara[0]] === jucator &&
      state.board[moara[1]] === jucator &&
      state.board[moara[2]] === jucator
    ) {
      gasita = true;
      for (const n of moara) {
        if (!nouNoduri.includes(n)) nouNoduri.push(n);
      }
    }
  }
  if (gasita) state.noduriMoara = nouNoduri;
  return gasita;
}

export function estePiesaInMoara(idx, jucator) {
  return MORI_POSIBILE.some(
    (m) =>
      m.includes(idx) &&
      state.board[m[0]] === jucator &&
      state.board[m[1]] === jucator &&
      state.board[m[2]] === jucator
  );
}

export function existaPiesaInAfaraMorii(jucator) {
  return state.board.some(
    (v, i) => v === jucator && !estePiesaInMoara(i, jucator)
  );
}

export function mutariDisponibile(jucator) {
  if (state.faza[jucator] === 3) {
    const froms = state.board.reduce((a, v, i) => (v === jucator ? [...a, i] : a), []);
    const tos = state.board.reduce((a, v, i) => (v === 0 ? [...a, i] : a), []);
    return froms.flatMap((f) => tos.map((t) => ({ from: f, to: t })));
  }
  const moves = [];
  for (let i = 0; i < 24; i++) {
    if (state.board[i] !== jucator) continue;
    for (const j of ADIACENTE[i]) {
      if (state.board[j] === 0) moves.push({ from: i, to: j });
    }
  }
  return moves;
}

export function verificaInfrângere(jucator) {
  if (state.pieseInMana[jucator] === 0 && numarPieseBoard(jucator) < 3) return true;
  if (state.faza[jucator] === 2 && mutariDisponibile(jucator).length === 0) return true;
  return false;
}

// ── Actiuni ────────────────────────────────────────────────────────────────

export function plaseazaPiesa(idx) {
  if (state.board[idx] !== 0) { state.mesaj = "⚠ Nodul este ocupat."; return false; }
  if (state.pieseInMana[state.jucatorCurent] <= 0) return false;

  state.board[idx] = state.jucatorCurent;
  state.pieseInMana[state.jucatorCurent]--;
  state.noduriMoara = [];

  if (verificaMoara(idx, state.jucatorCurent)) {
    const nume = numeJucator(state.jucatorCurent);
    state.mesaj = `🟢 ${nume} a format o MOARA! Alege o piesa adversa de eliminat.`;
    state.trebuieEliminata = true;
    state.eliminaPentru = state.jucatorCurent;
    return true;
  }

  schimbaJucatorul();
  return true;
}

export function mutaPiesa(from, to) {
  const pl = state.faza[state.jucatorCurent];

  if (pl === 2 && !ADIACENTE[from].includes(to)) {
    state.mesaj = "⚠ Noduri neadiacente. Alege un vecin liber.";
    return false;
  }

  state.board[to] = state.jucatorCurent;
  state.board[from] = 0;
  state.nodSelectat = -1;
  state.noduriMoara = [];

  if (verificaMoara(to, state.jucatorCurent)) {
    const nume = numeJucator(state.jucatorCurent);
    state.mesaj = `🟢 ${nume} a format o MOARA! Alege o piesa adversa de eliminat.`;
    state.trebuieEliminata = true;
    state.eliminaPentru = state.jucatorCurent;
    return true;
  }

  schimbaJucatorul();
  return true;
}

export function eliminaPiesa(idx) {
  const castigator = state.eliminaPentru;
  const adversar = castigator === 1 ? 2 : 1;

  if (state.board[idx] !== adversar) {
    state.mesaj = "⚠ Alege o piesa a adversarului.";
    return false;
  }

  if (estePiesaInMoara(idx, adversar) && existaPiesaInAfaraMorii(adversar)) {
    state.mesaj = "⚠ Aceasta piesa este intr-o moara. Alege alta.";
    return false;
  }

  state.board[idx] = 0;
  state.pieseLuate[castigator]++;
  state.trebuieEliminata = false;
  state.eliminaPentru = 0;
  state.noduriMoara = [];
  state.mesaj = "";

  // Verifica victoria INAINTE de a schimba jucatorul,
  // exact in momentul in care adversarul a ramas cu < 3 piese
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

export function numeJucator(j) {
  return j === 1 ? state.numePj1 || "Jucatorul 1" : state.numePj2 || "Jucatorul 2";
}

export function restartJoc() {
  state.board.fill(0);
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
