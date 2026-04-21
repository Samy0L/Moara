let CANVAS_SIZE;
let nodes = [];

// ─── p5.js sketch ─────────────────────────────────────────────
new p5(function (p) {

  p.setup = function () {
    CANVAS_SIZE = calcSize();
    const cnv = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    cnv.parent('canvas-container');
    computeNodes();
    // loop activ – tabla se redesenează după fiecare click
  };

  p.windowResized = function () {
    CANVAS_SIZE = calcSize();
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
    computeNodes();
  };

  p.draw = function () {
    p.background('#1a1510');
    drawBoard(p);
    drawNodes(p);
    drawPieces(p); // definit în pieces.js
  };

  // Click → găsește nodul cel mai apropiat → încearcă plasare
  p.mousePressed = function () {
    const idx = getNodeAtClick(p.mouseX, p.mouseY);
    if (idx !== -1) {
      placePiece(idx); // definit în pieces.js
    }
  };

});

// ─── Dimensiunea canvas-ului (responsive) ─────────────────────
function calcSize() {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  return Math.min(w, h) - 20;
}

// ─── Calculează coordonatele celor 24 de noduri ───────────────
function computeNodes() {
  nodes = [];

  const s      = CANVAS_SIZE;
  const cx     = s / 2;
  const cy     = s / 2;
  const margin = s * 0.08;
  const step   = (s / 2 - margin) / 3;

  const halfSides = [
    s / 2 - margin,
    s / 2 - margin - step,
    s / 2 - margin - step * 2,
  ];

  for (let ring = 0; ring < 3; ring++) {
    const h = halfSides[ring];
    nodes.push(
      { x: cx - h, y: cy - h }, // 0 TL
      { x: cx,     y: cy - h }, // 1 T
      { x: cx + h, y: cy - h }, // 2 TR
      { x: cx + h, y: cy     }, // 3 R
      { x: cx + h, y: cy + h }, // 4 BR
      { x: cx,     y: cy + h }, // 5 B
      { x: cx - h, y: cy + h }, // 6 BL
      { x: cx - h, y: cy     }, // 7 L
    );
  }
}

// ─── Returnează indexul nodului cel mai apropiat de click ──────
// Returnează -1 dacă click-ul e prea departe de orice nod
function getNodeAtClick(mx, my) {
  const threshold = CANVAS_SIZE * 0.05; // raza de detecție
  let bestIdx = -1;
  let bestDist = threshold;

  for (let i = 0; i < nodes.length; i++) {
    const d = Math.hypot(mx - nodes[i].x, my - nodes[i].y);
    if (d < bestDist) {
      bestDist = d;
      bestIdx  = i;
    }
  }

  return bestIdx;
}

// ─── Desenează liniile tablei ──────────────────────────────────
function drawBoard(p) {
  p.stroke(200, 168, 75);
  p.strokeWeight(CANVAS_SIZE * 0.004);
  p.noFill();

  // Cele 3 pătrate concentrice
  for (let ring = 0; ring < 3; ring++) {
    const tl = nodes[ring * 8 + 0]; // TL
    const br = nodes[ring * 8 + 4]; // BR
    p.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  // Cele 4 linii radiale (exterior → interior, mijlocul fiecărei laturi)
  for (const mi of [1, 3, 5, 7]) {
    const outer = nodes[mi];
    const inner = nodes[16 + mi];
    p.line(outer.x, outer.y, inner.x, inner.y);
  }
}

// ─── Desenează nodurile goale ──────────────────────────────────
function drawNodes(p) {
  const r = CANVAS_SIZE * 0.018;

  for (let i = 0; i < nodes.length; i++) {
    if (board[i] !== 0) continue; // ocupat → desenat de drawPieces

    const { x, y } = nodes[i];
    p.stroke(200, 168, 75);
    p.strokeWeight(1.5);
    p.fill('#1a1510');
    p.ellipse(x, y, r * 2, r * 2);

    p.noStroke();
    p.fill(200, 168, 75, 180);
    p.ellipse(x, y, r * 0.6, r * 0.6);
  }
}