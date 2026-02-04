// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 1: scaffold compass clock canvas + resize (MAX 800x800), basic background

registerSketch('sk4', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  // Keep the canvas within assignment limits, but responsive to window size
  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);

    // Default text settings (we'll use these later)
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    // Simple neutral background so we can build on top
    p.background(210, 220, 230);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
