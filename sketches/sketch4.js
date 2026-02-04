// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 8: add orientation permission button (iOS support) + click handling
// NOTE: sensor is NOT wired to heading yet (that is commit 9).
// For now, heading still uses mouse fallback unless we later enable sensor input.

registerSketch('sk4', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  // ====== Heading state (mouse fallback for now) ======
  let headingDeg = 0;            // 0 = North
  let hasOrientation = false;    // still false in this commit (sensor not wired yet)
  let useMouseFallback = true;   // still true in this commit

  // ====== Commit 8: orientation button state ======
  let orientButton = {
    x: 16,
    y: 16,
    w: 200,
    h: 34,
    label: "Enable Orientation",
    isHover: false
  };

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

  // ====== Heading status line ======
  function drawHeadingStatusLine() {
    p.fill(0, 0, 0, 110);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);

    const status = hasOrientation
      ? ("Heading: " + Math.round(headingDeg) + "°")
      : ("Heading: " + Math.round(headingDeg) + "° (fallback)");

    p.text(status, p.width / 2, p.height * 0.16);
  }

  // ====== Commit 8: permission request (iOS needs user gesture) ======
  function requestOrientationPermission() {
    // If the API doesn't exist, we can't request sensors
    if (typeof DeviceOrientationEvent === "undefined") {
      orientButton.label = "No orientation sensor";
      return;
    }

    // iOS 13+ requires explicit permission request
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(function (response) {
          if (response === "granted") {
            // We will wire the actual event listener in commit 9.
            orientButton.label = "Permission granted";
          } else {
            orientButton.label = "Permission denied";
          }
        })
        .catch(function () {
          orientButton.label = "Permission blocked";
        });
    } else {
      // Non-iOS browsers typically don't need a permission request
      orientButton.label = "Permission not needed";
    }
  }

  // ====== Commit 8: draw the in-canvas button ======
  function drawOrientationButton() {
    orientButton.isHover =
      (p.mouseX >= orientButton.x && p.mouseX <= orientButton.x + orientButton.w &&
       p.mouseY >= orientButton.y && p.mouseY <= orientButton.y + orientButton.h);

    p.noStroke();
    p.fill(255, 255, 255, orientButton.isHover ? 235 : 205);
    p.rect(orientButton.x, orientButton.y, orientButton.w, orientButton.h, 12);

    p.fill(25);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(orientButton.label, orientButton.x + orientButton.w / 2, orientButton.y + orientButton.h / 2);
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

  // ====== Rotating compass ring (still driven by headingDeg) ======
  function drawCompassRingRotating(cx, cy, r) {
    p.push();
    p.translate(cx, cy);
    p.rotate(p.radians(-headingDeg));

    p.stroke(0, 0, 0, 60);
    p.strokeWeight(2);

    for (let a = 0; a < 360; a += 15) {
      const ang = p.radians(a) - p.HALF_PI;

      const isCardinal = (a % 90 === 0);
      const outerR = r * 0.92;
      const innerR = isCardinal ? r * 0.80 : r * 0.84;

      const x1 = outerR * Math.cos(ang);
      const y1 = outerR * Math.sin(ang);
      const x2 = innerR * Math.cos(ang);
      const y2 = innerR * Math.sin(ang);

      p.line(x1, y1, x2, y2);
    }

    p.noStroke();
    p.fill(25);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(18, r * 0.12));

    p.text("N", 0, -r * 0.95);
    p.text("E", r * 0.95, 0);
    p.text("S", 0, r * 0.95);
    p.text("W", -r * 0.95, 0);

    p.pop();
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  // Commit 8: click handling for the button
  p.mousePressed = function () {
    const insideButton =
      (p.mouseX >= orientButton.x && p.mouseX <= orientButton.x + orientButton.w &&
       p.mouseY >= orientButton.y && p.mouseY <= orientButton.y + orientButton.h);

    if (insideButton) {
      requestOrientationPermission();
    }
  };

  p.draw = function () {
    p.background(210, 220, 230);

    // Mouse fallback heading (still the only driver in commit 8)
    if (useMouseFallback) {
      const t = p.constrain(p.mouseX / p.width, 0, 1);
      headingDeg = 360 * t;
    }

    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    drawDigitalTimePill(formatTime12(h, m, s));
    drawHeadingStatusLine();

    // Commit 8: draw button
    drawOrientationButton();

    const cx = p.width / 2;
    const cy = p.height * 0.56;
    const r = Math.min(p.width, p.height) * 0.28;

    drawOuterShell(cx, cy, r);
    drawFixedTopIndex(cx, cy, r);

    drawCompassRingRotating(cx, cy, r);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
