// Instance-mode sketch for tab 3 (Clock B - build from scratch)
registerSketch('sk3', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  // Geolocation state
  let userLat = 47.6062;     // fallback
  let userLon = -122.3321;   // fallback
  let locationLine = "Location: (click Enable Location)";

  // In-canvas button state
  let geoButton = {
    x: 16,
    y: 16,
    w: 150,
    h: 34,
    label: "Enable Location",
    isHover: false
  };

  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  // Commit 2: sky gradient
  function drawSkyGradient() {
    const steps = 40;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);

      const r = p.lerp(15, 70, t);
      const g = p.lerp(25, 90, t);
      const b = p.lerp(55, 140, t);

      p.noStroke();
      p.fill(r, g, b);

      const y = (i / steps) * p.height;
      p.rect(0, y, p.width, (p.height / steps) + 1);
    }
  }

  // Commit 3: starfield
  function drawStars() {
    p.noStroke();
    const starCount = 70;

    for (let i = 0; i < starCount; i++) {
      const x = (i * 97) % p.width;
      const y = (i * 53) % Math.floor(p.height * 0.65);

      const twinkle = 160 + 80 * Math.sin((p.frameCount * 0.03) + i);

      p.fill(255, 255, 255, twinkle);
      p.circle(x, y, 2);
    }
  }

  // Commit 4: arc + horizon baseline
  function drawArcAndHorizon() {
    const cx = p.width * 0.5;
    const cy = p.height * 0.62;
    const arcW = p.width * 0.78;
    const arcH = p.height * 0.78;

    p.noFill();
    p.stroke(255, 255, 255, 130);
    p.strokeWeight(3);
    p.arc(cx, cy, arcW, arcH, p.PI, p.TWO_PI);

    p.stroke(0, 0, 0, 60);
    p.strokeWeight(2);
    p.line(p.width * 0.12, cy, p.width * 0.88, cy);

    const topY = cy - (arcH / 2);
    const horizonY = cy;

    return { cx, cy, arcW, arcH, topY, horizonY };
  }

  // Commit 5: centered HH:MM:SS time pill
  function pad2(n) {
    return (n < 10) ? ("0" + n) : ("" + n);
  }

  function formatHMS(h, m, s) {
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function drawCenteredTimePill(geom) {
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    const centerX = geom.cx;
    const centerY = (geom.topY + geom.horizonY) / 2;

    const boxW = p.width * 0.62;
    const boxH = 70;

    const x = centerX - (boxW / 2);
    const y = centerY - (boxH / 2);

    p.noStroke();
    p.fill(0, 0, 0, 160);
    p.rect(x, y, boxW, boxH, 18);

    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(40);
    p.text(formatHMS(h, m, s), centerX, centerY);
  }

  // Commit 6: sun/moon orbit along the arc by time-of-day
  function getDayFraction() {
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    const totalSeconds = (h * 3600) + (m * 60) + s;
    return totalSeconds / (24 * 3600);
  }

  function isDaytimeSimple() {
    const h = p.hour();
    return (h >= 6 && h < 18);
  }

  function drawSunOrMoon(geom) {
    const dayFraction = getDayFraction();
    const angle = p.lerp(p.PI, p.TWO_PI, dayFraction);

    const x = geom.cx + (geom.arcW / 2) * Math.cos(angle);
    const y = geom.cy + (geom.arcH / 2) * Math.sin(angle);

    const dayMode = isDaytimeSimple();

    p.noStroke();

    if (dayMode) {
      p.fill(255, 210, 60);
      p.circle(x, y, 46);

      p.stroke(255, 210, 60, 150);
      p.strokeWeight(2);

      const rays = 10;
      for (let i = 0; i < rays; i++) {
        const a = (p.TWO_PI * i) / rays + (p.frameCount * 0.01);
        const x1 = x + 30 * Math.cos(a);
        const y1 = y + 30 * Math.sin(a);
        const x2 = x + 42 * Math.cos(a);
        const y2 = y + 42 * Math.sin(a);
        p.line(x1, y1, x2, y2);
      }
    } else {
      p.fill(230, 230, 255);
      p.circle(x, y, 40);

      p.fill(15, 25, 55);
      p.circle(x + 10, y - 5, 36);
    }
  }

  // Geolocation request (triggered by in-canvas button)
  function requestGeolocation() {
    if (!navigator.geolocation) {
      locationLine = "Location: Geolocation not supported";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        userLat = pos.coords.latitude;
        userLon = pos.coords.longitude;

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown TZ";
        locationLine =
          "Location: " + tz +
          "  •  lat " + userLat.toFixed(2) +
          ", lon " + userLon.toFixed(2);
      },
      function () {
        locationLine = "Location: permission denied (using fallback)";
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  }

  // In-canvas button drawing
  function drawGeoButton() {
    // Hover detection
    geoButton.isHover =
      (p.mouseX >= geoButton.x && p.mouseX <= geoButton.x + geoButton.w &&
       p.mouseY >= geoButton.y && p.mouseY <= geoButton.y + geoButton.h);

    // Button background
    p.noStroke();
    if (geoButton.isHover) p.fill(255, 255, 255, 220);
    else p.fill(255, 255, 255, 180);

    p.rect(geoButton.x, geoButton.y, geoButton.w, geoButton.h, 12);

    // Button text
    p.fill(20);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(
      geoButton.label,
      geoButton.x + geoButton.w / 2,
      geoButton.y + geoButton.h / 2
    );
  }

  // Location pill
  function drawLocationLine() {
    p.noStroke();
    p.fill(0, 0, 0, 140);
    p.rect(12, 60, 520, 26, 10);

    p.fill(255);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(12);
    p.text(locationLine, 22, 73);
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  // Click handler for in-canvas button
  p.mousePressed = function () {
    const inside =
      (p.mouseX >= geoButton.x && p.mouseX <= geoButton.x + geoButton.w &&
       p.mouseY >= geoButton.y && p.mouseY <= geoButton.y + geoButton.h);

    if (inside) {
      requestGeolocation();
    }
  };

  p.draw = function () {
    drawSkyGradient();
    drawStars();

    const geom = drawArcAndHorizon();

    drawSunOrMoon(geom);
    drawCenteredTimePill(geom);

    // New: in-canvas button + location line
    drawGeoButton();
    drawLocationLine();
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
