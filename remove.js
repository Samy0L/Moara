let mustRemove = false;

// ─── Verificări ───────────────────────────────────────────────

// Returnează true dacă piesa de pe idx aparține adversarului
// și poate fi eliminată conform regulilor
function canRemove(idx) {
  if (!mustRemove) return false;

  const opponent = currentPlayer === 1 ? 2 : 1;

  // Piesa trebuie să aparțină adversarului
  if (board[idx] !== opponent) return false;

  // Dacă piesa e într-o moară activă, o putem elimina doar dacă
  // adversarul nu mai are piese în afara morii (excepție de regulă)
  if (isInActiveMill(idx)) {
    return !opponentHasPieceOutsideMill(opponent);
  }

  return true;
}

// Returnează true dacă jucătorul 'player' are cel puțin o piesă
// care NU face parte dintr-o moară activă
function opponentHasPieceOutsideMill(player) {
  for (let i = 0; i < 24; i++) {
    if (board[i] === player && !isInActiveMill(i)) return true;
  }
  return false;
}

// ─── Eliminare ────────────────────────────────────────────────

// Încearcă să elimine piesa de pe idx
// Returnează true dacă eliminarea a reușit
function removePiece(idx) {
  if (!canRemove(idx)) return false;

  board[idx] = 0;
  mustRemove = false;

  // Re-detectează morile după eliminare
  detectMills();

  // Cedează rândul adversarului
  currentPlayer = currentPlayer === 1 ? 2 : 1;

  return true;
}

// ─── Evidențiere piese eliminabile ────────────────────────────

// Desenează un halou roșu pe piesele adversarului care pot fi eliminate
// Apelată din draw() în board.js când mustRemove === true
function drawRemovableHighlight(p) {
  if (!mustRemove) return;

  const opponent = currentPlayer === 1 ? 2 : 1;
  const r = CANVAS_SIZE * 0.032;

  for (let i = 0; i < 24; i++) {
    if (!canRemove(i)) continue;

    const { x, y } = nodes[i];

    // Halou pulsant roșu
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
    p.noFill();
    p.stroke(220, 60, 60, 200 * pulse);
    p.strokeWeight(2.5);
    p.ellipse(x, y, r * 2.8, r * 2.8);
  }
}