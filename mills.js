// mills.js - detecteaza si deseneaza morile (3 piese aliniate)

// Toate combinatiile posibile de moara (16 total)
const TOATE_MORILE = [
  [0,1,2], [2,3,4], [4,5,6], [6,7,0],       // inel exterior
  [8,9,10], [10,11,12], [12,13,14], [14,15,8], // inel mijlociu
  [16,17,18], [18,19,20], [20,21,22], [22,23,16], // inel interior
  [1,9,17], [3,11,19], [5,13,21], [7,15,23]  // linii radiale
];

// Morile complete in momentul curent
var moriActive = [];

// Verifica toate combinatiile si le salveaza pe cele complete
function detecteazaMori() {
  moriActive = [];
  for (let i = 0; i < TOATE_MORILE.length; i++) {
    let a = TOATE_MORILE[i][0];
    let b = TOATE_MORILE[i][1];
    let c = TOATE_MORILE[i][2];
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      moriActive.push(TOATE_MORILE[i]);
    }
  }
}

// Returneaza true daca nodul idx face parte dintr-o moara activa
function esteInMoara(idx) {
  for (let i = 0; i < moriActive.length; i++) {
    if (moriActive[i].includes(idx)) return true;
  }
  return false;
}

// Deseneaza o linie colorata peste fiecare moara activa
function deseneazaMori() {
  for (let i = 0; i < moriActive.length; i++) {
    let moara = moriActive[i];
    let jucator = board[moara[0]];

    if (jucator === 1) {
      stroke(255, 220, 100);
    } else {
      stroke(220, 80, 60);
    }
    strokeWeight(MARIME_CANVAS * 0.007);

    let nodeA = noduri[moara[0]];
    let nodeC = noduri[moara[2]];
    line(nodeA.x, nodeA.y, nodeC.x, nodeC.y);
  }
}