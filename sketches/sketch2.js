// Candle Clock — sketch2
// Commit #2 (fix): Candle touches the plate (static candle form)

registerSketch('sk2', function (p) {

  // Pads numbers like 4 -> "04"
  function pad2(num) {
    if (num < 10) {
      return "0" + num;
    }
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

    // --- TIME (debug only for now) ---
    let h24 = p.hour();
    let m = p.minute();
    let s = p.second();

    let h12 = h24 % 12;
    if (h12 === 0) {
      h12 = 12;
    }

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

    // Plate near the bottom
    let plateCenterY = p.height - 80;
    let plateWidth = 260;
    let plateHeight = 34;

    // Candle size
    let candleWidth = 90;
    let candleHeight = 260;

    // Candle bottom sits on the TOP edge of the plate
    let candleBottomY = plateCenterY - plateHeight / 2;
    let candleCenterY = candleBottomY - candleHeight / 2;

    // --- PLATE ---
    p.noStroke();
    p.fill(200);
    p.ellipse(cx, plateCenterY, plateWidth, plateHeight);

    // --- CANDLE BODY ---
    p.fill(235);
    p.rect(cx, candleCenterY, candleWidth, candleHeight, 22);

    // --- WICK ---
    let candleTopY = candleCenterY - candleHeight / 2;
    p.stroke(60);
    p.strokeWeight(3);
    p.line(cx, candleTopY + 10, cx, candleTopY - 15);

    // --- FLAME (static) ---
    p.noStroke();
    p.fill(255, 170, 60);
    p.ellipse(cx, candleTopY - 28, 18, 28);

    p.fill(255, 210, 120);
    p.ellipse(cx, candleTopY - 25, 8, 14);

    // --- PIN PLACEHOLDERS (12 total, one per hour) ---
    let pinCount = 12;
    let pinSpacing = candleHeight / pinCount;

    p.fill(150, 0, 0);
    for (let i = 0; i < pinCount; i++) {
      let y = candleTopY + i * pinSpacing;
      p.ellipse(cx + candleWidth / 2 + 14, y, 6, 6);
    }

    // --- NOTE FOR NEXT STEP ---
    p.fill(80);
    p.textSize(14);
    p.text("Next: map candle burn level to minutes", 20, 90);
  };

  p.windowResized = function () {
    // keep layout fixed for consistency
  };

});
