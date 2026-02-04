// Instance-mode sketch for tab 4 (Clock C – Compass Clock)
// Commit 11: add hour + minute hands with correct "hand points up" angles + center cap
// IMPORTANT: These hands do NOT rotate with heading; only the compass ring rotates.

registerSketch('sk4', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  // ====== Heading state ======
  let headingDeg = 0;
  let hasOrientation = false;
  let useMouseFallback = true;

  // ====== Orientation button ======
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

  // ====== Time helpers ======
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

  function drawHeadingStatusLine() {
    p.fill(0, 0, 0, 110);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);

    const status = hasOrientation
      ? ("Heading: " + Math.round(headingDeg) + "°")
      : ("Heading: " + Math.round(headingDeg) + "° (fallback)");

    p.text(status, p.width / 2, p.height * 0.16);
  }

  // ====== Orientation helpers ======
  function normalizeDeg(d) {
    let v = d % 360;
    if (v < 0) v += 360;
    return v;
  }

  function handleDeviceOrientation(event) {
    if (event && typeof event.alpha === "number") {
      headingDeg = normalizeDeg(event.alpha);
      hasOrientation = true;
      useMouseFallback = false;
    }
  }

  function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent === "undefined") {
      orientButton.label = "No orientation sensor";
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(function (response) {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleDeviceOrientation, true);
            orientButton.label = "Orientation enabled";
          } else {
            orientButton.label = "Permission denied";
            hasOrientation = false;
            useMouseFallback = true;
          }
        })
        .catch(function () {
          orientButton.label = "Permission blocked";
          hasOrientation = false;
          useMouseFallback = true;
        });
    } else {
      window.addEventListener("deviceorientation", handleDeviceOrientation, true);
      orientButton.label = "Orientation enabled";
    }
  }

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

  // ====== Shell + marker ======
  function drawOuterShell(cx, cy, r) {
    p.noStroke();
    p.fill(255, 255, 255, 220);
    p.circle(cx, cy, r * 2.18);

    p.fill(0, 0, 0, 40);
    p.circle(cx, cy, r * 2.08);

    p.fill(255, 255, 255, 215);
    p.circle(cx, cy, r * 1.82);
  }

  function drawFixedTopIndex(cx, cy, r) {
    p.noStroke();
    p.fill(220, 60, 60, 220);

    p.triangle(
      cx, cy - r * 1.02,
      cx - r * 0.05, cy - r * 0.88,
      cx + r * 0.05, cy - r * 0.88
    );
  }

  // ====== Compass ring rotates with heading ======
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

  // ====== Fixed clock dial ======
  function drawFixedClockDial(cx, cy, r) {
    p.stroke(0, 0, 0, 55);
    p.strokeWeight(2);

    for (let i = 0; i < 60; i++) {
      const ang = p.radians(i * 6) - p.HALF_PI;

      const isMajor = (i % 5 === 0);
      const outerR = r * 0.72;
      const innerR = isMajor ? r * 0.60 : r * 0.66;

      const x1 = cx + outerR * Math.cos(ang);
      const y1 = cy + outerR * Math.sin(ang);
      const x2 = cx + innerR * Math.cos(ang);
      const y2 = cy + innerR * Math.sin(ang);

      p.line(x1, y1, x2, y2);
    }

    p.noStroke();
    p.fill(0, 0, 0, 130);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(12, r * 0.08));

    for (let hr = 1; hr <= 12; hr++) {
      const ang = p.map(hr % 12, 0, 12, -p.HALF_PI, p.TWO_PI - p.HALF_PI);
      const x = cx + (r * 0.50) * Math.cos(ang);
      const y = cy + (r * 0.50) * Math.sin(ang);
      p.text(String(hr), x, y);
    }
  }

  // ====== Commit 11: Hand angles (hand points UP at angle=0) ======
  function hourToAngle(h24, m) {
    const h12 = h24 % 12;
    const hourFloat = h12 + (m / 60);
    // angle 0 means "up" for our hand shape
    return p.TWO_PI * (hourFloat / 12);
  }

  function minuteToAngle(minuteFloat) {
    // angle 0 means "up"
    return p.TWO_PI * (minuteFloat / 60);
  }

  // ====== Commit 11: Draw hour hand ======
  function drawHourHand(cx, cy, r, h24, m) {
    const ang = hourToAngle(h24, m);

    p.push();
    p.translate(cx, cy);
    p.rotate(ang);

    // shadow (tiny offset)
    p.noStroke();
    p.fill(0, 0, 0, 18);
    p.rect(-3 + 2, -r * 0.42 + 2, 6, r * 0.42, 4);

    // main hand
    p.fill(35, 70, 140, 240);
    p.rect(-3, -r * 0.44, 6, r * 0.44, 4);

    p.pop();
  }

  // ====== Commit 11: Draw minute hand ======
  function drawMinuteHand(cx, cy, r, m, s) {
    const minuteFloat = m + (s / 60);
    const ang = minuteToAngle(minuteFloat);

    p.push();
    p.translate(cx, cy);
    p.rotate(ang);

    // shadow
    p.noStroke();
    p.fill(0, 0, 0, 15);
    p.rect(-2 + 2, -r * 0.62 + 2, 4, r * 0.62, 3);

    // main hand
    p.fill(35, 70, 140, 230);
    p.rect(-2, -r * 0.64, 4, r * 0.64, 3);

    p.pop();
  }

  // ====== Commit 11: Center cap ======
  function drawCenterCap(cx, cy, r) {
    p.noStroke();
    p.fill(25);
    p.circle(cx, cy, r * 0.10);
    p.fill(255, 255, 255, 220);
    p.circle(cx, cy, r * 0.05);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);

    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    }
  };

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

    if (useMouseFallback) {
      const t = p.constrain(p.mouseX / p.width, 0, 1);
      headingDeg = 360 * t;
      hasOrientation = false;
    }

    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    drawDigitalTimePill(formatTime12(h, m, s));
    drawHeadingStatusLine();
    drawOrientationButton();

    const cx = p.width / 2;
    const cy = p.height * 0.56;
    const r = Math.min(p.width, p.height) * 0.28;

    drawOuterShell(cx, cy, r);
    drawFixedTopIndex(cx, cy, r);

    // Compass ring rotates with heading
    drawCompassRingRotating(cx, cy, r);

    // Clock dial is fixed
    drawFixedClockDial(cx, cy, r);

    // Commit 11: hour + minute hands (correct time, NOT tied to compass rotation)
    drawHourHand(cx, cy, r, h, m);
    drawMinuteHand(cx, cy, r, m, s);
    drawCenterCap(cx, cy, r);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
