// movement.js - mutarea pieselor si fazele jocului

// Adiacentele celor 24 de noduri (vecinii directi pe tabla)
const ADIACENTE = [
  [1,7],       // 0
  [0,2,9],     // 1
  [1,3],       // 2
  [2,4,11],    // 3
  [3,5],       // 4
  [4,6,13],    // 5
  [5,7],       // 6
  [6,0,15],    // 7
  [9,15],      // 8
  [8,10,17],   // 9
  [9,11],      // 10
  [10,12,19],  // 11
  [11,13],     // 12
  [12,14,21],  // 13
  [13,15],     // 14
  [14,8,23],   // 15
  [17,23],     // 16
  [16,18,9],   // 17
  [17,19],     // 18
  [18,20,11],  // 19
  [19,21],     // 20
  [20,22,13],  // 21
  [21,23],     // 22
  [22,16,15],  // 23
];

// Nodul selectat pentru mutare (-1 = nimic selectat)
var nodSelectat = -1;

// Returneaza faza jucatorului: 'plasare', 'mutare', 'zbor'
function getFaza(jucator) {
  if (pieseInMana[jucator] > 0) return 'plasare';
  let peTabla = board.filter(v => v === jucator).length;
  if (peTabla <= 3) return 'zbor';
  return 'mutare';
}

// Gestioneaza orice click pe tabla
function handleClick(idx) {
  if (jocTerminat) return;

  // Daca trebuie sa elimine o piesa adversa
  if (trebuieEliminate) {
    eliminaPiesa(idx);
    actualizeazaUI();
    return;
  }

  let faza = getFaza(jucatorCurent);

  if (faza === 'plasare') {
    plaseazaPiesa(idx);
    actualizeazaUI();
    return;
  }

  // Faza mutare sau zbor
  handleMutare(idx);
  actualizeazaUI();
}

function handleMutare(idx) {
  let faza = getFaza(jucatorCurent);

  // Primul click: selecteaza piesa proprie
  if (nodSelectat === -1) {
    if (board[idx] === jucatorCurent) nodSelectat = idx;
    return;
  }

  // Click pe aceeasi piesa: deselecteaza
  if (idx === nodSelectat) {
    nodSelectat = -1;
    return;
  }

  // Click pe alta piesa proprie: schimba selectia
  if (board[idx] === jucatorCurent) {
    nodSelectat = idx;
    return;
  }

  // Destinatia trebuie sa fie libera
  if (board[idx] !== 0) {
    nodSelectat = -1;
    return;
  }

  // La 'mutare' verifica adiacenta; la 'zbor' poate merge oriunde
  if (faza === 'mutare' && !ADIACENTE[nodSelectat].includes(idx)) {
    nodSelectat = -1;
    return;
  }

  // Executa mutarea
  board[idx] = jucatorCurent;
  board[nodSelectat] = 0;
  nodSelectat = -1;

  detecteazaMori();

  // Daca s-a format o moara, jucatorul elimina o piesa adversa
  if (moriActive.some(m => m.includes(idx) && board[m[0]] === jucatorCurent)) {
    trebuieEliminate = true;
    return;
  }

  jucatorCurent = jucatorCurent === 1 ? 2 : 1;
  verificaGameOver();
}

// Deseneaza verde nodurile unde piesa selectata poate merge
function deseneazaDestinatieMutare() {
  if (trebuieEliminate) return;
  if (nodSelectat === -1) return;

  let faza = getFaza(jucatorCurent);
  let r = MARIME_CANVAS * 0.018;

  for (let i = 0; i < 24; i++) {
    if (board[i] !== 0) continue;

    let eAccesibil = faza === 'zbor' ? true : ADIACENTE[nodSelectat].includes(i);
    if (!eAccesibil) continue;

    let nod = noduri[i];
    noStroke();
    fill(100, 200, 100, 150);
    ellipse(nod.x, nod.y, r * 2, r * 2);
  }

  // Halou verde pe piesa selectata
  let nod = noduri[nodSelectat];
  noFill();
  stroke(100, 200, 100);
  strokeWeight(2);
  ellipse(nod.x, nod.y, MARIME_CANVAS * 0.07, MARIME_CANVAS * 0.07);
}