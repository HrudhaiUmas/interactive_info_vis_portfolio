// Candle Clock — sketch2

registerSketch('sk2', function (p) {

  // Helper: pads numbers like 4 -> "04"
  function pad2(num) {
    if (num < 10) {
      return "0" + num;
    }
    return String(num);
  }

  p.setup = function () {
    // Keep within the assignment max (<= 800 x 800)
    // This makes your sketch consistent across devices
    p.createCanvas(700, 500);

    // Makes drawing smoother
    p.angleMode(p.DEGREES);
    p.textAlign(p.LEFT, p.TOP);
  };

  p.draw = function () {
    // 1) Clear background each frame so it redraws cleanly
    p.background(245);

    // 2) Read the current time every frame (this is your "data")
    let h24 = p.hour();        // 0–23
    let m = p.minute();        // 0–59
    let s = p.second();        // 0–59

    // 3) Convert to 12-hour format for display (still a clock)
    let h12 = h24 % 12;
    if (h12 === 0) {
      h12 = 12;
    }

    // 4) Draw a title so a viewer knows what this is
    p.fill(20);
    p.textSize(24);
    p.text("Candle Clock", 20, 20);

    // 5) Draw live digital time (debug + readability)
    // This is temporary — you can remove it later, but it helps testing.
    let timeText = pad2(h12) + ":" + pad2(m) + ":" + pad2(s);
    p.textSize(18);
    p.text("Time: " + timeText, 20, 60);

    // 6) Add a tiny note for yourself (you can delete later)
    p.textSize(14);
    p.fill(70);
    p.text("Next: draw candle body + plate", 20, 90);
  };

  p.windowResized = function () {
    // Keep the design stable; do not resize to full window,
    // because that can exceed 800x800 and change layout.
    // If you want responsive later, we can do it carefully.
  };

});
