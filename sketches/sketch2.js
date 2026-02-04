// Candle Clock — sketch2
// Fix: Make the hour ruler use the SAME vertical span as the candle burn span
//      so the candle top + hour ruler always match.

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

    // 0–11 hour index (12-hour clock)
    let hourIndex = h24 % 12;

    // Display as 12-hr
    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    // Smooth minute progress within the current hour (0..1)
    let minuteProgress = (m + (s + secondFraction) / 60) / 60;

    // Hour progress across a 12-hour candle (0..1)
    // (hourIndex in 0..11, plus fractional minute progress)
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

    // -----------------------------
    // IMPORTANT FIX:
    // Define ONE burn span and use it for:
    //  - burn mask + current candle top
    //  - hour ruler top/bottom + pin spacing
    // -----------------------------
    let burnSpan = candleHeight * 0.70;      // how much of the candle is "time"
    let burnTopY = originalCandleTopY;       // burn starts at the candle's original top
    let burnBottomY = burnTopY + burnSpan;   // burn ends here (leaves a base unburned)

    // --- BURN MASK (hourProgress -> burn amount) ---
    let burnAmount = hourProgress * burnSpan;

    // Hide the burned portion (top-down)
    p.fill(245);
    p.rect(
      cx,
      burnTopY + burnAmount / 2,
      candleWidth + 6,
      burnAmount + 2,
      22
    );

    // Current candle top after burning (THIS is the key Y we align everything to)
    let currentCandleTopY = burnTopY + burnAmount;

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

    // Cap how many drips we draw so they don't crowd at minute 50–59
    let maxVisibleDrips = 6;
    let startIndex = 0;
    if (dripCount > maxVisibleDrips) {
      startIndex = dripCount - maxVisibleDrips;
    }

    for (let i = startIndex; i < dripCount; i++) {
      let localIndex = i - startIndex;
      let dripY = dripStartY + localIndex * dripSpacing;

      if (dripY < dripMinY) dripY = dripMinY;
      if (dripY > dripMaxY) break;

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
    let phase = (s + secondFraction) * 360;
    let flicker = p.sin(phase);

    let flickerX = flicker * 4;

    let outerFlameH = 26 + flicker * 6;
    let outerFlameW = 18 + flicker * 4;

    let innerFlameH = 14 + flicker * 4;
    let innerFlameW = 8 + flicker * 2.5;

    let flameBaseY = wickTopY;

    p.noStroke();
    p.fill(255, 170, 60);
    p.ellipse(
      cx + flickerX,
      flameBaseY - outerFlameH / 2,
      outerFlameW,
      outerFlameH
    );

    p.fill(255, 210, 120);
    p.ellipse(
      cx + flickerX,
      flameBaseY - innerFlameH / 2,
      innerFlameW,
      innerFlameH
    );

    // -----------------------------
    // PINS + LABELS (hours)
    // FIX: Make ruler span EXACTLY the same burn span (burnTopY -> burnBottomY)
    // Also use 13 pins so there are 12 equal intervals (true 12-hour span).
    // -----------------------------
    let pinCount = 13; // 0..12 -> 12 intervals

    let hourTopY = burnTopY;
    let hourBottomY = burnBottomY;

    let pinSpacing = (hourBottomY - hourTopY) / (pinCount - 1);
    let pinX = cx + candleWidth / 2 + 14;

    p.textSize(12);

    for (let i = 0; i < pinCount; i++) {
      let y = hourTopY + i * pinSpacing;

      // base pin dot
      p.noStroke();
      p.fill(150, 0, 0);
      p.ellipse(pinX, y, 6, 6);

      // labels: 0 and 12 are both "12"
      let label;
      if (i === 0 || i === 12) label = "12";
      else label = String(i);

      p.fill(90);
      p.text(label, pinX + 12, y - 6);
    }

    // -----------------------------
    // "NOW" marker: draw at the candle top Y (perfect alignment check)
    // -----------------------------
    p.noFill();
    p.stroke(255, 120, 120);
    p.strokeWeight(2);
    p.ellipse(pinX, currentCandleTopY, 16, 16);

    p.noStroke();
    p.fill(220, 0, 0);
    p.ellipse(pinX, currentCandleTopY, 9, 9);

    // small tick across the ruler at the exact candle top
    p.stroke(255, 120, 120);
    p.strokeWeight(2);
    p.line(pinX - 10, currentCandleTopY, pinX + 10, currentCandleTopY);

    // -----------------------------
    // LEGEND (kept clean + not overlapping)
    // -----------------------------
    let legendX = pinX;
    let legendY = originalCandleTopY - 30;

    p.noStroke();
    p.fill(80);
    p.textSize(13);
    p.text("Hours", legendX, legendY);

    // p.textSize(12);
    // p.text("Wax Drips Count: " + dripCount + " (5 min each)", legendX, legendY + 18);
  };

  p.windowResized = function () { };

});
