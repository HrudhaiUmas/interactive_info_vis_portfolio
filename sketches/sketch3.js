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

  // Feature (Commit 2): draw a simple sky gradient background
  function drawSkyGradient() {
    const steps = 40; // more steps = smoother gradient

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);

      // Top -> bottom color interpolation
      const r = p.lerp(15, 70, t);
      const g = p.lerp(25, 90, t);
      const b = p.lerp(55, 140, t);

      p.noStroke();
      p.fill(r, g, b);

      const y = (i / steps) * p.height;
      p.rect(0, y, p.width, (p.height / steps) + 1);
    }
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);

    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
  };

  p.draw = function () {
    drawSkyGradient();

    // Keep the placeholder label for now
    p.fill(255);
    p.text("Clock B (sk3) — gradient background", p.width / 2, p.height / 2);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
