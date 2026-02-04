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
    const cx = p.width * 0.5;
    const cy = p.height * 0.62;
    const arcW = p.width * 0.78;
    const arcH = p.height * 0.78;

    p.noFill();
    p.stroke(255, 255, 255, 130);
    p.strokeWeight(3);
    p.arc(cx, cy, arcW, arcH, p.PI, p.TWO_PI);

    p.stroke(0, 0, 0, 60);
    p.strokeWeight(2);
    p.line(p.width * 0.12, cy, p.width * 0.88, cy);

    const topY = cy - (arcH / 2);
    const horizonY = cy;

    return { cx, cy, arcW, arcH, topY, horizonY };
  }

  // Commit 5: centered HH:MM:SS time pill
  function pad2(n) {
    return (n < 10) ? ("0" + n) : ("" + n);
  }

  function formatHMS(h, m, s) {
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function drawCenteredTimePill(geom) {
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    // Center exactly between the top of the arc and the horizon
    const centerX = geom.cx;
    const centerY = (geom.topY + geom.horizonY) / 2;

    const boxW = p.width * 0.62;
    const boxH = 70;

    const x = centerX - (boxW / 2);
    const y = centerY - (boxH / 2);

    // pill background
    p.noStroke();
    p.fill(0, 0, 0, 160);
    p.rect(x, y, boxW, boxH, 18);

    // time text
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(40);
    p.text(formatHMS(h, m, s), centerX, centerY);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);

    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    drawSkyGradient();
    drawStars();

    const geom = drawArcAndHorizon();
    drawCenteredTimePill(geom);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
