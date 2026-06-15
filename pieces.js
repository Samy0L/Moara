const max_piese = 9;

const moriPosibile = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];

export const board = new Array(24).fill(0);
export const pieseInMana = { 1: max_piese, 2: max_piese };
export const pieseLuate = { 1: 0, 2: 0 };
export let jucatorCurent = 1;
export let numePj1 = "";
export let numePj2 = "";
export let mesajMoara = "";
export let noduriMoara = [];
export let trebuieEliminataPiesa = false;

export function seteazaNumeJucator1(nume) {
  numePj1 = nume;
}

export function seteazaNumeJucator2(nume) {
  numePj2 = nume;
}

export function plaseazaPiesa(idx) {
  if (trebuieEliminataPiesa) {
    eliminaPiesa(idx);
    return;
  }

  if (board[idx] !== 0) return;
  if (pieseInMana[jucatorCurent] <= 0) return;

  mesajMoara = "";
  noduriMoara = [];

  board[idx] = jucatorCurent;
  pieseInMana[jucatorCurent]--;

  if (verificaMoara(idx, jucatorCurent)) {
    let numeJucator = jucatorCurent === 1 ? numePj1 : numePj2;
    mesajMoara = numeJucator + " a format o moara! Alege o piesa adversa.";
    trebuieEliminataPiesa = true;
    return;
  }

  schimbaJucatorul();
}

export function verificaMoara(idx, jucator) {
  let moaraGasita = false;

  for (let i = 0; i < moriPosibile.length; i++) {
    let moara = moriPosibile[i];

    if (
      moara.indexOf(idx) !== -1 &&
      board[moara[0]] === jucator &&
      board[moara[1]] === jucator &&
      board[moara[2]] === jucator
    ) {
      moaraGasita = true;

      for (let j = 0; j < moara.length; j++) {
        if (noduriMoara.indexOf(moara[j]) === -1) {
          noduriMoara.push(moara[j]);
        }
      }
    }
  }

  return moaraGasita;
}

export function estePiesaInMoara(idx, jucator) {
  for (let i = 0; i < moriPosibile.length; i++) {
    let moara = moriPosibile[i];

    if (
      moara.indexOf(idx) !== -1 &&
      board[moara[0]] === jucator &&
      board[moara[1]] === jucator &&
      board[moara[2]] === jucator
    ) {
      return true;
    }
  }

  return false;
}

export function eliminaPiesa(idx) {
  let adversar = jucatorCurent === 1 ? 2 : 1;

  if (board[idx] !== adversar) {
    mesajMoara = "Alege o piesa a adversarului.";
    return false;
  }

  if (estePiesaInMoara(idx, adversar) && existaPiesaInAfaraMorii(adversar)) {
    mesajMoara = "Aceasta piesa este intr-o moara. Alege alta piesa.";
    return false;
  }

  board[idx] = 0;
  pieseLuate[jucatorCurent]++;
  trebuieEliminataPiesa = false;
  mesajMoara = "";
  noduriMoara = [];
  schimbaJucatorul();
  return true;
}

function existaPiesaInAfaraMorii(jucator) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === jucator && !estePiesaInMoara(i, jucator)) {
      return true;
    }
  }

  return false;
}

function schimbaJucatorul() {
  jucatorCurent = jucatorCurent === 1 ? 2 : 1;
}

export function deseneazaPiese(noduri, marime_canvas) {
  let r = marime_canvas * 0.032;

  for (let i = 0; i < 24; i++) {
    if (board[i] === 0) continue;

    let nod = noduri[i];

    if (board[i] === 1) {
      fill(220, 215, 200);
      stroke(150, 140, 130);
    } else {
      fill(35, 25, 12);
      stroke(200, 168, 75);
    }

    if (noduriMoara.indexOf(i) !== -1) {
      stroke(80, 220, 100);
      strokeWeight(4);
    } else {
      strokeWeight(2);
    }

    ellipse(nod.x, nod.y, r * 2, r * 2);
  }
}



export function restartJoc() {
  board.fill(0);
  pieseInMana[1] = max_piese;
  pieseInMana[2] = max_piese;
  pieseLuate[1] = 0;
  pieseLuate[2] = 0;
  jucatorCurent = 1;
  mesajMoara = "";
  noduriMoara = [];
  trebuieEliminataPiesa = false;
}
