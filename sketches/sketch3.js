// Instance-mode sketch for tab 3 (Clock B - build from scratch)
registerSketch('sk3', function (p) {
  const MAX_W = 800;
  const MAX_H = 800;

  // ====== Geolocation state ======
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

  // ====== Commit 12: editable schedule (stored in localStorage) ======
  const SCHEDULE_STORAGE_KEY = "sk3_schedule_v1";

  // Default schedule in MINUTES (more flexible than whole hours)
  const defaultScheduleBlocks = [
    { startMin: 0 * 60,  endMin: 7 * 60,  label: "Sleep" },
    { startMin: 7 * 60,  endMin: 8 * 60,  label: "Morning routine" },
    { startMin: 8 * 60,  endMin: 10 * 60, label: "Study / Deep work" },
    { startMin: 10 * 60, endMin: 12 * 60, label: "Class / Lecture" },
    { startMin: 12 * 60, endMin: 13 * 60, label: "Lunch" },
    { startMin: 13 * 60, endMin: 17 * 60, label: "Work block" },
    { startMin: 17 * 60, endMin: 18 * 60, label: "Gym / movement" },
    { startMin: 18 * 60, endMin: 20 * 60, label: "Dinner + friends" },
    { startMin: 20 * 60, endMin: 22 * 60, label: "Wind down" },
    { startMin: 22 * 60, endMin: 24 * 60, label: "Sleep prep" }
  ];

  // This is what we actually render/edit
  let scheduleBlocks = [];

  // Edit-mode UI state
  let isEditingSchedule = false;

  // Buttons inside the schedule panel (positions are computed each draw)
  let editButton = { x: 0, y: 0, w: 110, h: 28, isHover: false };
  let resetButton = { x: 0, y: 0, w: 110, h: 28, isHover: false };

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

  // ====== Time formatting helpers ======
  function pad2(n) {
    return (n < 10) ? ("0" + n) : ("" + n);
  }

  // 12h time string (HH:MM:SS AM/PM)
  function formatHMS12(h24, m, s) {
    let suffix = "AM";
    let h = h24;

    if (h >= 12) suffix = "PM";
    h = h % 12;
    if (h === 0) h = 12;

    return pad2(h) + ":" + pad2(m) + ":" + pad2(s) + " " + suffix;
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

    p.text(formatHMS12(h, m, s), centerX, centerY);
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

  // ====== Geolocation request ======
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

  // ====== Commit 12: Arc tick marks (sunrise / afternoon / sunset) ======
  function dayMinutesToArcAngle(mins) {
    const t = clamp(mins / (24 * 60), 0, 1);
    return p.lerp(p.PI, p.TWO_PI, t);
  }

  function drawTickAtMinutes(geom, mins, label, dayMode) {
    const a = dayMinutesToArcAngle(mins);

    const rx = geom.arcW / 2;
    const ry = geom.arcH / 2;

    // Point on the arc
    const x = geom.cx + rx * Math.cos(a);
    const y = geom.cy + ry * Math.sin(a);

    // Small tick line pointing inward
    const tickLen = 12;
    const dx = Math.cos(a);
    const dy = Math.sin(a);

    const x1 = x;
    const y1 = y;
    const x2 = x - dx * tickLen;
    const y2 = y - dy * tickLen;

    p.strokeWeight(3);

    // Keep tick readable in both modes
    if (dayMode) p.stroke(255, 255, 255, 200);
    else p.stroke(255, 255, 255, 220);

    p.line(x1, y1, x2, y2);

    // Label slightly above the tick (still along the arc)
    const labelOffset = 18;
    const lx = x - dx * (tickLen + labelOffset);
    const ly = y - dy * (tickLen + labelOffset);

    p.noStroke();
    p.fill(dayMode ? 255 : 255, dayMode ? 255 : 255, dayMode ? 255 : 255, dayMode ? 210 : 230);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(label, lx, ly);
  }

  function drawArcTimeTicks(geom, sunriseMinutes, sunsetMinutes, dayMode) {
    // "Afternoon" marker: 3:00 PM local time
    const afternoonMinutes = 15 * 60;

    drawTickAtMinutes(geom, sunriseMinutes, "Sunrise", dayMode);
    drawTickAtMinutes(geom, afternoonMinutes, "Afternoon", dayMode);
    drawTickAtMinutes(geom, sunsetMinutes, "Sunset", dayMode);
  }

  // ====== Tracker helpers ======
  function normalizeScheduleBlocks(blocks) {
    // Clean, clamp, sort
    let cleaned = [];

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      let s = Number(b.startMin);
      let e = Number(b.endMin);

      if (isNaN(s) || isNaN(e)) continue;

      s = clamp(Math.round(s), 0, 1440);
      e = clamp(Math.round(e), 0, 1440);

      if (e <= s) continue;

      const label = String(b.label || "").trim();
      cleaned.push({ startMin: s, endMin: e, label: label.length > 0 ? label : "Untitled" });
    }

    cleaned.sort(function (a, b) { return a.startMin - b.startMin; });

    // Limit to avoid clutter
    if (cleaned.length > 14) cleaned = cleaned.slice(0, 14);

    // If empty, fallback to default
    if (cleaned.length === 0) cleaned = defaultScheduleBlocks.slice();

    return cleaned;
  }

  function saveScheduleToStorage() {
    try {
      const payload = JSON.stringify(scheduleBlocks);
      window.localStorage.setItem(SCHEDULE_STORAGE_KEY, payload);
    } catch (e) {
      // If storage fails, just ignore (still works in-session)
    }
  }

  function loadScheduleFromStorageOrDefault() {
    try {
      const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (!raw) {
        scheduleBlocks = normalizeScheduleBlocks(defaultScheduleBlocks);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        scheduleBlocks = normalizeScheduleBlocks(defaultScheduleBlocks);
        return;
      }

      scheduleBlocks = normalizeScheduleBlocks(parsed);
    } catch (e) {
      scheduleBlocks = normalizeScheduleBlocks(defaultScheduleBlocks);
    }
  }

  function minutesNow() {
    return (p.hour() * 60) + p.minute();
  }

  function formatTime12FromMinutes(mins) {
    const m = clamp(Math.round(mins), 0, 1440);
    const h24 = Math.floor(m / 60) % 24;
    const mm = m % 60;

    let suffix = "AM";
    let h = h24;

    if (h >= 12) suffix = "PM";
    h = h % 12;
    if (h === 0) h = 12;

    return h + ":" + pad2(mm) + " " + suffix;
  }

  function formatRange12FromMinutes(startMin, endMin) {
    return formatTime12FromMinutes(startMin) + " – " + formatTime12FromMinutes(endMin);
  }

  // Determine which block is NOW and which is NEXT
  function getNowAndNextIndices() {
    const currentMinutes = minutesNow();

    let nowIndex = -1;

    for (let i = 0; i < scheduleBlocks.length; i++) {
      const b = scheduleBlocks[i];

      const inside = (currentMinutes >= b.startMin && currentMinutes < b.endMin);

      if (inside) {
        nowIndex = i;
        break;
      }
    }

    if (nowIndex === -1) nowIndex = 0;

    let nextIndex = nowIndex + 1;
    if (nextIndex >= scheduleBlocks.length) nextIndex = 0;

    return { nowIndex, nextIndex };
  }

  function parseTimeStringToMinutes(input) {
    // Accept:
    // - "7"  -> 07:00
    // - "7:30" -> 07:30
    // - "19" -> 19:00
    // - "19:15" -> 19:15
    if (input === null || input === undefined) return null;

    const str = String(input).trim();
    if (str.length === 0) return null;

    // If it's just a number
    if (str.indexOf(":") === -1) {
      const h = Number(str);
      if (isNaN(h)) return null;
      const hh = clamp(Math.floor(h), 0, 24);
      return hh * 60;
    }

    // Has colon
    const parts = str.split(":");
    if (parts.length !== 2) return null;

    const h = Number(parts[0]);
    const m = Number(parts[1]);

    if (isNaN(h) || isNaN(m)) return null;

    const hh = clamp(Math.floor(h), 0, 24);
    const mm = clamp(Math.floor(m), 0, 59);

    return (hh * 60) + mm;
  }

  function tryEditScheduleRow(rowIndex) {
    if (rowIndex < 0 || rowIndex >= scheduleBlocks.length) return;

    const b = scheduleBlocks[rowIndex];

    const newLabel = window.prompt("Edit label:", b.label);
    if (newLabel === null) return; // user canceled

    const startStr = window.prompt(
      "Start time (24h, like 7 or 7:30 or 19:15):",
      (Math.floor(b.startMin / 60)) + ":" + pad2(b.startMin % 60)
    );
    if (startStr === null) return;

    const endStr = window.prompt(
      "End time (24h, like 8 or 8:00 or 21:30):",
      (Math.floor(b.endMin / 60)) + ":" + pad2(b.endMin % 60)
    );
    if (endStr === null) return;

    const startMin = parseTimeStringToMinutes(startStr);
    const endMin = parseTimeStringToMinutes(endStr);

    if (startMin === null || endMin === null) return;

    scheduleBlocks[rowIndex] = {
      startMin: startMin,
      endMin: endMin,
      label: String(newLabel).trim()
    };

    scheduleBlocks = normalizeScheduleBlocks(scheduleBlocks);
    saveScheduleToStorage();
  }

  function resetScheduleToDefault() {
    scheduleBlocks = normalizeScheduleBlocks(defaultScheduleBlocks);
    saveScheduleToStorage();
  }

  function pointInRect(px, py, r) {
    return (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
  }

  function drawSmallButton(btn, text, dayMode) {
    btn.isHover = pointInRect(p.mouseX, p.mouseY, btn);

    p.noStroke();
    if (dayMode) p.fill(255, 255, 255, btn.isHover ? 235 : 200);
    else p.fill(0, 0, 0, btn.isHover ? 180 : 140);

    p.rect(btn.x, btn.y, btn.w, btn.h, 12);

    p.fill(dayMode ? 30 : 255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(text, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  // ====== Tracker panel ======
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

    // Buttons (top-right of panel)
    editButton.w = 120;
    editButton.h = 28;
    editButton.x = panelX + panelW - editButton.w - 14;
    editButton.y = panelY + 10;

    resetButton.w = 90;
    resetButton.h = 28;
    resetButton.x = editButton.x - resetButton.w - 10;
    resetButton.y = panelY + 10;

    drawSmallButton(resetButton, "Reset", dayMode);
    drawSmallButton(editButton, isEditingSchedule ? "Done" : "Edit", dayMode);

    if (isEditingSchedule) {
      p.fill(dayMode ? 30 : 255);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(12);
      p.text("Edit mode: click a row to change it", panelX + 14, panelY + 34);
    }

    // Inner layout
    const innerX = panelX + 14;
    const innerY = panelY + 50;
    const innerW = panelW - 28;
    const innerH = panelH - 64;

    const minRowH = 22;
    const rowH = Math.max(minRowH, innerH / scheduleBlocks.length);

    const indices = getNowAndNextIndices();

    // Rows
    for (let i = 0; i < scheduleBlocks.length; i++) {
      const b = scheduleBlocks[i];
      const y = innerY + i * rowH;

      if (y + rowH > panelY + panelH - 10) break;

      const isNow = (i === indices.nowIndex);
      const isNext = (i === indices.nextIndex);

      // Row background highlight (NOW / NEXT)
      if (isNow || isNext) {
        p.noStroke();

        if (dayMode) {
          if (isNow) p.fill(255, 255, 255, 235);
          else p.fill(255, 255, 255, 205);
        } else {
          if (isNow) p.fill(255, 255, 255, 75);
          else p.fill(255, 255, 255, 45);
        }

        p.rect(innerX, y + 2, innerW, rowH - 4, 10);

        // left accent bar
        if (dayMode) p.fill(40, 90, 160, 160);
        else p.fill(200, 220, 255, 170);

        p.rect(innerX + 4, y + 8, 6, rowH - 16, 4);
      }

      // Divider line
      p.noStroke();
      p.fill(dayMode ? 0 : 255, dayMode ? 0 : 255, dayMode ? 0 : 255, 35);
      p.rect(innerX, y + rowH - 2, innerW, 1);

      // time range column
      p.fill(dayMode ? 30 : 255);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(13);
      p.text(formatRange12FromMinutes(b.startMin, b.endMin), innerX + 14, y + rowH / 2);

      // label column
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(13);
      p.text("• " + b.label, innerX + 220, y + rowH / 2);

      // NOW / NEXT tag
      if (isNow || isNext) {
        const tagText = isNow ? "NOW" : "NEXT";

        const tagW = 52;
        const tagH = 18;
        const tagX = innerX + innerW - tagW - 10;
        const tagY = y + (rowH / 2) - (tagH / 2);

        p.noStroke();
        if (dayMode) p.fill(20, 35, 70, 170);
        else p.fill(0, 0, 0, 150);

        p.rect(tagX, tagY, tagW, tagH, 9);

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(11);
        p.text(tagText, tagX + tagW / 2, tagY + tagH / 2);
      }
    }

    // Return geometry so we can detect row clicks in mousePressed
    return { panelX, panelY, panelW, panelH, innerX, innerY, innerW, innerH, rowH };
  }

  // We'll store this each frame to use for click detection
  let schedulePanelGeom = null;

  // ====== p5 hooks ======
  p.setup = function () {
    const s = computeCanvasSize();
    p.createCanvas(s.w, s.h);
    p.textAlign(p.CENTER, p.CENTER);

    // Load user schedule (or default) once at startup
    loadScheduleFromStorageOrDefault();
  };

  p.mousePressed = function () {
    // Geo button
    const geoInside =
      (p.mouseX >= geoButton.x && p.mouseX <= geoButton.x + geoButton.w &&
       p.mouseY >= geoButton.y && p.mouseY <= geoButton.y + geoButton.h);

    if (geoInside) {
      requestGeolocation();
      return;
    }

    // Schedule buttons + row editing
    if (schedulePanelGeom !== null) {
      // Reset button
      if (pointInRect(p.mouseX, p.mouseY, resetButton)) {
        resetScheduleToDefault();
        return;
      }

      // Edit toggle button
      if (pointInRect(p.mouseX, p.mouseY, editButton)) {
        isEditingSchedule = !isEditingSchedule;
        return;
      }

      // If in edit mode, allow clicking a row to edit
      if (isEditingSchedule) {
        const g = schedulePanelGeom;

        const insideRows =
          (p.mouseX >= g.innerX && p.mouseX <= g.innerX + g.innerW &&
           p.mouseY >= g.innerY && p.mouseY <= g.innerY + g.innerH);

        if (insideRows) {
          const idx = Math.floor((p.mouseY - g.innerY) / g.rowH);
          if (idx >= 0 && idx < scheduleBlocks.length) {
            tryEditScheduleRow(idx);
          }
        }
      }
    }
  };

  p.draw = function () {
    const now = new Date();
    const sunTimes = computeSunriseSunsetMinutes(userLat, userLon, now);
    const dayMode = computeDayModeFromSunTimes(sunTimes.sunriseMinutes, sunTimes.sunsetMinutes);

    drawSkyGradient(dayMode);
    drawStars(dayMode);

    const geom = drawArcAndHorizon();

    // Commit 12: tick marks on the arc for sunrise / afternoon / sunset
    drawArcTimeTicks(geom, sunTimes.sunriseMinutes, sunTimes.sunsetMinutes, dayMode);

    drawSunOrMoon(geom, dayMode);
    drawCenteredTimePill(geom, dayMode);

    drawGeoButton(dayMode);
    drawLocationLine(dayMode);

    drawSunInfoLine(geom, sunTimes.sunriseMinutes, sunTimes.sunsetMinutes, dayMode);

    // Tracker panel (also updates geometry for row-click detection)
    schedulePanelGeom = drawSchedulePanel(dayMode);
  };

  p.windowResized = function () {
    const s = computeCanvasSize();
    p.resizeCanvas(s.w, s.h);
  };
});
