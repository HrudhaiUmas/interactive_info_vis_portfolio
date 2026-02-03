// Candle Clock — sketch2
// Commit #7: Add labels to pins (12, 1..11) for readability

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

    let hourIndex = h24 % 12;

    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    let minuteProgress = (m + s / 60) / 60;

    // --- TITLE + DEBUG TIME ---
    p.fill(20);
    p.textSize(24);
    p.text("Candle Clock", 20, 20);

    let timeText = pad2(h12) + ":" + pad2(m) + ":" + pad2(s);
    p.textSize(18);
    p.text("Time: " + timeText, 20, 60);

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

    // --- BURN MASK (minute -> burn amount) ---
    let burnAmount = minuteProgress * (candleHeight * 0.70);

    p.fill(245);
    p.rect(
      cx,
      originalCandleTopY + burnAmount / 2,
      candleWidth + 6,
      burnAmount + 2,
      22
    );

    let currentCandleTopY = originalCandleTopY + burnAmount;

    // -----------------------------
    // FLAME FLICKER (seconds -> motion)
    // -----------------------------
    let flickerWave = p.sin(p.frameCount * 6);
    let flickerX = flickerWave * 2;
    let outerFlameH = 26 + flickerWave * 3;
    let outerFlameW = 18 + flickerWave * 2;

    let innerWave = p.sin(p.frameCount * 8 + 40);
    let innerFlameH = 14 + innerWave * 2;
    let innerFlameW = 8 + innerWave * 1.5;

    // --- WICK ---
    p.stroke(60);
    p.strokeWeight(3);
    p.line(cx, currentCandleTopY + 10, cx, currentCandleTopY - 15);

    // --- OUTER FLAME ---
    p.noStroke();
    p.fill(255, 170, 60);
    p.ellipse(cx + flickerX, currentCandleTopY - 28, outerFlameW, outerFlameH);

    // --- INNER FLAME ---
    p.fill(255, 210, 120);
    p.ellipse(cx + flickerX, currentCandleTopY - 25, innerFlameW, innerFlameH);

    // -----------------------------
    // PINS + LABELS
    // -----------------------------
    let pinCount = 12;
    let pinSpacing = candleHeight / pinCount;

    // Label style
    p.textSize(12);
    p.fill(90);

    for (let i = 0; i < pinCount; i++) {
      let y = originalCandleTopY + i * pinSpacing;
      let x = cx + candleWidth / 2 + 14;

      // Normal pin
      p.noStroke();
      p.fill(150, 0, 0);
      p.ellipse(x, y, 6, 6);

      // Label mapping:
      // i=0 -> "12"
      // i=1 -> "1"
      // ...
      // i=11 -> "11"
      let label = String(i);
      if (i === 0) label = "12";

      // Draw label slightly to the right of the pin
      p.noStroke();
      p.fill(90);
      p.text(label, x + 12, y - 6);

      // Highlight current hour pin
      if (i === hourIndex) {
        // Glow ring
        p.noFill();
        p.stroke(255, 120, 120);
        p.strokeWeight(2);
        p.ellipse(x, y, 16, 16);

        // Bright center
        p.noStroke();
        p.fill(220, 0, 0);
        p.ellipse(x, y, 9, 9);

        // Optional: make current label darker for emphasis
        p.fill(20);
        p.text(label, x + 12, y - 6);
      }
    }

    // --- NOTE ---
    p.fill(80);
    p.textSize(14);
    p.text("Next: add wax drip animation (subtle)", 20, 90);
  };

  p.windowResized = function () { };

});
