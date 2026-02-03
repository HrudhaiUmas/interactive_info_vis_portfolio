// Candle Clock — sketch2
// Anchor flame to wick tip + keep 1 sway/second

registerSketch('sk2', function (p) {

  function pad2(num) {
    if (num < 10) return "0" + num;
    return String(num);
  }

  p.setup = function () {
    p.createCanvas(700, 500);
    p.angleMode(p.DEGREES);
    p.rectMode(p.CENTER);
    p.textAlign(p.LEFT, p.TOP);
  };

  p.draw = function () {
    p.background(245);

    // --- TIME ---
    let h24 = p.hour();
    let m = p.minute();
    let s = p.second();

    // Smooth fraction within the current second (0..1)
    let secondFraction = (p.millis() % 1000) / 1000;

    // 0–11 hour index for pins + hour-progress
    let hourIndex = h24 % 12;

    // Display as 12-hr
    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    // Smooth minute progress within the current hour (0..1)
    let minuteProgress = (m + (s + secondFraction) / 60) / 60;

    // Hour progress across a 12-hour candle (0..1)
    let hourProgress = (hourIndex + minuteProgress) / 12;

    // --- TITLE + TIME ---
    p.fill(20);
    p.textSize(24);
    p.text("Candle Clock", 20, 20);

    let timeText = pad2(h12) + ":" + pad2(m) + ":" + pad2(s);
    p.textSize(18);
    p.text("Time: " + timeText, 20, 60);

    // Note (minutes encoding)
    p.fill(80);
    p.textSize(14);
    p.text("Minutes: wax drips (each drip = 5 minutes)", 20, 90);

    // -----------------------------
    // LAYOUT: PLATE + CANDLE ANCHORED
    // -----------------------------
    let cx = p.width / 2;

    let plateCenterY = p.height - 80;
    let plateWidth = 260;
    let plateHeight = 34;

    let candleWidth = 90;
    let candleHeight = 260;

    let candleBottomY = plateCenterY - plateHeight / 2;
    let candleCenterY = candleBottomY - candleHeight / 2;

    let originalCandleTopY = candleCenterY - candleHeight / 2;

    // --- PLATE ---
    p.noStroke();
    p.fill(200);
    p.ellipse(cx, plateCenterY, plateWidth, plateHeight);

    // --- CANDLE BODY (base) ---
    p.noStroke();
    p.fill(235);
    p.rect(cx, candleCenterY, candleWidth, candleHeight, 22);

    // --- BURN MASK (hourProgress -> burn amount) ---
    let burnAmount = hourProgress * (candleHeight * 0.70);

    p.fill(245);
    p.rect(
      cx,
      originalCandleTopY + burnAmount / 2,
      candleWidth + 6,
      burnAmount + 2,
      22
    );

    // Current candle top after burning
    let currentCandleTopY = originalCandleTopY + burnAmount;

    // -----------------------------
    // MELTED WAX POOL AT TOP (3D rim matches candle width)
    // -----------------------------
    let rimWidth = candleWidth;
    let rimHeight = 16;

    let innerRimWidth = candleWidth - 18;
    let innerRimHeight = 10;

    p.noStroke();
    p.fill(228);
    p.ellipse(cx, currentCandleTopY + 10, rimWidth, rimHeight);

    p.fill(235);
    p.ellipse(cx, currentCandleTopY + 9, innerRimWidth, innerRimHeight);

    // -----------------------------
    // MINUTE DRIP COUNT (5-minute chunks) ONLY
    // -----------------------------
    let dripCount = Math.floor(m / 5);

    let dripX = cx + candleWidth / 2 - 7;
    let dripStartY = currentCandleTopY + 14;
    let dripSpacing = 14;

    let dripMinY = currentCandleTopY + 12;
    let dripMaxY = candleBottomY - 14;

    for (let i = 0; i < dripCount; i++) {
      let dripY = dripStartY + i * dripSpacing;

      if (dripY < dripMinY) dripY = dripMinY;
      if (dripY > dripMaxY) break;

      // subtle wobble (kept tiny so drips don't look chaotic)
      let wobble = p.sin(((m * 60) + s + secondFraction) * 6 + i * 35) * 0.8;

      let isNewest = (i === dripCount - 1);

      p.noStroke();

      if (isNewest) {
        p.fill(200);
        p.ellipse(dripX + wobble, dripY, 10, 12);
      } else {
        p.fill(225);
        p.ellipse(dripX + wobble, dripY, 8, 10);
      }

      p.fill(220);
      p.ellipse(dripX + wobble, dripY + 6, 4, 6);
    }

    // -----------------------------
    // WICK (define tip so flame can be anchored to it)
    // -----------------------------
    let wickTopY = currentCandleTopY - 15;
    let wickBottomY = currentCandleTopY + 10;

    p.stroke(60);
    p.strokeWeight(3);
    p.line(cx, wickBottomY, cx, wickTopY);

    // -----------------------------
    // FLAME (1 smooth back-and-forth per second, CONNECTED to wick)
    // -----------------------------
    // phase goes 0 → 2π once every second
    let phase = (s + secondFraction) * 360;

    // single smooth sine wave
    let flicker = p.sin(phase);

    // horizontal sway
    let flickerX = flicker * 4;

    // size changes
    let outerFlameH = 26 + flicker * 6;
    let outerFlameW = 18 + flicker * 4;

    let innerFlameH = 14 + flicker * 4;
    let innerFlameW = 8 + flicker * 2.5;

    // Flame base is slightly ABOVE the wick tip
    let flameBaseY = wickTopY;

    // --- OUTER FLAME ---
    p.noStroke();
    p.fill(255, 170, 60);
    p.ellipse(
      cx + flickerX,
      flameBaseY - outerFlameH / 2,
      outerFlameW,
      outerFlameH
    );

    // --- INNER FLAME ---
    p.fill(255, 210, 120);
    p.ellipse(
      cx + flickerX,
      flameBaseY - innerFlameH / 2,
      innerFlameW,
      innerFlameH
    );

    // -----------------------------
    // PINS + LABELS (hours)
    // -----------------------------
    let pinCount = 12;
    let pinSpacing = candleHeight / pinCount;

    p.textSize(12);

    for (let i = 0; i < pinCount; i++) {
      let y = originalCandleTopY + i * pinSpacing;
      let x = cx + candleWidth / 2 + 14;

      p.noStroke();
      p.fill(150, 0, 0);
      p.ellipse(x, y, 6, 6);

      let label = String(i);
      if (i === 0) label = "12";

      p.fill(90);
      p.text(label, x + 12, y - 6);

      if (i === hourIndex) {
        p.noFill();
        p.stroke(255, 120, 120);
        p.strokeWeight(2);
        p.ellipse(x, y, 16, 16);

        p.noStroke();
        p.fill(220, 0, 0);
        p.ellipse(x, y, 9, 9);

        p.fill(20);
        p.text(label, x + 12, y - 6);
      }
    }

    // -----------------------------
    // LEGEND (kept clean + not overlapping)
    // -----------------------------
    let legendX = cx + candleWidth / 2 + 14;
    let legendY = originalCandleTopY - 30;

    p.noStroke();
    p.fill(80);
    p.textSize(13);
    p.text("Hours", legendX, legendY);
  };

  p.windowResized = function () { };

});
