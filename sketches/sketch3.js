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

  // Commit 10: schedule data (internal 24h, displayed 12h)
  const scheduleBlocks = [
    { start: 0,  end: 7,  label: "Sleep" },
    { start: 7,  end: 8,  label: "Morning routine" },
    { start: 8,  end: 10, label: "Study / Deep work" },
    { start: 10, end: 12, label: "Class / Lecture" },
    { start: 12, end: 13, label: "Lunch" },
    { start: 13, end: 17, label: "Work block" },
    { start: 17, end: 18, label: "Gym / movement" },
    { start: 18, end: 20, label: "Dinner + friends" },
    { start: 20, end: 22, label: "Wind down" },
    { start: 22, end: 24, label: "Sleep prep" }
  ];

  function computeCanvasSize() {
    const w = Math.min(p.windowWidth, MAX_W);
    const h = Math.min(p.windowHeight, MAX_H);
    return { w, h };
  }

  // ====== Day/night gradient variants ======
  function drawSkyGradient(dayMode) {
    const steps = 40;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);

      let r, g, b;

      if (dayMode) {
        r = p.lerp(140, 245, t);
        g = p.lerp(200, 220, t);
        b = p.lerp(255, 180, t);
      } else {
        r = p.lerp(15, 70, t);
        g = p.lerp(25, 90, t);
        b = p.lerp(55, 140, t);
      }

      p.noStroke();
      p.fill(r, g, b);

      const y = (i / steps) * p.height;
      p.rect(0, y, p.width, (p.height / steps) + 1);
    }
  }

  // Stars (night-only)
  function drawStars(dayMode) {
    if (dayMode) return;

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

  // Arc + horizon baseline
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

  // Time pill helpers
  function pad2(n) {
    return (n < 10) ? ("0" + n) : ("" + n);
  }

  function formatHMS(h, m, s) {
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function drawCenteredTimePill(geom, dayMode) {
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
    if (dayMode) p.fill(255, 255, 255, 170);
    else p.fill(0, 0, 0, 160);

    p.rect(x, y, boxW, boxH, 18);

    p.fill(dayMode ? 30 : 255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(40);
    p.text(formatHMS(h, m, s), centerX, centerY);
  }

  // Sun/moon orbit
  function getDayFraction() {
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    const totalSeconds = (h * 3600) + (m * 60) + s;
    return totalSeconds / (24 * 3600);
  }

  function drawSunOrMoon(geom, dayMode) {
    const dayFraction = getDayFraction();
    const angle = p.lerp(p.PI, p.TWO_PI, dayFraction);

    const x = geom.cx + (geom.arcW / 2) * Math.cos(angle);
    const y = geom.cy + (geom.arcH / 2) * Math.sin(angle);

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

      p.fill(30, 40, 90);
      p.circle(x + 10, y - 5, 36);
    }
  }

  // Geolocation request
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

  // In-canvas button
  function drawGeoButton(dayMode) {
    geoButton.isHover =
      (p.mouseX >= geoButton.x && p.mouseX <= geoButton.x + geoButton.w &&
       p.mouseY >= geoButton.y && p.mouseY <= geoButton.y + geoButton.h);

    p.noStroke();
    p.fill(255, 255, 255, geoButton.isHover ? 220 : 180);
    p.rect(geoButton.x, geoButton.y, geoButton.w, geoButton.h, 12);

    p.fill(20);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(geoButton.label, geoButton.x + geoButton.w / 2, geoButton.y + geoButton.h / 2);
  }

  // Location line
  function drawLocationLine(dayMode) {
    p.noStroke();
    if (dayMode) p.fill(255, 255, 255, 160);
    else p.fill(0, 0, 0, 140);

    p.rect(12, 60, 520, 26, 10);

    p.fill(dayMode ? 30 : 255);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(12);
    p.text(locationLine, 22, 73);
  }

  // ====== Sunrise/Sunset computation (local, no API) ======
  function degToRad(d) { return d * (Math.PI / 180); }
  function radToDeg(r) { return r * (180 / Math.PI); }

  function dayOfYear(dateObj) {
    const start = new Date(dateObj.getFullYear(), 0, 0);
    const diff = dateObj - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function clamp(v, lo, hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
  }

  function computeSunriseSunsetMinutes(lat, lon, dateObj) {
    const zenith = 90.833;
    const N = dayOfYear(dateObj);
    const lngHour = lon / 15;

    function calc(isSunrise) {
      const t = N + ((isSunrise ? 6 : 18) - lngHour) / 24;

      const M = (0.9856 * t) - 3.289;

      let L = M + (1.916 * Math.sin(degToRad(M))) + (0.020 * Math.sin(degToRad(2 * M))) + 282.634;
      L = (L % 360 + 360) % 360;

      let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
      RA = (RA % 360 + 360) % 360;

      const Lquadrant = Math.floor(L / 90) * 90;
      const RAquadrant = Math.floor(RA / 90) * 90;
      RA = RA + (Lquadrant - RAquadrant);
      RA = RA / 15;

      const sinDec = 0.39782 * Math.sin(degToRad(L));
      const cosDec = Math.cos(Math.asin(sinDec));

      const cosH =
        (Math.cos(degToRad(zenith)) - (sinDec * Math.sin(degToRad(lat)))) /
        (cosDec * Math.cos(degToRad(lat)));

      const safeCosH = clamp(cosH, -1, 1);

      let H = Math.acos(safeCosH);
      if (isSunrise) H = (2 * Math.PI) - H;
      H = radToDeg(H);
      H = H / 15;

      const T = H + RA - (0.06571 * t) - 6.622;

      let UT = T - lngHour;
      UT = (UT % 24 + 24) % 24;

      const tzOffsetMinutes = -dateObj.getTimezoneOffset();
      const localHours = UT + (tzOffsetMinutes / 60);
      const localHoursNorm = (localHours % 24 + 24) % 24;

      return Math.round(localHoursNorm * 60);
    }

    return { sunriseMinutes: calc(true), sunsetMinutes: calc(false) };
  }

  function formatMinutesTo12h(mins) {
    const h24 = Math.floor(mins / 60);
    const mm = mins % 60;

    let suffix = "AM";
    let h = h24;
    if (h >= 12) suffix = "PM";
    h = h % 12;
    if (h === 0) h = 12;

    return h + ":" + pad2(mm) + " " + suffix;
  }

  function drawSunInfoLine(geom, sunriseMinutes, sunsetMinutes, dayMode) {
    const centerX = geom.cx;
    const centerY = (geom.topY + geom.horizonY) / 2;

    const y = centerY + 52;

    const info =
      "Sunrise: " + formatMinutesTo12h(sunriseMinutes) +
      "  •  Sunset: " + formatMinutesTo12h(sunsetMinutes);

    p.noStroke();
    if (dayMode) p.fill(255, 255, 255, 160);
    else p.fill(0, 0, 0, 140);

    p.rect(p.width * 0.17, y - 14, p.width * 0.66, 28, 14);

    p.fill(dayMode ? 30 : 255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(13);
    p.text(info, centerX, y);
  }

  function computeDayModeFromSunTimes(sunriseMinutes, sunsetMinutes) {
    const currentMinutes = (p.hour() * 60) + p.minute();
    return (currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes);
  }

  // ====== Commit 10: tracker layout ======
  function formatHour12(h24) {
    let suffix = "AM";
    let h = h24;

    if (h >= 12) suffix = "PM";
    h = h % 12;
    if (h === 0) h = 12;

    return h + " " + suffix;
  }

  function formatRange12(startH, endH) {
    return formatHour12(startH) + " – " + formatHour12(endH);
  }

  function drawSchedulePanel(dayMode) {
    const panelX = p.width * 0.08;
    const panelY = p.height * 0.70;
    const panelW = p.width * 0.84;
    const panelH = p.height * 0.28;

    // Panel background
    p.noStroke();
    if (dayMode) p.fill(255, 255, 255, 170);
    else p.fill(0, 0, 0, 160);

    p.rect(panelX, panelY, panelW, panelH, 16);

    // Title
    p.fill(dayMode ? 30 : 255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("Today’s tracker", panelX + 14, panelY + 12);

    // Inner layout
    const innerX = panelX + 14;
    const innerY = panelY + 44;
    const innerW = panelW - 28;
    const innerH = panelH - 58;

    const minRowH = 22;
    const rowH = Math.max(minRowH, innerH / scheduleBlocks.length);

    // Rows
    for (let i = 0; i < scheduleBlocks.length; i++) {
      const b = scheduleBlocks[i];
      const y = innerY + i * rowH;

      if (y + rowH > panelY + panelH - 10) break;

      // light divider line
      p.noStroke();
      p.fill(dayMode ? 0 : 255, dayMode ? 0 : 255, dayMode ? 0 : 255, 35);
      p.rect(innerX, y + rowH - 2, innerW, 1);

      // time range column
      p.fill(dayMode ? 30 : 255);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      p.text(formatRange12(b.start, b.end), innerX + 10, y + rowH / 2);

      // label column
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      p.text("• " + b.label, innerX + 170, y + rowH / 2);
    }
  }

  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.mousePressed = function () {
    const inside =
      (p.mouseX >= geoButton.x && p.mouseX <= geoButton.x + geoButton.w &&
       p.mouseY >= geoButton.y && p.mouseY <= geoButton.y + geoButton.h);

    if (inside) requestGeolocation();
  };

  p.draw = function () {
    const now = new Date();
    const sunTimes = computeSunriseSunsetMinutes(userLat, userLon, now);
    const dayMode = computeDayModeFromSunTimes(sunTimes.sunriseMinutes, sunTimes.sunsetMinutes);

    drawSkyGradient(dayMode);
    drawStars(dayMode);

    const geom = drawArcAndHorizon();

    drawSunOrMoon(geom, dayMode);
    drawCenteredTimePill(geom, dayMode);

    drawGeoButton(dayMode);
    drawLocationLine(dayMode);

    drawSunInfoLine(geom, sunTimes.sunriseMinutes, sunTimes.sunsetMinutes, dayMode);

    // Commit 10: tracker layout panel
    drawSchedulePanel(dayMode);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
