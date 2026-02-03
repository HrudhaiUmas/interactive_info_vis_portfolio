// Candle Clock — sketch2
// Commit #8: Candle burn height maps to hour progress (12-hour cycle)
// Minutes/seconds still exist, but they no longer reset the candle each hour.

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

    // 0–11 hour index for pins + hour-progress
    let hourIndex = h24 % 12;

    // Debug display as 12-hr
    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    // Smooth minute progress within the current hour (0..1)
    let minuteProgress = (m + s / 60) / 60;

    // Hour progress across a 12-hour candle (0..1)
    // Example: at 1:30, hourProgress = (1 + 0.5) / 12
    let hourProgress = (hourIndex + minuteProgress) / 12;

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

    // --- BURN MASK (hourProgress -> burn amount) ---
    // Burn through 70% visually so you still see candle body at the end.
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
    // FLAME FLICKER (subtle motion)
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
    // PINS + LABELS (hourIndex highlight)
    // -----------------------------
    let pinCount = 12;
    let pinSpacing = candleHeight / pinCount;

    p.textSize(12);

    for (let i = 0; i < pinCount; i++) {
      let y = originalCandleTopY + i * pinSpacing;
      let x = cx + candleWidth / 2 + 14;

      // Normal pin
      p.noStroke();
      p.fill(150, 0, 0);
      p.ellipse(x, y, 6, 6);

      // Label (0 -> 12)
      let label = String(i);
      if (i === 0) label = "12";

      p.fill(90);
      p.text(label, x + 12, y - 6);

      // Highlight current hour pin
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

    // --- NOTE ---
    p.fill(80);
    p.textSize(14);
    p.text("Next: add minute melt line inside candle (Option A)", 20, 90);
  };

  p.windowResized = function () { };

});
