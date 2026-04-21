const MAX_PIECES = 9;

// board[i] = 0 (gol) | 1 (jucător 1) | 2 (jucător 2)
const board = new Array(24).fill(0);

// Câte piese mai are fiecare jucător de plasat
const piecesLeft = { 1: MAX_PIECES, 2: MAX_PIECES };

// Jucătorul curent (1 sau 2)
let currentPlayer = 1;

// ─── Plasare ──────────────────────────────────────────────────

function placePiece(idx) {
  // Dacă trebuie să elimine mai întâi, delegăm către removePiece()
  if (mustRemove) {
    removePiece(idx); // definit în remove.js
    return true;
  }

  if (board[idx] !== 0) return false;
  if (piecesLeft[currentPlayer] <= 0) return false;

  // Snapshot mori înainte de plasare
  const millsBefore = activeMills.length;

  board[idx] = currentPlayer;
  piecesLeft[currentPlayer]--;

  // Detectează mori după plasare
  detectMills(); // definit în mills.js

  // Dacă s-a format o moară nouă → jucătorul curent trebuie să elimine
  if (activeMills.some(m => m.includes(idx) && board[m[0]] === currentPlayer)) {
    mustRemove = true;
    // NU schimbăm rândul – jucătorul curent alege piesa de eliminat
    return true;
  }

  // Nicio moară nouă → schimbă rândul normal
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  return true;
}

// ─── Desen piese ──────────────────────────────────────────────

function drawPieces(p) {
  const r = CANVAS_SIZE * 0.032;

  for (let i = 0; i < 24; i++) {
    if (board[i] === 0) continue;

    const { x, y } = nodes[i];
    const player   = board[i];
    const inMill   = isInActiveMill(i); // definit în mills.js

    if (player === 1) {
      p.stroke(inMill ? 255 : 160, inMill ? 230 : 150, inMill ? 150 : 135);
      p.strokeWeight(inMill ? 3 : 2);
      p.fill(220, 215, 200);
      p.ellipse(x, y, r * 2, r * 2);

      p.noFill();
      p.stroke(160, 150, 135, 120);
      p.strokeWeight(1);
      p.ellipse(x, y, r * 1.1, r * 1.1);

    } else {
      p.stroke(inMill ? 220 : 200, inMill ? 80 : 168, inMill ? 60 : 75);
      p.strokeWeight(inMill ? 3 : 2);
      p.fill(35, 25, 12);
      p.ellipse(x, y, r * 2, r * 2);

      p.noFill();
      p.stroke(200, 168, 75, 120);
      p.strokeWeight(1);
      p.ellipse(x, y, r * 1.1, r * 1.1);
    }
  }
}