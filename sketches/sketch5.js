// HWK 5 — Narrative Visualization (STATIC-first Instagram-style + light hover)
// Chart: Cumulative share of TOTAL fantasy points by rank (within each position)
//
// Static story (IG screenshot-ready):
// - Small multiples (2x2) with consistent scales
// - Reference lines labeled (50% + starter cutoff)
// - Clear hierarchy: title → definition → takeaway → panels → footer
//
// Light interaction (meets “one-level” interactivity expectation):
// - Hover a panel to see player name, rank, fantasy points, and cumulative share.
//
// Press S to save PNG (capture with mouse off the chart for a clean static export).

registerSketch("sk5", function (p) {
  // ---------- Data files ----------
  const QB_PATH = "data/2025QB_season.csv";
  const RB_PATH = "data/2025RB_season.csv";
  const WR_PATH = "data/2025WR_season.csv";
  const TE_PATH = "data/2025TE_season.csv";

  let qbTable, rbTable, wrTable, teTable;

  // ---------- Canvas ----------
  const CANVAS_SIZE = 1180;
  let W = CANVAS_SIZE;
  let H = CANVAS_SIZE;

  // ---------- Settings ----------
  const MAX_RANK_SHOWN = 60;

  // Starter tier cutoffs (typical roster depth)
  const starterCutoff = { QB: 12, RB: 24, WR: 24, TE: 12 };

  // Update these once you confirm scoring + source
  const SCORING_LABEL = "Scoring: as provided in dataset";
  const SOURCE_LABEL = "Source: 2025 season totals dataset (see write-up)";

  // ---------- Color accents (subtle, not distracting) ----------
  const ACCENT = {
    RB: { r: 46, g: 160, b: 98 },   // green
    WR: { r: 52, g: 120, b: 246 },  // blue
    QB: { r: 146, g: 84, b: 200 },  // purple
    TE: { r: 242, g: 156, b: 60 }   // orange
  };

  function accent(pos, a) {
    const c = ACCENT[pos];
    return p.color(c.r, c.g, c.b, a);
  }

  // ---------- Data ----------
  let byPos = { QB: [], RB: [], WR: [], TE: [] };

  // Computed stats + series
  let stats = {
    QB: { totalSum: 1, topK: 12, shareTopK: 0, shownN: 0, cumShare: [], rankHalf: 0 },
    RB: { totalSum: 1, topK: 24, shareTopK: 0, shownN: 0, cumShare: [], rankHalf: 0 },
    WR: { totalSum: 1, topK: 24, shareTopK: 0, shownN: 0, cumShare: [], rankHalf: 0 },
    TE: { totalSum: 1, topK: 12, shareTopK: 0, shownN: 0, cumShare: [], rankHalf: 0 }
  };

  // Hover state for tooltip interaction
  let hover = {
    active: false,
    pos: "",
    panel: null,
    bounds: null,
    rank: 0,
    player: null,
    curveX: 0,
    curveY: 0,
    curveShare: 0
  };

  // ---------- Layout ----------
  const cardPad = 36;

  let header = {
    x: cardPad + 24,
    y: cardPad + 22
  };

  // Header height (leave room for definition + takeaway)
  const HEADER_BOTTOM_Y = cardPad + 356;

  let panelGrid = {
    x: cardPad + 36,
    y: HEADER_BOTTOM_Y,
    w: W - (cardPad + 36) * 2,
    h: (H - cardPad - 70) - HEADER_BOTTOM_Y - 18,
    gapX: 18,
    gapY: 18
  };

  let footer = {
    x: cardPad + 36,
    y: H - cardPad - 68
  };

  // ---------- preload ----------
  p.preload = function () {
    qbTable = p.loadTable(QB_PATH, "csv", "header");
    rbTable = p.loadTable(RB_PATH, "csv", "header");
    wrTable = p.loadTable(WR_PATH, "csv", "header");
    teTable = p.loadTable(TE_PATH, "csv", "header");
  };

  // ---------- Helpers ----------
  function toNum(val) {
    if (val === null || val === undefined) return NaN;
    const s = String(val).trim();
    if (s.length === 0) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function pct1(x) {
    return Math.round(x * 1000) / 10; // 1 decimal %
  }

  function fmtPoints(x) {
    const r = Math.round(x * 10) / 10;
    return String(r);
  }

  function clamp(val, lo, hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
  }

  function drawDashedLine(x1, y1, x2, y2, dashLen, gapLen) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.0001) return;

    const step = dashLen + gapLen;
    const steps = Math.floor(dist / step);

    const ux = dx / dist;
    const uy = dy / dist;

    for (let i = 0; i <= steps; i++) {
      const startD = i * step;
      const endD = Math.min(startD + dashLen, dist);

      const sx = x1 + ux * startD;
      const sy = y1 + uy * startD;
      const ex = x1 + ux * endD;
      const ey = y1 + uy * endD;

      p.line(sx, sy, ex, ey);
    }
  }

  function addFromTable(tbl, pos) {
    let temp = [];

    for (let r = 0; r < tbl.getRowCount(); r++) {
      const name = tbl.getString(r, "PlayerName");
      const team = tbl.getString(r, "Team");
      const points = toNum(tbl.getString(r, "TotalPoints"));

      if (!name || !Number.isFinite(points)) continue;
      if (points <= 0) continue;

      temp.push({
        name: name,
        team: team,
        pos: pos,
        points: points
      });
    }

    temp.sort((a, b) => b.points - a.points);
    byPos[pos] = temp;
  }

  function computeStatsForPos(pos) {
    const rows = byPos[pos];
    if (!rows || rows.length === 0) return;

    // TOTAL is computed over ALL players in the dataset at this position
    let totalSum = 0;
    for (let i = 0; i < rows.length; i++) totalSum += rows[i].points;
    if (totalSum <= 0) totalSum = 1;

    const K = Math.min(starterCutoff[pos], rows.length);
    const shownN = Math.min(MAX_RANK_SHOWN, rows.length);

    // Build cumulative share series (first shownN ranks), but share is of FULL totalSum
    let cum = 0;
    const cumShare = [];

    // Rank where we cross 50% (use full list for accuracy)
    let rankHalf = rows.length;
    let cumFull = 0;
    let foundHalf = false;

    for (let i = 0; i < rows.length; i++) {
      cumFull += rows[i].points;

      if (!foundHalf && (cumFull / totalSum) >= 0.5) {
        rankHalf = i + 1;
        foundHalf = true;
      }

      if (i < shownN) {
        cum += rows[i].points;
        cumShare.push(cum / totalSum);
      }
    }

    // Share for topK
    let sumTopK = 0;
    for (let i = 0; i < K; i++) sumTopK += rows[i].points;

    stats[pos].totalSum = totalSum;
    stats[pos].topK = K;
    stats[pos].shownN = shownN;
    stats[pos].cumShare = cumShare;
    stats[pos].shareTopK = sumTopK / totalSum;
    stats[pos].rankHalf = rankHalf;
  }

  // Reorder panels to emphasize the core comparison (RB vs WR) up top
  function panelForPos(pos) {
    const order = ["RB", "WR", "QB", "TE"];
    const idx = order.indexOf(pos);

    const wEach = (panelGrid.w - panelGrid.gapX) / 2;
    const hEach = (panelGrid.h - panelGrid.gapY) / 2;

    const row = Math.floor(idx / 2);
    const col = idx % 2;

    return {
      x: panelGrid.x + col * (wEach + panelGrid.gapX),
      y: panelGrid.y + row * (hEach + panelGrid.gapY),
      w: wEach,
      h: hEach,
      row: row,
      col: col
    };
  }

  function plotBounds(panel) {
    // Top padding creates an annotation band so text never overlaps the curve
    return {
      left: panel.x + 56,
      right: panel.x + panel.w - 18,
      top: panel.y + 98,
      bottom: panel.y + panel.h - 48
    };
  }

  function mapX(rank, bounds) {
    return p.map(rank, 1, MAX_RANK_SHOWN, bounds.left, bounds.right);
  }

  function mapY(share01, bounds) {
    return p.map(share01, 0, 1.02, bounds.bottom, bounds.top);
  }

  function invMapX(x, bounds) {
    return p.map(x, bounds.left, bounds.right, 1, MAX_RANK_SHOWN);
  }

  function pointForRank(pos, rank, bounds) {
    const series = stats[pos].cumShare;
    const idx = rank - 1;
    const yShare = series[idx];
    return {
      x: mapX(rank, bounds),
      y: mapY(yShare, bounds),
      share: yShare
    };
  }

  // ---------- Drawing ----------
  function drawCard() {
    // Slightly warmer background so it doesn’t feel stark
    p.background(248);

    // Soft shadow
    p.noStroke();
    p.fill(0, 14);
    p.rect(cardPad + 6, cardPad + 6, W - cardPad * 2, H - cardPad * 2, 26);

    // Card
    p.fill(255);
    p.rect(cardPad, cardPad, W - cardPad * 2, H - cardPad * 2, 26);
  }

  function drawTakeawayBox(x, y, w, lines) {
    const pad = 14;
    const lineH = 20;
    const h = pad * 2 + lines.length * lineH;

    p.noStroke();
    p.fill(250);
    p.rect(x, y, w, h, 14);

    p.stroke(230);
    p.strokeWeight(1);
    p.noFill();
    p.rect(x, y, w, h, 14);

    p.noStroke();
    p.fill(30);
    p.textAlign(p.LEFT, p.TOP);
    p.textStyle(p.BOLD);
    p.textSize(16);
    p.text("Draft takeaway", x + pad, y + pad - 2);

    p.textStyle(p.NORMAL);
    p.fill(80);
    p.textSize(14);

    for (let i = 0; i < lines.length; i++) {
      const yy = y + pad + 18 + i * lineH;
      p.text("• " + lines[i], x + pad, yy);
    }
  }

  function drawHeader() {
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);

    // Short + sweet title
    p.fill(20);
    p.textStyle(p.BOLD);
    p.textSize(45);
    p.text("Some Positions Are Star-Driven. Others Reward Depth.", header.x, header.y);

    p.textStyle(p.NORMAL);
    p.fill(90);
    p.textSize(20);
    p.text("2025 NFL fantasy • top 60 per position (ranked by total points)", header.x, header.y + 70);

    // Define cumulative share in plain English
    p.fill(65);
    p.textSize(18);
    p.text(
      "Cumulative share = % of ALL position points earned by the top N players.",
      header.x,
      header.y + 104
    );

    // Replace “concentrated production” wording with something obvious
    p.fill(65);
    p.textSize(18);
    p.text(
      "Steeper = a few stars score most points. Flatter = points are spread across more players.",
      header.x,
      header.y + 132
    );

    // Takeaway box uses computed values (always matches the data)
    const rbTop = stats.RB.topK;
    const rbShare = pct1(stats.RB.shareTopK);
    const wrRankHalf = stats.WR.rankHalf;

    const takeawayLines = [
      "RB: top " + rbTop + " already score about " + rbShare + "% of all RB points.",
      "WR: you need about rank " + wrRankHalf + " to reach half of WR points."
    ];

    drawTakeawayBox(header.x, header.y + 170, 760, takeawayLines);

    // Minimal note about the dark segment
    p.fill(120);
    p.textSize(14);
    p.text(
      "Accent line = starter tier (QB/TE 12, RB/WR 24). Hover a panel to see a player.",
      header.x,
      header.y + 274
    );
  }

  function drawPanelBase(panel, pos, title) {
    p.noStroke();
    p.fill(252);
    p.rect(panel.x, panel.y, panel.w, panel.h, 18);

    // Border
    p.noFill();
    p.stroke(215);
    p.strokeWeight(2);
    p.rect(panel.x, panel.y, panel.w, panel.h, 18);

    // Accent chip next to title (adds color without chaos)
    p.noStroke();
    p.fill(accent(pos, 255));
    p.rect(panel.x + 18, panel.y + 20, 10, 22, 6);

    // Title
    p.fill(25);
    p.textAlign(p.LEFT, p.TOP);
    p.textStyle(p.BOLD);
    p.textSize(22);
    p.text(title, panel.x + 36, panel.y + 14);
  }

  function drawAxes(panel, pos) {
    const b = plotBounds(panel);

    // Grid (quiet)
    p.stroke(238);
    p.strokeWeight(1);

    const yLevels = [0.0, 0.25, 0.5, 0.75, 1.0];
    for (let i = 0; i < yLevels.length; i++) {
      const y = mapY(yLevels[i], b);
      p.line(b.left, y, b.right, y);
    }

    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const x = p.lerp(b.left, b.right, t);
      p.line(x, b.top, x, b.bottom);
    }

    // 50% reference line (dashed, labeled)
    const y50 = mapY(0.5, b);
    p.stroke(175);
    p.strokeWeight(2);
    drawDashedLine(b.left, y50, b.right, y50, 8, 6);

    p.noStroke();
    p.fill(110);
    p.textStyle(p.NORMAL);
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text("Half of points (50%)", b.left + 6, y50 - 6);

    // X labels only on bottom row
    if (panel.row === 1) {
      p.fill(120);
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Rank 1", b.left, b.bottom + 10);

      p.textAlign(p.RIGHT, p.TOP);
      p.text("Rank " + MAX_RANK_SHOWN, b.right, b.bottom + 10);
    }

    // Y labels only on left column
    if (panel.col === 0) {
      p.fill(120);
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      p.text("100%", panel.x + 16, mapY(1.0, b));
      p.text("50%", panel.x + 16, mapY(0.5, b));
      p.text("0%", panel.x + 16, mapY(0.0, b));

      // Y-axis descriptor (clear + matches definition)
      p.fill(95);
      p.textSize(13);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Cumulative share of position points", panel.x + 16, panel.y + panel.h - 138);
    }
  }

  function drawCutoffGuides(panel, pos) {
    const b = plotBounds(panel);

    const K = stats[pos].topK;
    const shownN = stats[pos].shownN;
    if (shownN <= 0) return;

    const xK = mapX(K, b);

    const idx = Math.min(K, stats[pos].cumShare.length) - 1;
    const yShare = stats[pos].cumShare[Math.max(0, idx)];
    const yK = mapY(yShare, b);

    // Vertical cutoff
    p.stroke(160);
    p.strokeWeight(2);
    drawDashedLine(xK, b.top, xK, b.bottom, 8, 6);

    p.noStroke();
    p.fill(110);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(12);
    p.text("Starter cutoff", xK + 6, b.top + 6);

    // Horizontal guide to the curve point (helps read the share)
    p.stroke(205);
    p.strokeWeight(2);
    drawDashedLine(b.left, yK, xK, yK, 8, 6);

    // Panel annotation band
    p.noStroke();
    p.fill(35);
    p.textAlign(p.LEFT, p.TOP);
    p.textStyle(p.BOLD);
    p.textSize(14);

    const line1 = "Top " + K + " = " + pct1(stats[pos].shareTopK) + "% of " + pos + " points";
    p.text(line1, panel.x + 18, panel.y + 44);

    p.textStyle(p.NORMAL);
    p.fill(110);
    p.textSize(12);
    p.text("50% reached by rank " + stats[pos].rankHalf, panel.x + 18, panel.y + 64);
  }

  function drawDistribution(panel, pos) {
    const b = plotBounds(panel);
    const series = stats[pos].cumShare;
    const N = stats[pos].shownN;

    if (!series || N <= 1) return;

    const K = stats[pos].topK;
    const segN = Math.min(K, N);

    // Full curve (neutral gray)
    p.noFill();
    p.stroke(175);
    p.strokeWeight(2);

    p.beginShape();
    for (let i = 0; i < N; i++) {
      const rank = i + 1;
      p.vertex(mapX(rank, b), mapY(series[i], b));
    }
    p.endShape();

    // Starter-tier segment (accent color)
    p.stroke(accent(pos, 255));
    p.strokeWeight(5);

    p.beginShape();
    for (let i = 0; i < segN; i++) {
      const rank = i + 1;
      p.vertex(mapX(rank, b), mapY(series[i], b));
    }
    p.endShape();

    // Dot at cutoff intersection
    const idx = Math.min(segN, series.length) - 1;
    const xK = mapX(segN, b);
    const yK = mapY(series[Math.max(0, idx)], b);

    p.noStroke();
    p.fill(accent(pos, 255));
    p.circle(xK, yK, 9);
    p.fill(255);
    p.circle(xK, yK, 4);
  }

  function updateHoverState(posPanels) {
    hover.active = false;
    hover.pos = "";
    hover.panel = null;
    hover.bounds = null;
    hover.rank = 0;
    hover.player = null;

    for (let i = 0; i < posPanels.length; i++) {
      const pos = posPanels[i].pos;
      const panel = posPanels[i].panel;
      const b = plotBounds(panel);

      // Only hover inside plot region
      if (p.mouseX >= b.left && p.mouseX <= b.right && p.mouseY >= b.top && p.mouseY <= b.bottom) {
        const rows = byPos[pos];
        const shownN = stats[pos].shownN;
        if (!rows || shownN <= 0) return;

        let rankFloat = invMapX(p.mouseX, b);
        let rank = Math.round(rankFloat);
        rank = clamp(rank, 1, shownN);

        const player = rows[rank - 1];
        if (!player) return;

        const pt = pointForRank(pos, rank, b);

        hover.active = true;
        hover.pos = pos;
        hover.panel = panel;
        hover.bounds = b;
        hover.rank = rank;
        hover.player = player;
        hover.curveX = pt.x;
        hover.curveY = pt.y;
        hover.curveShare = pt.share;

        return;
      }
    }
  }

  function drawHoverGuide() {
    if (!hover.active || !hover.bounds) return;

    const b = hover.bounds;

    // Vertical guide
    p.stroke(215);
    p.strokeWeight(1);
    drawDashedLine(hover.curveX, b.top, hover.curveX, b.bottom, 6, 6);

    // Highlight dot
    p.noStroke();
    p.fill(accent(hover.pos, 255));
    p.circle(hover.curveX, hover.curveY, 10);
    p.fill(255);
    p.circle(hover.curveX, hover.curveY, 4);
  }

  function drawTooltip() {
    if (!hover.active || !hover.player) return;

    const player = hover.player;

    const line1 = player.name + (player.team ? " • " + player.team : "");
    const line2 = hover.pos + " rank #" + hover.rank;
    const line3 = "Fantasy points: " + fmtPoints(player.points);
    const line4 = "Cumulative share: " + pct1(hover.curveShare) + "%";

    const lines = [line1, line2, line3, line4];

    p.textSize(14);
    p.textStyle(p.NORMAL);

    let maxW = 0;
    for (let i = 0; i < lines.length; i++) {
      maxW = Math.max(maxW, p.textWidth(lines[i]));
    }

    const pad = 10;
    const boxW = maxW + pad * 2;
    const boxH = 14 * lines.length + pad * 2 + 6;

    let tx = p.mouseX + 14;
    let ty = p.mouseY + 14;

    const minX = cardPad + 12;
    const maxX = W - cardPad - 12 - boxW;
    const minY = cardPad + 12;
    const maxY = H - cardPad - 12 - boxH;

    tx = clamp(tx, minX, maxX);
    ty = clamp(ty, minY, maxY);

    // Tooltip background
    p.noStroke();
    p.fill(255);
    p.rect(tx, ty, boxW, boxH, 10);

    // Accent border
    p.stroke(accent(hover.pos, 180));
    p.strokeWeight(2);
    p.noFill();
    p.rect(tx, ty, boxW, boxH, 10);

    // Text
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);

    p.fill(25);
    p.textStyle(p.BOLD);
    p.text(line1, tx + pad, ty + pad);

    p.textStyle(p.NORMAL);
    p.fill(70);
    p.text(line2, tx + pad, ty + pad + 18);

    p.fill(45);
    p.text(line3, tx + pad, ty + pad + 36);

    p.fill(90);
    p.text(line4, tx + pad, ty + pad + 54);
  }

  function drawFooter() {
    p.noStroke();
    p.fill(120);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(13);

    p.text(
      "Totals computed over the full position player pool; chart displays top 60 by points. " +
      SCORING_LABEL + " • " + SOURCE_LABEL,
      footer.x,
      footer.y
    );

    p.textAlign(p.RIGHT, p.TOP);
    p.text("INFO 474 • HWK 5", W - cardPad - 36, footer.y);
  }

  // ---------- p5 lifecycle ----------
  p.setup = function () {
    const container = document.getElementById("sketch-container-sk5");
    const cnv = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);

    if (container) {
      cnv.parent(container);
      cnv.style("display", "block");
      cnv.style("margin", "0 auto");
      cnv.style("width", "100%");
      cnv.style("max-width", CANVAS_SIZE + "px");
      cnv.style("height", "auto");
    }

    p.pixelDensity(2);
    p.textFont("Georgia, 'Times New Roman', serif");

    addFromTable(qbTable, "QB");
    addFromTable(rbTable, "RB");
    addFromTable(wrTable, "WR");
    addFromTable(teTable, "TE");

    computeStatsForPos("QB");
    computeStatsForPos("RB");
    computeStatsForPos("WR");
    computeStatsForPos("TE");
  };

  p.draw = function () {
    drawCard();
    drawHeader();

    const panels = [
      { pos: "RB", title: "RB (Running backs)" },
      { pos: "WR", title: "WR (Wide receivers)" },
      { pos: "QB", title: "QB (Quarterbacks)" },
      { pos: "TE", title: "TE (Tight ends)" }
    ];

    // Precompute panel rects so hover can reference them
    let posPanels = [];
    for (let i = 0; i < panels.length; i++) {
      const pos = panels[i].pos;
      const panel = panelForPos(pos);
      posPanels.push({ pos: pos, panel: panel, title: panels[i].title });
    }

    // Draw panels
    for (let i = 0; i < posPanels.length; i++) {
      const pos = posPanels[i].pos;
      const panel = posPanels[i].panel;

      drawPanelBase(panel, pos, posPanels[i].title);
      drawAxes(panel, pos);
      drawDistribution(panel, pos);
      drawCutoffGuides(panel, pos);
    }

    // Hover overlays
    updateHoverState(posPanels);
    drawHoverGuide();
    drawTooltip();

    drawFooter();
  };

  p.keyPressed = function () {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("hwk5_cumulative_share_rb_wr_depth", "png");
    }
  };
});
