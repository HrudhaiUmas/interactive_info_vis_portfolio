// Instance-mode sketch for tab 3 (Clock B - build from scratch)
registerSketch('sk3', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  // Commit 2: sky gradient
  function drawSkyGradient() {
    const steps = 40;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);

      const r = p.lerp(15, 70, t);
      const g = p.lerp(25, 90, t);
      const b = p.lerp(55, 140, t);

      p.noStroke();
      p.fill(r, g, b);

      const y = (i / steps) * p.height;
      p.rect(0, y, p.width, (p.height / steps) + 1);
    }
  }

  // Commit 3: starfield layer
  function drawStars() {
    // Deterministic placement (stable) + mild twinkle (feels alive)
    p.noStroke();

    const starCount = 70;

    for (let i = 0; i < starCount; i++) {
      // Stable pseudo-random positions
      const x = (i * 97) % p.width;
      const y = (i * 53) % Math.floor(p.height * 0.65);

      // Twinkle alpha changes smoothly over time
      const twinkle = 160 + 80 * Math.sin((p.frameCount * 0.03) + i);

      p.fill(255, 255, 255, twinkle);
      p.circle(x, y, 2);
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
    drawStars();

    // Placeholder label
    p.fill(255);
    p.text("Clock B (sk3) — stars added", p.width / 2, p.height / 2);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
