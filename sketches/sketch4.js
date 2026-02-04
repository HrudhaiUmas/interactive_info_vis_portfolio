// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 3: draw compass shell (bezel + face)

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

  // ====== Commit 3: Compass shell ======
  function drawOuterShell(cx, cy, r) {
    // Outer bezel
    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.circle(cx, cy, r * 2.18);

    // Soft shadow ring
    p.fill(0, 0, 0, 40);
    p.circle(cx, cy, r * 2.08);

    // Inner face
    p.fill(255, 255, 255, 215);
    p.circle(cx, cy, r * 1.82);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    // background
    p.background(210, 220, 230);

    // current time
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    // time pill
    drawDigitalTimePill(formatTime12(h, m, s));

    // compass layout
    const cx = p.width / 2;
    const cy = p.height * 0.56;
    const r = Math.min(p.width, p.height) * 0.28;

    // shell
    drawOuterShell(cx, cy, r);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
