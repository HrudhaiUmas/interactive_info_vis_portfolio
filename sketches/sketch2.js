// Candle Clock — sketch2
// Commit #12: Remove bottom artifact + simplify top + make flame flicker tied to seconds

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

    // Display as 12-hr
    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    // Smooth minute progress within the current hour (0..1)
    let minuteProgress = (m + s / 60) / 60;

    // Hour progress across a 12-hour candle (0..1)
    let hourProgress = (hourIndex + minuteProgress) / 12;

    // --- TITLE + TIME ---
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
    // MELTED WAX POOL AT TOP (adds realism + clarity)
    // -----------------------------
    p.noStroke();
    p.fill(228);
    p.ellipse(cx, currentCandleTopY + 10, candleWidth - 18, 16);

    p.fill(235);
    p.ellipse(cx, currentCandleTopY + 9, candleWidth - 34, 10);

    // -----------------------------
    // MINUTE MELT LINE INSIDE CANDLE (mapped to remaining wax)
    // -----------------------------
    let topPadding = 12;
    let bottomPadding = 18; // slightly larger so the line never sits near the bottom

    let remainingTopY = currentCandleTopY + topPadding;
    let remainingBottomY = candleBottomY - bottomPadding;

    let minuteLineY = remainingTopY + (minuteProgress * (remainingBottomY - remainingTopY));

    // draw melt line
    p.stroke(210);
    p.strokeWeight(3);
    p.line(cx - candleWidth / 2 + 10, minuteLineY, cx + candleWidth / 2 - 10, minuteLineY);

    // small tick at right edge
    p.strokeWeight(2);
    p.line(cx + candleWidth / 2 - 10, minuteLineY, cx + candleWidth / 2 - 4, minuteLineY);

    // -----------------------------
    // MINUTE DRIP COUNT (5-minute chunks) — anchored near wick/top
    // -----------------------------
    let dripCount = Math.floor(m / 5);

    // Start drips right below the wick base (near top surface)
    let dripX = cx + candleWidth / 2 - 7;

    // put the first drip very close to the wick/top edge
    let dripStartY = currentCandleTopY + 14;

    // spacing down the side
    let dripSpacing = 14;

    // only allow drips within the remaining wax region
    let dripMinY = currentCandleTopY + 12;
    let dripMaxY = candleBottomY - 14;

    // -----------------------------
    // CONNECTOR LINE (melt line -> drip side) for clear mapping
    // -----------------------------
    p.stroke(220);
    p.strokeWeight(1);
    let edgeX = cx + candleWidth / 2 - 10;
    p.line(edgeX, minuteLineY, dripX - 2, minuteLineY);
    p.noStroke();

    for (let i = 0; i < dripCount; i++) {
      let dripY = dripStartY + i * dripSpacing;

      if (dripY < dripMinY) dripY = dripMinY;
      if (dripY > dripMaxY) break;

      // subtle wobble (stable + alive)
      // tie wobble to seconds so it always changes as time changes,
      // and also add a tiny frame-based component so it feels alive within the second
      let wobble = p.sin((s * 40) + (p.frameCount * 2) + i * 35) * 0.8;

      // Highlight newest drip so current 5-min bucket is obvious
      let isNewest = (i === dripCount - 1);

      p.noStroke();

      if (isNewest) {
        p.fill(200); // slightly darker
        p.ellipse(dripX + wobble, dripY, 10, 12);
      } else {
        p.fill(225);
        p.ellipse(dripX + wobble, dripY, 8, 10);
      }

      // Drip tail
      p.fill(220);
      p.ellipse(dripX + wobble, dripY + 6, 4, 6);
    }

    // -----------------------------
    // FLAME FLICKER (tied to seconds so it always changes each second)
    // -----------------------------
    // t goes 0..1 within the current second (smooth animation)
    let t = (p.millis() % 1000) / 1000;

    // A second-synced wave: each second has a new "phase", and within the second it animates smoothly
    // This guarantees it updates with real time and still looks alive between second ticks.
    let flickerWave = p.sin((s * 30) + (t * 360));
    let flickerX = flickerWave * 2;
    let outerFlameH = 26 + flickerWave * 3;
    let outerFlameW = 18 + flickerWave * 2;

    let innerWave = p.sin((s * 34) + (t * 420) + 40);
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
    p.text("Minutes: internal melt line + drip count (5-min steps)", 20, 90);
  };

  p.windowResized = function () { };

});
