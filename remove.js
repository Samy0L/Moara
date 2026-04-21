// remove.js - eliminarea pieselor adverse dupa formarea unei mori

var trebuieEliminate = false;

// Elimina piesa adversarului de pe pozitia idx
function eliminaPiesa(idx) {
  let adversar = jucatorCurent === 1 ? 2 : 1;

  // Trebuie sa fie piesa adversarului
  if (board[idx] !== adversar) return;

  // Nu poti elimina o piesa dintr-o moara, daca exista alternative
  let toateInMoara = board.every((v, i) => v !== adversar || esteInMoara(i));
  if (esteInMoara(idx) && !toateInMoara) return;

  board[idx] = 0;
  trebuieEliminate = false;
  jucatorCurent = jucatorCurent === 1 ? 2 : 1;
  verificaGameOver();
}

// Deseneaza halou rosu pe piesele eliminabile
function deseneazaEleminabile() {
  if (!trebuieEliminate) return;

  let adversar = jucatorCurent === 1 ? 2 : 1;
  let toateInMoara = board.every((v, i) => v !== adversar || esteInMoara(i));
  let r = MARIME_CANVAS * 0.018;

  for (let i = 0; i < 24; i++) {
    if (board[i] !== adversar) continue;
    if (esteInMoara(i) && !toateInMoara) continue;

    let nod = noduri[i];
    noFill();
    stroke(220, 80, 60);
    strokeWeight(2);
    ellipse(nod.x, nod.y, r * 2 + MARIME_CANVAS * 0.03, r * 2 + MARIME_CANVAS * 0.03);
  }
}