// Dimensiunea canvas-ului, recalculată la resize
let CANVAS_SIZE;

// Pozițiile celor 24 de noduri [ {x, y}, ... ]
let nodes = [];

// ─── p5.js sketch ─────────────────────────────────────────────
new p5(function (p) {

  p.setup = function () {
    CANVAS_SIZE = calcSize();
    const cnv = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    cnv.parent('canvas-container');
    computeNodes();
    p.noLoop(); // tabla e statică, nu avem nevoie de loop continuu
  };

  p.windowResized = function () {
    CANVAS_SIZE = calcSize();
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
    computeNodes();
    p.redraw();
  };

  p.draw = function () {
    p.background('#1a1510');
    drawBoard(p);
    drawNodes(p);
  };

});

// ─── Dimensiunea canvas-ului (responsive) ─────────────────────
function calcSize() {
  // Foloseşte cel mai mic dintre lăţimea şi înălţimea ferestrei, cu o margine
  return Math.min(window.innerWidth, window.innerHeight) - 40;
}

// ─── Calculează coordonatele celor 24 de noduri ───────────────
function computeNodes() {
  nodes = [];

  const s    = CANVAS_SIZE;
  const cx   = s / 2;
  const cy   = s / 2;
  const pad  = s * 0.08; // margine de la bordura canvas-ului

  // Jumătatea laturii pentru fiecare inel
  const halfSide = [
    s / 2 - pad,                       // exterior
    s / 2 - pad - (s - 2 * pad) / 3,  // mijlociu
    s / 2 - pad - (s - 2 * pad) * 2 / 3, // interior
  ];

  /*
   * Pentru fiecare inel generăm 8 noduri:
   *   0 → colț TL  (-half, -half)
   *   1 → mijloc T (    0, -half)
   *   2 → colț TR  (+half, -half)
   *   3 → mijloc R (+half,     0)
   *   4 → colț BR  (+half, +half)
   *   5 → mijloc B (    0, +half)
   *   6 → colț BL  (-half, +half)
   *   7 → mijloc L (-half,     0)
   */
  for (let ring = 0; ring < 3; ring++) {
    const h = halfSide[ring];
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

// ─── Desenează liniile tablei ──────────────────────────────────
function drawBoard(p) {
  p.stroke(200, 168, 75);          // auriu
  p.strokeWeight(CANVAS_SIZE * 0.004);
  p.noFill();

  // 1. Cele 3 pătrate concentrice
  for (let ring = 0; ring < 3; ring++) {
    const base = ring * 8;
    // Parcurgem perimetrul inelului (noduri 0..7, apoi înapoi la 0)
    for (let i = 0; i < 8; i++) {
      const a = nodes[base + i];
      const b = nodes[base + (i + 1) % 8];
      p.line(a.x, a.y, b.x, b.y);
    }
  }

  // 2. Cele 4 linii radiale (leagă mijlocul fiecărei laturi)
  // Nodurile de mijloc din fiecare inel sunt la indicii 1, 3, 5, 7
  const midIndices = [1, 3, 5, 7];
  for (const mi of midIndices) {
    const outer  = nodes[mi];          // inel exterior
    const middle = nodes[8  + mi];     // inel mijlociu
    const inner  = nodes[16 + mi];     // inel interior
    p.line(outer.x, outer.y, inner.x, inner.y);
  }
}

// ─── Desenează cele 24 de noduri (intersecții) ────────────────
function drawNodes(p) {
  const r = CANVAS_SIZE * 0.018; // raza punctului

  for (let i = 0; i < nodes.length; i++) {
    const { x, y } = nodes[i];

    // Cerc umplut – marcare clară a poziției
    p.stroke(200, 168, 75);
    p.strokeWeight(1.5);
    p.fill('#1a1510');
    p.ellipse(x, y, r * 2, r * 2);

    // Punct central auriu
    p.noStroke();
    p.fill(200, 168, 75, 180);
    p.ellipse(x, y, r * 0.6, r * 0.6);
  }
}