/* ============================================================
   Wireless Sensing Security — interactions
   ============================================================ */
(function () {
  "use strict";

  var PAPERS = (window.WSS_PAPERS || []).slice();
  var ROLE = {
    1: { key: "v", name: "Victims", color: "#2f6fb3" },
    2: { key: "w", name: "Weapons", color: "#c0392b" },
    3: { key: "s", name: "Shields", color: "#2f8f5b" }
  };

  /* ---------- Unified-model component details ---------- */
  var COMP = {
    x: {
      title: "x(t) — the transmitted signal (Source)",
      sym: "x(t)",
      body: "The probing signal a system emits — a WiFi packet, an FMCW chirp, an acoustic tone. Whoever controls or forges x(t) controls what the world appears to reflect.",
      roles: [["v", "Jamming & spoofing the source"], ["w", "Injecting malicious probing signals"], ["s", "Controlled active sensing for liveness"]]
    },
    h: {
      title: "hᵢ — the channel transformation (Propagation)",
      sym: "hᵢ(·)",
      body: "How the i-th scattering target reshapes the signal as it propagates — multipath, reflection, attenuation. Reconfigurable surfaces (RIS) make this layer programmable, for attack and defense alike.",
      roles: [["v", "Channel manipulation attacks"], ["w", "Exploiting penetration / leakage paths"], ["s", "RIS & PLS channel shaping for protection"]]
    },
    theta: {
      title: "Θᵢ — the target parameters (Information)",
      sym: "Θᵢ",
      body: "The quantities sensing actually wants: range, velocity, angle, micro-Doppler, RCS. This is where private information lives — and where adversarial perturbations bite.",
      roles: [["v", "Static / dynamic / adversarial target attacks"], ["w", "Estimating sensitive Θᵢ to eavesdrop"], ["s", "Biometric uniqueness in Θᵢ"]]
    },
    n: {
      title: "n(t) — noise & interference (Environment)",
      sym: "n(t)",
      body: "Everything that is not signal. Attackers drown estimation in noise; defenders inject artificial noise as Physical-Layer Security to deny eavesdroppers a clean read.",
      roles: [["v", "Noise injection / jamming"], ["w", "Side-channel emissions as a covert n(t)"], ["s", "Artificial-noise physical-layer security"]]
    },
    y: {
      title: "y(t) — the received measurement (Observation)",
      sym: "y(t)",
      body: "What the receiver actually captures — the sum of all channel transformations plus noise. Every attack and every defense ultimately shows up as a manipulation of, or inference from, y(t).",
      roles: [["v", "Corrupted observation → wrong Θᵢ"], ["w", "Captured y(t) leaks sensitive Θᵢ"], ["s", "Robust estimation of Θᵢ from y(t)"]]
    }
  };

  function renderComp(which) {
    var c = COMP[which];
    if (!c) return;
    var det = document.getElementById("compDetail");
    var rolesHtml = c.roles.map(function (r) {
      return '<span class="cd-role ' + r[0] + '">' + r[1] + "</span>";
    }).join("");
    det.style.borderLeftColor = ({ x: "#2f6fb3", h: "#2f8f5b", theta: "#7a4fb0", n: "#c0392b", y: "#16181d" })[which];
    det.innerHTML =
      '<h4><span class="cd-sym">' + c.sym + "</span>" + c.title.replace(/^[^—]+— /, "") + "</h4>" +
      "<p>" + c.body + "</p>" +
      '<div class="cd-roles">' + rolesHtml + "</div>";
    var all = document.querySelectorAll("[data-comp]");
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle("on", all[i].getAttribute("data-comp") === which);
    }
  }
  document.querySelectorAll("[data-comp]").forEach(function (el) {
    el.addEventListener("click", function () { renderComp(el.getAttribute("data-comp")); });
  });
  renderComp("theta");

  /* ---------- Taxonomy ---------- */
  var TAX = [
    {
      cls: "tax-victim", emoji: "🎯", sec: "Section IV", name: "Victims",
      groups: [
        { q: "Attacks on sensing targets", desc: "Manipulating the target's reflected characteristics (Θᵢ).", items: ["Static attacks — meta-material tags, absorbers, passive reflectors", "Dynamic attacks — time-varying modulation of the echo", "Adversarial examples against deep sensing models"] },
        { q: "Attacks on sensing sources", desc: "Corrupting the probing signal x(t) itself.", items: ["Jamming — overwhelming the receiver", "Spoofing — injecting forged echoes", "Adversarial signal crafting"] },
        { q: "Attacks on sensing channels", desc: "Tampering with propagation hᵢ.", items: ["Attacks on communication channels", "Attacks on sensing channels (e.g. RIS-based)"] },
        { q: "Defense strategies", desc: "Hardening the victim system.", items: ["Robustness & adversarial training", "Anomaly & attack detection", "Physical-layer resilience"] }
      ]
    },
    {
      cls: "tax-weapon", emoji: "⚔️", sec: "Section V", name: "Weapons",
      groups: [
        { q: "Active attacks", desc: "The attacker emits signals to probe or interfere.", items: ["Vibration-based eavesdropping (mmWave / acoustic)", "EMI-based device control & injection", "Channel-manipulation interruption"] },
        { q: "Passive attacks", desc: "The attacker only listens to leakage.", items: ["Device-leakage eavesdropping (EM, magnetic, power, optical)", "Protocol-signal eavesdropping (WiFi CSI / BFI, traffic)"] },
        { q: "Defense strategies", desc: "Countering signal weaponization.", items: ["Physical-layer defenses", "Application-layer defenses"] }
      ]
    },
    {
      cls: "tax-shield", emoji: "🛡️", sec: "Section VI", name: "Shields",
      groups: [
        { q: "Human identification & authentication", desc: "Who is this person?", items: ["Gait-based I&A", "Voice-based I&A", "Face-based I&A", "Vital-sign-based I&A"] },
        { q: "Device authenticity verification", desc: "Is this device / media genuine?", items: ["Device fingerprint identification (RF fingerprinting)", "Media authenticity verification"] },
        { q: "Privacy protection", desc: "Detecting and blocking privacy threats.", items: ["Privacy threat detection (hidden cameras, spy sensors)", "Privacy data protection (RIS / PLS shaping)"] }
      ]
    }
  ];

  function buildTaxonomy() {
    var root = document.getElementById("taxCols");
    TAX.forEach(function (col) {
      var el = document.createElement("div");
      el.className = "tax-col " + col.cls;
      var groupsHtml = col.groups.map(function (g) {
        var items = g.items.map(function (it) { return "<li>" + it + "</li>"; }).join("");
        return '<div class="tax-group">' +
          '<button class="tax-q" type="button">' + g.q + '<span class="tax-toggle">+</span></button>' +
          '<div class="tax-a"><div class="tax-a-inner"><p class="tax-desc">' + g.desc + "</p><ul>" + items + "</ul></div></div>" +
          "</div>";
      }).join("");
      el.innerHTML =
        '<div class="tax-col-head"><span class="tax-emoji">' + col.emoji + "</span>" +
        "<div><span class='tax-sec'>" + col.sec + "</span><h3>" + col.name + "</h3></div></div>" +
        groupsHtml;
      root.appendChild(el);
    });
    root.querySelectorAll(".tax-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ans = btn.nextElementSibling;
        var open = btn.classList.toggle("open");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0";
      });
    });
  }
  buildTaxonomy();

  /* ---------- Explorer ---------- */
  var state = { cat: "all", venue: "all", rel: 1, yearFrom: 2004, yearTo: 2024, q: "", sort: "year-desc" };

  // dynamic role counts on the chips
  [1, 2, 3].forEach(function (c) {
    var el = document.getElementById("cnt" + c);
    if (el) el.textContent = PAPERS.filter(function (p) { return p.category === c; }).length;
  });
  var allEl = document.getElementById("cntAll");
  if (allEl) allEl.textContent = PAPERS.length;

  var venueSelect = document.getElementById("venueSelect");
  var venues = {};
  PAPERS.forEach(function (p) { venues[p.venue] = (venues[p.venue] || 0) + 1; });
  Object.keys(venues).sort(function (a, b) { return venues[b] - venues[a]; }).forEach(function (v) {
    var o = document.createElement("option");
    o.value = v; o.textContent = v + " (" + venues[v] + ")";
    venueSelect.appendChild(o);
  });

  function filtered() {
    var q = state.q.toLowerCase();
    var rows = PAPERS.filter(function (p) {
      if (state.cat !== "all" && p.category !== +state.cat) return false;
      if (state.venue !== "all" && p.venue !== state.venue) return false;
      if (p.relevance < state.rel) return false;
      if (p.year < state.yearFrom || p.year > state.yearTo) return false;
      if (q && p.title.toLowerCase().indexOf(q) === -1 && p.venue.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var s = state.sort;
    rows.sort(function (a, b) {
      if (s === "year-desc") return b.year - a.year || b.relevance - a.relevance;
      if (s === "year-asc") return a.year - b.year || b.relevance - a.relevance;
      if (s === "rel-desc") return b.relevance - a.relevance || b.year - a.year;
      if (s === "title-asc") return a.title.localeCompare(b.title);
      if (s === "venue-asc") return a.venue.localeCompare(b.venue) || b.year - a.year;
      return 0;
    });
    return rows;
  }

  function renderTable() {
    var rows = filtered();
    var body = document.getElementById("paperBody");
    var empty = document.getElementById("emptyState");
    var count = document.getElementById("resultCount");
    count.textContent = rows.length + " of " + PAPERS.length + " papers";
    empty.hidden = rows.length !== 0;

    var sc = document.getElementById("sumCounts");
    if (sc) {
      var by = { 1: 0, 2: 0, 3: 0 };
      rows.forEach(function (p) { by[p.category]++; });
      sc.innerHTML =
        '<span class="sum-pill v"><span class="dot"></span>' + by[1] + " Victims</span>" +
        '<span class="sum-pill w"><span class="dot"></span>' + by[2] + " Weapons</span>" +
        '<span class="sum-pill s"><span class="dot"></span>' + by[3] + " Shields</span>";
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i], r = ROLE[p.category];
      html +=
        "<tr>" +
        '<td class="td-year">' + p.year + "</td>" +
        '<td class="td-venue">' + esc(p.venue) + "</td>" +
        '<td class="td-title">' + esc(p.title) + "</td>" +
        '<td><span class="role-pill ' + r.key + '"><span class="dot"></span>' + r.name.slice(0, -1) + "</span></td>" +
        '<td class="col-rel"><span class="rel-badge rel-' + p.relevance + '">' + p.relevance + "</span></td>" +
        "</tr>";
    }
    body.innerHTML = html;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }

  // controls
  document.getElementById("searchInput").addEventListener("input", function (e) { state.q = e.target.value; renderTable(); });
  document.getElementById("venueSelect").addEventListener("change", function (e) { state.venue = e.target.value; renderTable(); });
  document.getElementById("relSelect").addEventListener("change", function (e) { state.rel = +e.target.value; renderTable(); });
  document.getElementById("sortSelect").addEventListener("change", function (e) { state.sort = e.target.value; syncSortHeaders(); renderTable(); });
  var yearFrom = document.getElementById("yearFrom");
  var yearTo = document.getElementById("yearTo");
  yearFrom.addEventListener("input", function () {
    state.yearFrom = +yearFrom.value;
    if (state.yearFrom > state.yearTo) { state.yearTo = state.yearFrom; yearTo.value = yearFrom.value; document.getElementById("yearToVal").textContent = yearTo.value; }
    document.getElementById("yearFromVal").textContent = yearFrom.value; renderTable();
  });
  yearTo.addEventListener("input", function () {
    state.yearTo = +yearTo.value;
    if (state.yearTo < state.yearFrom) { state.yearFrom = state.yearTo; yearFrom.value = yearTo.value; document.getElementById("yearFromVal").textContent = yearFrom.value; }
    document.getElementById("yearToVal").textContent = yearTo.value; renderTable();
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    state = { cat: "all", venue: "all", rel: 1, yearFrom: 2004, yearTo: 2024, q: "", sort: "year-desc" };
    document.getElementById("searchInput").value = "";
    document.getElementById("venueSelect").value = "all";
    document.getElementById("relSelect").value = "1";
    document.getElementById("sortSelect").value = "year-desc";
    yearFrom.value = 2004; yearTo.value = 2024;
    document.getElementById("yearFromVal").textContent = "2004";
    document.getElementById("yearToVal").textContent = "2024";
    document.querySelectorAll("#catChips .chip").forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-cat") === "all");
    });
    syncSortHeaders(); renderTable();
  });
  document.querySelectorAll("#catChips .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll("#catChips .chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      state.cat = chip.getAttribute("data-cat");
      renderTable();
    });
  });
  // header sort
  document.querySelectorAll(".paper-table th.sortable").forEach(function (th) {
    th.addEventListener("click", function () {
      var k = th.getAttribute("data-sort");
      var map = { year: "year-desc", relevance: "rel-desc", title: "title-asc", venue: "year-desc" };
      if (k === "year") state.sort = state.sort === "year-desc" ? "year-asc" : "year-desc";
      else if (k === "relevance") state.sort = "rel-desc";
      else if (k === "title") state.sort = "title-asc";
      document.getElementById("sortSelect").value = ["year-desc","year-asc","rel-desc","title-asc"].indexOf(state.sort) >= 0 ? state.sort : "year-desc";
      syncSortHeaders(); renderTable();
    });
  });
  function syncSortHeaders() {
    document.querySelectorAll(".paper-table th.sortable").forEach(function (th) {
      th.classList.remove("sorted", "asc");
      var k = th.getAttribute("data-sort");
      if (state.sort.indexOf(k === "relevance" ? "rel" : k) === 0) {
        th.classList.add("sorted");
        if (state.sort.indexOf("asc") >= 0) th.classList.add("asc");
      }
    });
  }

  // Jump from role cards / chips
  document.querySelectorAll(".role-explore").forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.getAttribute("data-cat");
      document.querySelectorAll("#catChips .chip").forEach(function (c) {
        c.classList.toggle("active", c.getAttribute("data-cat") === cat);
      });
      state.cat = cat; renderTable();
      document.getElementById("explorer").scrollIntoView({ behavior: "smooth" });
    });
  });

  syncSortHeaders();
  renderTable();

  /* ---------- Charts ---------- */
  function buildCharts() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.color = "#6b7280";
    Chart.defaults.font.size = 12;

    var years = [];
    for (var y = 2004; y <= 2024; y++) years.push(y);
    function perYear(cat) {
      return years.map(function (yr) {
        return PAPERS.filter(function (p) { return p.year === yr && p.category === cat; }).length;
      });
    }
    var v = perYear(1), w = perYear(2), s = perYear(3);

    // 1. Stacked bar per year
    new Chart(document.getElementById("chartYear"), {
      type: "bar",
      data: {
        labels: years,
        datasets: [
          { label: "Victims", data: v, backgroundColor: "#2f6fb3" },
          { label: "Weapons", data: w, backgroundColor: "#c0392b" },
          { label: "Shields", data: s, backgroundColor: "#2f8f5b" }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: "#eef0f3" }, title: { display: true, text: "Papers" } }
        }
      }
    });

    // 2. Cumulative line
    function cum(arr) { var t = 0; return arr.map(function (n) { return t += n; }); }
    new Chart(document.getElementById("chartCumulative"), {
      type: "line",
      data: {
        labels: years,
        datasets: [
          { label: "Victims", data: cum(v), borderColor: "#2f6fb3", backgroundColor: "rgba(47,111,179,.08)", fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
          { label: "Weapons", data: cum(w), borderColor: "#c0392b", backgroundColor: "rgba(192,57,43,.08)", fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
          { label: "Shields", data: cum(s), borderColor: "#2f8f5b", backgroundColor: "rgba(47,143,91,.08)", fill: true, tension: .35, pointRadius: 0, borderWidth: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: "#eef0f3" } } }
      }
    });

    // 3. Role doughnut
    var totals = [1, 2, 3].map(function (c) { return PAPERS.filter(function (p) { return p.category === c; }).length; });
    new Chart(document.getElementById("chartRole"), {
      type: "doughnut",
      data: {
        labels: ["Victims", "Weapons", "Shields"],
        datasets: [{ data: totals, backgroundColor: ["#2f6fb3", "#c0392b", "#2f8f5b"], borderWidth: 2, borderColor: "#fff" }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } }
      }
    });

    // 4. Top venues horizontal bar
    var vc = {};
    PAPERS.forEach(function (p) { vc[p.venue] = (vc[p.venue] || 0) + 1; });
    var top = Object.keys(vc).sort(function (a, b) { return vc[b] - vc[a]; }).slice(0, 12);
    new Chart(document.getElementById("chartVenue"), {
      type: "bar",
      data: {
        labels: top,
        datasets: [{
          label: "Papers", data: top.map(function (t) { return vc[t]; }),
          backgroundColor: "#3a4658", borderRadius: 5
        }]
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: "#eef0f3" }, beginAtZero: true }, y: { grid: { display: false } } }
      }
    });
  }
  buildCharts();

  /* ---------- Misc UX ---------- */
  // copy bibtex
  document.getElementById("copyBib").addEventListener("click", function () {
    var btn = this;
    var txt = document.getElementById("bibtex").innerText;
    navigator.clipboard.writeText(txt).then(function () {
      btn.textContent = "Copied!"; btn.classList.add("copied");
      setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1800);
    });
  });

  // back to top
  var toTop = document.getElementById("toTop");
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("show", window.scrollY > 700);
  });
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  // count-up hero stat
  var stat = document.querySelector(".stat-num[data-count]");
  if (stat) {
    var target = +stat.getAttribute("data-count"), cur = 0, step = Math.ceil(target / 40);
    var iv = setInterval(function () {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(iv); stat.textContent = target + "+"; }
      else stat.textContent = cur + "";
    }, 22);
  }

  // active nav link on scroll
  var navLinks = document.querySelectorAll(".nav-links a");
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  window.addEventListener("scroll", function () {
    var pos = window.scrollY + 120, idx = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].offsetTop <= pos) idx = i;
    }
    navLinks.forEach(function (a, i) { a.style.color = i === idx ? "var(--ink)" : ""; });
  });
})();
