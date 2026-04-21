// pieces.js - datele pieselor si logica de plasare

const MAX_PIESE = 9;

// board[i] = 0 (liber), 1 (jucator 1), 2 (jucator 2)
let board = new Array(24).fill(0);

// Cate piese mai are fiecare jucator de plasat din mana
let pieseInMana = { 1: MAX_PIESE, 2: MAX_PIESE };

// Jucatorul curent (1 sau 2)
let jucatorCurent = 1;

// Plaseaza o piesa a jucatorului curent pe pozitia idx
function plaseazaPiesa(idx) {
  if (board[idx] !== 0) return false;
  if (pieseInMana[jucatorCurent] <= 0) return false;

  board[idx] = jucatorCurent;
  pieseInMana[jucatorCurent]--;

  detecteazaMori();

  // Daca s-a format o moara, jucatorul trebuie sa elimine o piesa adversa
  if (moriActive.some(m => m.includes(idx) && board[m[0]] === jucatorCurent)) {
    trebuieEliminate = true;
    return true;
  }

  jucatorCurent = jucatorCurent === 1 ? 2 : 1;
  return true;
}

// Deseneaza piesele de pe tabla
function deseneazaPiese() {
  let r = MARIME_CANVAS * 0.032;

  for (let i = 0; i < 24; i++) {
    if (board[i] === 0) continue;

    let nod = noduri[i];
    let inMoara = esteInMoara(i);

    if (board[i] === 1) {
      // Jucator 1 - piesa alba
      fill(220, 215, 200);
      if (inMoara) { stroke(255, 220, 100); strokeWeight(3); }
      else          { stroke(150, 140, 130); strokeWeight(2); }
    } else {
      // Jucator 2 - piesa neagra
      fill(35, 25, 12);
      if (inMoara) { stroke(220, 80, 60); strokeWeight(3); }
      else          { stroke(200, 168, 75); strokeWeight(2); }
    }

    ellipse(nod.x, nod.y, r * 2, r * 2);
  }
}