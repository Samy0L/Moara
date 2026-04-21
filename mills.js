const ALL_MILLS = [
  // Inel exterior
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Inel mijlociu
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inel interior
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Radiale (leagă cele 3 inele)
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

// Morile active în momentul curent [ [a,b,c], ... ]
// Actualizat după fiecare plasare
let activeMills = [];

// ─── Detecție ─────────────────────────────────────────────────

// Verifică toate cele 16 mori și le salvează pe cele complete
// Apelată din placePiece() după fiecare mutare
function detectMills() {
  activeMills = [];
  for (const mill of ALL_MILLS) {
    const [a, b, c] = mill;
    if (
      board[a] !== 0 &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      activeMills.push(mill);
    }
  }
}

// Returnează true dacă nodul idx face parte dintr-o moară activă
function isInActiveMill(idx) {
  return activeMills.some(mill => mill.includes(idx));
}

// ─── Evidențiere vizuală ───────────────────────────────────────

// Desenează o linie colorată peste fiecare moară activă
// Apelată din draw() în board.js, după drawPieces()
function drawMills(p) {
  if (activeMills.length === 0) return;

  for (const mill of activeMills) {
    const player = board[mill[0]];

    // Culoare linie în funcție de jucător
    if (player === 1) {
      p.stroke(255, 230, 150); 
    } else {
      p.stroke(220, 80, 60);  
    }

    p.strokeWeight(CANVAS_SIZE * 0.008);

    const a = nodes[mill[0]];
    const c = nodes[mill[2]];
    p.line(a.x, a.y, c.x, c.y);
  }
}