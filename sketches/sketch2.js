// Candle Clock — sketch2
// Commit #4: Wick + flame follow the burn height (no more floating flame)

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

    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    // Smooth minute progress so the burn moves smoothly
    let minuteProgress = (m + s / 60) / 60; // 0 -> 1

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

    // --- CANDLE BODY (base shape) ---
    p.noStroke();
    p.fill(235);
    p.rect(cx, candleCenterY, candleWidth, candleHeight, 22);

    // ---------------------------------------
    // BURN EFFECT: hide the top based on minute
    // ---------------------------------------
    let burnAmount = minuteProgress * (candleHeight * 0.70); // burn through 70% visually

    // Cover wax from the top down (background-colored mask)
    p.fill(245);
    p.rect(
      cx,
      originalCandleTopY + burnAmount / 2,
      candleWidth + 6,
      burnAmount + 2,
      22
    );

    // NEW: compute the current top of the candle AFTER burning
    let currentCandleTopY = originalCandleTopY + burnAmount;

    // --- WICK (attached to current candle top) ---
    p.stroke(60);
    p.strokeWeight(3);
    p.line(
      cx,
      currentCandleTopY + 10,
      cx,
      currentCandleTopY - 15
    );

    // --- FLAME (attached to current candle top) ---
    p.noStroke();
    p.fill(255, 170, 60);
    p.ellipse(cx, currentCandleTopY - 28, 18, 28);

    p.fill(255, 210, 120);
    p.ellipse(cx, currentCandleTopY - 25, 8, 14);

    // --- PIN PLACEHOLDERS (still static for now) ---
    let pinCount = 12;
    let pinSpacing = candleHeight / pinCount;

    p.fill(150, 0, 0);
    for (let i = 0; i < pinCount; i++) {
      let y = originalCandleTopY + i * pinSpacing;
      p.ellipse(cx + candleWidth / 2 + 14, y, 6, 6);
    }

    // --- NOTE ---
    p.fill(80);
    p.textSize(14);
    p.text("Next: highlight current hour pin (hour -> pin)", 20, 90);
  };

  p.windowResized = function () { };

});
