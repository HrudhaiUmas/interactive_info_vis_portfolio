// Candle Clock — sketch2
// Feature add:
// - UI controls anchored to BOTTOM-LEFT of the canvas (not the page)
// - User can change: Background, Candle Body, Wax (rim + drips)
// - Cleaner UI panel styling + layout

registerSketch('sk2', function (p) {

  function pad2(num) {
    if (num < 10) return "0" + num;
    return String(num);
  }

  // --- UI elements ---
  let bgPicker;
  let candlePicker;
  let waxPicker;
  let canvasEl; // store the canvas so we can anchor UI to it

  // --- Helper: clamp to 0..255 ---
  function clamp255(val) {
    if (val < 0) return 0;
    if (val > 255) return 255;
    return val;
  }

  // --- Helper: lighten/darken a p5 color by an amount (-255..255) ---
  function shiftColor(baseColor, amount) {
    let r = clamp255(p.red(baseColor) + amount);
    let g = clamp255(p.green(baseColor) + amount);
    let b = clamp255(p.blue(baseColor) + amount);
    return p.color(r, g, b);
  }

  // --- Helper: anchor DOM elements to canvas (bottom-left) ---
  function positionUI() {
    // Canvas might not exist yet
    if (!canvasEl) return;

    // Get canvas position on the page
    let rect = canvasEl.elt.getBoundingClientRect();

    // Panel layout (inside the canvas bounds)
    let panelPadding = 14;
    let panelW = 220;
    let panelH = 120;

    let panelX = rect.left + panelPadding;
    let panelY = rect.top + (p.height - panelH - panelPadding);

    // Place pickers inside the panel
    // Each picker is a DOM element, so we position it in page space.
    let pickerX = panelX + 120;
    let bgY = panelY + 38;
    let candleY = panelY + 68;
    let waxY = panelY + 98;

    bgPicker.position(pickerX, bgY);
    candlePicker.position(pickerX, candleY);
    waxPicker.position(pickerX, waxY);
  }

  // Optional: make the DOM pickers look nicer
  function stylePicker(picker) {
    picker.style('width', '70px');
    picker.style('height', '22px');
    picker.style('padding', '0px');
    picker.style('border', '1px solid rgba(0,0,0,0.25)');
    picker.style('border-radius', '6px');
    picker.style('background', 'transparent');
  }

  p.setup = function () {
    canvasEl = p.createCanvas(700, 500);

    p.angleMode(p.DEGREES);
    p.rectMode(p.CENTER);
    p.textAlign(p.LEFT, p.TOP);

    // -----------------------------
    // UI: Color pickers
    // -----------------------------
    // Defaults match your original-ish look
    bgPicker = p.createColorPicker(p.color(245));    // Background
    candlePicker = p.createColorPicker(p.color(235)); // Candle body
    waxPicker = p.createColorPicker(p.color(228));    // Wax (rim + drips)

    stylePicker(bgPicker);
    stylePicker(candlePicker);
    stylePicker(waxPicker);

    // Position them once initially
    positionUI();
  };

  p.draw = function () {

    // Keep UI pinned to bottom-left even if page layout shifts
    positionUI();

    // -----------------------------
    // READ USER COLORS
    // -----------------------------
    let bgColor = bgPicker.color();
    let candleColor = candlePicker.color();
    let waxColor = waxPicker.color();

    // Wax shading (rim/drips)
    let waxRimOuter = shiftColor(waxColor, -10);
    let waxRimInner = shiftColor(waxColor, +8);

    let dripOld = shiftColor(waxColor, -8);
    let dripNew = shiftColor(waxColor, -30);
    let dripTail = shiftColor(waxColor, -14);

    // background
    p.background(bgColor);

    // --- TIME ---
    let h24 = p.hour();
    let m = p.minute();
    let s = p.second();

    let secondFraction = (p.millis() % 1000) / 1000;

    let hourIndex = h24 % 12;

    let h12 = hourIndex;
    if (h12 === 0) h12 = 12;

    let minuteProgress = (m + (s + secondFraction) / 60) / 60;
    let hourProgress = (hourIndex + minuteProgress) / 12;

    // --- TITLE + TIME ---
    p.fill(20);
    p.textSize(24);
    p.text("Candle Clock", 20, 20);

    let timeText = pad2(h12) + ":" + pad2(m) + ":" + pad2(s);
    p.textSize(18);
    p.text("Time: " + timeText, 20, 60);

    p.fill(80);
    p.textSize(14);
    p.text("Minutes: wax drips (each drip = 5 minutes)", 20, 90);

    // -----------------------------
    // DRAW UI PANEL (bottom-left, inside canvas)
    // -----------------------------
    let panelPadding = 14;
    let panelW = 220;
    let panelH = 120;

    let panelX = panelPadding;
    let panelY = p.height - panelH - panelPadding;

    // Panel background
    p.noStroke();
    p.fill(255, 255, 255, 170);
    p.rect(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 14);

    // Panel title + labels
    p.fill(40);
    p.textSize(13);
    p.text("Customize", panelX + 12, panelY + 10);

    p.fill(60);
    p.textSize(12);
    p.text("Background", panelX + 12, panelY + 40);
    p.text("Candle Body", panelX + 12, panelY + 70);
    p.text("Wax", panelX + 12, panelY + 100);

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

    // --- CANDLE BODY ---
    p.noStroke();
    p.fill(candleColor);
    p.rect(cx, candleCenterY, candleWidth, candleHeight, 22);

    // -----------------------------
    // Shared burn span
    // -----------------------------
    let burnSpan = candleHeight * 0.70;
    let burnTopY = originalCandleTopY;
    let burnBottomY = burnTopY + burnSpan;

    let burnAmount = hourProgress * burnSpan;

    // Burn mask matches background
    p.fill(bgColor);
    p.rect(
      cx,
      burnTopY + burnAmount / 2,
      candleWidth + 6,
      burnAmount + 2,
      22
    );

    let currentCandleTopY = burnTopY + burnAmount;

    // -----------------------------
    // MELTED WAX POOL AT TOP (uses WAX color)
    // -----------------------------
    let rimWidth = candleWidth;
    let rimHeight = 16;

    let innerRimWidth = candleWidth - 18;
    let innerRimHeight = 10;

    p.noStroke();
    p.fill(waxRimOuter);
    p.ellipse(cx, currentCandleTopY + 10, rimWidth, rimHeight);

    p.fill(waxRimInner);
    p.ellipse(cx, currentCandleTopY + 9, innerRimWidth, innerRimHeight);

    // -----------------------------
    // MINUTE DRIPS (uses WAX color)
    // -----------------------------
    let dripCount = Math.floor(m / 5);

    let dripX = cx + candleWidth / 2 - 7;
    let dripStartY = currentCandleTopY + 14;
    let dripSpacing = 14;

    let dripMinY = currentCandleTopY + 12;
    let dripMaxY = candleBottomY - 14;

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
        p.fill(dripNew);
        p.ellipse(dripX + wobble, dripY, 10, 12);
      } else {
        p.fill(dripOld);
        p.ellipse(dripX + wobble, dripY, 8, 10);
      }

      p.fill(dripTail);
      p.ellipse(dripX + wobble, dripY + 6, 4, 6);
    }

    // -----------------------------
    // WICK
    // -----------------------------
    let wickTopY = currentCandleTopY - 15;
    let wickBottomY = currentCandleTopY + 10;

    p.stroke(60);
    p.strokeWeight(3);
    p.line(cx, wickBottomY, cx, wickTopY);

    // -----------------------------
    // FLAME
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
    // PINS + LABELS (hours) — aligned to burn span
    // -----------------------------
    let pinCount = 13; // 0..12 -> 12 intervals

    let hourTopY = burnTopY;
    let hourBottomY = burnBottomY;

    let pinSpacing = (hourBottomY - hourTopY) / (pinCount - 1);
    let pinX = cx + candleWidth / 2 + 14;

    p.textSize(12);

    for (let i = 0; i < pinCount; i++) {
      let y = hourTopY + i * pinSpacing;

      p.noStroke();
      p.fill(150, 0, 0);
      p.ellipse(pinX, y, 6, 6);

      let label;
      if (i === 0 || i === 12) label = "12";
      else label = String(i);

      p.fill(90);
      p.text(label, pinX + 12, y - 6);
    }

    // "NOW" marker
    p.noFill();
    p.stroke(255, 120, 120);
    p.strokeWeight(2);
    p.ellipse(pinX, currentCandleTopY, 16, 16);

    p.noStroke();
    p.fill(220, 0, 0);
    p.ellipse(pinX, currentCandleTopY, 9, 9);

    p.stroke(255, 120, 120);
    p.strokeWeight(2);
    p.line(pinX - 10, currentCandleTopY, pinX + 10, currentCandleTopY);

    // -----------------------------
    // LEGEND
    // -----------------------------
    let legendX = pinX;
    let legendY = originalCandleTopY - 30;

    p.noStroke();
    p.fill(80);
    p.textSize(13);
    p.text("Hours", legendX, legendY);

    // (kept commented per your version)
    // p.textSize(12);
    // p.text("Wax Drips Count: " + dripCount + " (5 min each)", legendX, legendY + 18);
  };

  p.windowResized = function () {
    // If your environment ever resizes the canvas, keep UI anchored correctly.
    positionUI();
  };

});
