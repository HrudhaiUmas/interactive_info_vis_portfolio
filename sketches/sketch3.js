// Instance-mode sketch for tab 3 (Clock B - build from scratch)
registerSketch('sk3', function (p) {
  // Canvas must be <= 800x800
  const MAX_W = 800;
  const MAX_H = 800;

  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);

    // Basic text settings (so we can easily add labels later)
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
  };

  p.draw = function () {
    // Placeholder background (will be replaced in next commit)
    p.background(20);

    // Placeholder label (lets you confirm tab is working)
    p.fill(255);
    p.text("Clock B (sk3) — scaffold", p.width / 2, p.height / 2);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
