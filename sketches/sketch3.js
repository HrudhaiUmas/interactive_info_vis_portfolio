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

  // Commit 3: starfield
  function drawStars() {
    p.noStroke();
    const starCount = 70;

    for (let i = 0; i < starCount; i++) {
      const x = (i * 97) % p.width;
      const y = (i * 53) % Math.floor(p.height * 0.65);

      const twinkle = 160 + 80 * Math.sin((p.frameCount * 0.03) + i);

      p.fill(255, 255, 255, twinkle);
      p.circle(x, y, 2);
    }
  }

  // Commit 4: arc + horizon baseline
  function drawArcAndHorizon() {
    // Arc geometry (kept consistent so future features align)
    const cx = p.width * 0.5;
    const cy = p.height * 0.62;
    const arcW = p.width * 0.78;
    const arcH = p.height * 0.78;

    // Arc (left horizon -> right horizon)
    p.noFill();
    p.stroke(255, 255, 255, 130);
    p.strokeWeight(3);
    p.arc(cx, cy, arcW, arcH, p.PI, p.TWO_PI);

    // Horizon line
    p.stroke(0, 0, 0, 60);
    p.strokeWeight(2);
    p.line(p.width * 0.12, cy, p.width * 0.88, cy);

    // Return geometry so later commits can position elements precisely
    return { cx, cy, arcW, arcH };
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

    const geom = drawArcAndHorizon();

    // Placeholder label so you know it's running
    p.noStroke();
    p.fill(255);
    p.text("Clock B (sk3) — arc + horizon", geom.cx, p.height * 0.18);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
