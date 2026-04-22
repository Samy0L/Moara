const max_piese = 9;

var board = new Array(24).fill(0);
var pieseInMana = { 1: max_piese, 2: max_piese };
var jucatorCurent = 1;

function plaseazaPiesa(idx) {
  if (board[idx] !== 0) return;
  if (pieseInMana[jucatorCurent] <= 0) return;

  board[idx] = jucatorCurent;
  pieseInMana[jucatorCurent]--;

  jucatorCurent = jucatorCurent === 1 ? 2 : 1;
}

function deseneazaPiese() {
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
    strokeWeight(2);
    ellipse(nod.x, nod.y, r * 2, r * 2);
  }
}

function restartJoc() {
  board.fill(0);
  pieseInMana[1] = max_piese;
  pieseInMana[2] = max_piese;
  jucatorCurent = 1;
}
