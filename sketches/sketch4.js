// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 2: add always-on digital time pill (12-hour format)

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

    // pill background
    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.rect(x, y, pillW, pillH, 18);

    // pill text
    p.fill(25);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(22);
    p.text(timeStr, p.width / 2, y + pillH / 2);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    // background
    p.background(210, 220, 230);

    // current time (updates every frame)
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    drawDigitalTimePill(formatTime12(h, m, s));
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
