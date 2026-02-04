// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 5: add compass ring (ticks + N/E/S/W) STATIC (no rotation yet)

registerSketch('sk4', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  // ====== Time helpers (12-hour digital clock) ======
  function pad2(n) {
    return (n < 10) ? ("0" + n) : ("" + n);
  }

  function formatTime12(h24, m, s) {
    let suffix = "AM";
    let h = h24;

    if (h >= 12) suffix = "PM";
    h = h % 12;
    if (h === 0) h = 12;

    return h + ":" + pad2(m) + ":" + pad2(s) + " " + suffix;
  }

  function drawDigitalTimePill(timeStr) {
    const pillW = p.width * 0.72;
    const pillH = 52;

    const x = (p.width - pillW) / 2;
    const y = p.height * 0.07;

    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.rect(x, y, pillW, pillH, 18);

    p.fill(25);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(22);
    p.text(timeStr, p.width / 2, y + pillH / 2);
  }

  // ====== Compass shell ======
  function drawOuterShell(cx, cy, r) {
    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.circle(cx, cy, r * 2.18);

    p.fill(0, 0, 0, 40);
    p.circle(cx, cy, r * 2.08);

    p.fill(255, 255, 255, 215);
    p.circle(cx, cy, r * 1.82);
  }

  // ====== Fixed top index marker ======
  function drawFixedTopIndex(cx, cy, r) {
    p.noStroke();
    p.fill(220, 60, 60, 220);

    p.triangle(
      cx, cy - r * 1.02,
      cx - r * 0.05, cy - r * 0.88,
      cx + r * 0.05, cy - r * 0.88
    );
  }

  // ====== Commit 5: Static compass ring ======
  function drawCompassRingStatic(cx, cy, r) {
    // Draw compass ticks + N/E/S/W without any rotation yet.
    // Next commit(s) will rotate this ring based on heading.

    // Tick marks every 15 degrees
    p.stroke(0, 0, 0, 60);
    p.strokeWeight(2);

    for (let a = 0; a < 360; a += 15) {
      const ang = p.radians(a) - p.HALF_PI; // 0° at top

      const isCardinal = (a % 90 === 0);
      const outerR = r * 0.92;
      const innerR = isCardinal ? r * 0.80 : r * 0.84;

      const x1 = cx + outerR * Math.cos(ang);
      const y1 = cy + outerR * Math.sin(ang);
      const x2 = cx + innerR * Math.cos(ang);
      const y2 = cy + innerR * Math.sin(ang);

      p.line(x1, y1, x2, y2);
    }

    // Cardinal letters
    p.noStroke();
    p.fill(25);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(18, r * 0.12));

    p.text("N", cx, cy - r * 0.95);
    p.text("E", cx + r * 0.95, cy);
    p.text("S", cx, cy + r * 0.95);
    p.text("W", cx - r * 0.95, cy);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    p.background(210, 220, 230);

    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    drawDigitalTimePill(formatTime12(h, m, s));

    const cx = p.width / 2;
    const cy = p.height * 0.56;
    const r = Math.min(p.width, p.height) * 0.28;

    drawOuterShell(cx, cy, r);
    drawFixedTopIndex(cx, cy, r);

    // Commit 5: static compass ring
    drawCompassRingStatic(cx, cy, r);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
