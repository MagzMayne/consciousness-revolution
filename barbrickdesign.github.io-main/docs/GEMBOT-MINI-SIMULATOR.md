<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Honeypot Web Archive — Distributed IP Scanner (🐝✨)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="Mobile-optimized honeypot viewer with glowing bees, distributed safe probes, live logging, compression, and progress tracking." />
  <meta name="keywords" content="honeypot, web archive, crawler, distributed, preservation, SEO, IP scanner" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Agent R" />
  <style>
    :root {
      --bg:#0b0f14; --panel:#11161e; --text:#e5e7eb; --muted:#9ca3af;
      --accent:#f59e0b; --accent2:#60a5fa; --border:#1f2937; --good:#34d399; --bad:#f87171;
      --mono: ui-monospace, Menlo, Consolas, Monaco, monospace;
    }
    * { box-sizing: border-box }
    body { margin:0; background: radial-gradient(900px 500px at 60% -200px, rgba(245,158,11,0.12), transparent 70%), var(--bg); color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; line-height:1.55 }
    header { padding:18px 16px; background:linear-gradient(180deg, rgba(96,165,250,0.10), rgba(245,158,11,0.10)); border-bottom:1px solid var(--border) }
    h1 { margin:0; font-size:1.25rem }
    header p { margin:6px 0 0; color:var(--muted); font-size:0.9rem }
    main { max-width:1100px; margin:0 auto; padding:16px }
    section { margin-bottom:16px }
    .panel { background:#0d1218; border:1px solid var(--border); border-radius:12px; padding:12px }
    label { display:block; font-size:0.85rem; color:var(--muted); margin-bottom:6px }
    textarea, input, select {
      width:100%; padding:12px; background:#0b1218; border:1px solid var(--border); border-radius:10px; color:var(--text);
    }
    .row { display:grid; grid-template-columns:1fr 1fr; gap:10px }
    .toolbar { display:flex; gap:8px; flex-wrap:wrap }
    button {
      padding:10px 14px; border:1px solid var(--border); border-radius:10px; color:#111; font-weight:700; cursor:pointer;
      background: linear-gradient(180deg, rgba(245,158,11,0.85), rgba(96,165,250,0.85));
    }
    button.secondary { background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08)); color:var(--text) }
    button.danger { background: linear-gradient(180deg, rgba(248,113,113,0.85), rgba(220,38,38,0.85)); color:#fff }
    button:disabled { opacity:0.6; cursor:not-allowed }
    a { color:var(--accent2); text-decoration:none }
    a:hover { text-decoration:underline }
    .statusbar { display:flex; gap:10px; flex-wrap:wrap; font-size:0.85rem; color:var(--muted); margin-top:8px }
    .tag { border:1px solid var(--border); border-radius:999px; padding:2px 8px; font-size:0.8rem; background:#0b1218 }
    #log { max-height:220px; overflow:auto; font-family:var(--mono); font-size:12px; background:#0b1218; border:1px solid var(--border); border-radius:10px; padding:10px }
    table { width:100%; border-collapse:collapse; font-size:0.9rem }
    th, td { border-bottom:1px solid var(--border); padding:8px 6px; vertical-align:top }
    pre { background:#0b1218; border:1px solid var(--border); border-radius:10px; padding:10px; overflow:auto; font-family:var(--mono); font-size:12px }
    .progressWrap { display:flex; align-items:center; gap:10px; margin-top:8px }
    .progressBar { width:100%; height:14px; background:#11161e; border:1px solid var(--border); border-radius:999px; overflow:hidden }
    .progressFill { height:100%; width:0%; background:linear-gradient(90deg, #f59e0b, #60a5fa); transition: width 0.2s ease }
    .legend { display:flex; gap:14px; flex-wrap:wrap; font-size:0.85rem; color:var(--muted) }
    .beeField { position:relative; height:120px; margin-bottom:10px; background: radial-gradient(600px 200px at 50% 10%, rgba(245,158,11,0.15), transparent 70%); border:1px dashed rgba(245,158,11,0.25); border-radius:12px; overflow:hidden }
    .honeypot { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:28px; filter:drop-shadow(0 0 8px rgba(245,158,11,0.8)) }
    .bee { position:absolute; font-size:22px; filter:drop-shadow(0 0 6px rgba(245,158,11,0.8)); animation: hover 5s ease-in-out infinite }
    @keyframes hover {
      0% { transform: translateY(0) }
      50% { transform: translateY(-10px) }
      100% { transform: translateY(0) }
    }
    .small { font-size:0.8rem; color:var(--muted) }
    @media (min-width: 768px) { .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px } button { width:auto } }
  </style>
</head>
<body>
  <header>
    <h1>Honeypot Web Archive (🐝✨)</h1>
    <p>Distributed safe probes with glowing bees, live logging, compression, and progress tracking.</p>
  </header>

  <main>
    <!-- Bees and Honeypot Scene -->
    <section class="panel">
      <div class="beeField" id="beeField" aria-hidden="true">
        <div class="honeypot">🍯</div>
        <!-- Bees injected dynamically -->
      </div>
      <div class="legend">
        <div>🐝 Glowing bees represent active workers.</div>
        <div>🍯 Honeypot is the archive collector.</div>
      </div>
    </section>

    <!-- Configuration -->
    <section class="panel">
      <h2>Configuration</h2>
      <div class="row">
        <div>
          <label>IP block (CIDR)</label>
          <input id="cidr" type="text" value="1.1.1.0/24" />
        </div>
        <div>
          <label>Recursive depth (same-origin links)</label>
          <input id="depth" type="number" value="0" min="0" max="3" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Per-request timeout (ms)</label>
          <input id="timeout" type="number" value="7000" min="1000" />
        </div>
        <div>
          <label>Concurrent workers</label>
          <input id="workers" type="number" value="3" min="1" max="12" />
        </div>
      </div>
      <div class="toolbar" style="margin-top:8px">
        <button id="startBtn">Start</button>
        <button id="stopBtn" class="danger" disabled>Stop</button>
        <button id="clearBtn" class="secondary">Clear</button>
        <button id="exportJsonBtn" class="secondary">Export JSON</button>
        <button id="exportCompressedBtn" class="secondary">Export compressed (.lz)</button>
        <button id="exportIndexBtn" class="secondary">Export index.html</button>
        <button id="importBtn" class="secondary">Import archive (.lz/.json)</button>
        <input type="file" id="fileInput" style="display:none" accept=".lz,.json" />
      </div>
      <div class="statusbar">
        <div><span class="tag">Status</span> <span id="statusText">Idle</span></div>
        <div><span class="tag">Records</span> <span id="countText">0</span></div>
        <div><span class="tag">Errors</span> <span id="errorText">0</span></div>
        <div><span class="tag">Local progress</span> <span id="localProgressText">0 / 0</span></div>
        <div><span class="tag">Dataset size</span> <span id="sizeText">0 KB</span></div>
      </div>
      <div class="progressWrap">
        <div class="progressBar" aria-label="Progress">
          <div class="progressFill" id="progressFill" style="width:0%"></div>
        </div>
        <div class="small"><span id="progressPct">0%</span> scanned</div>
      </div>
      <p class="small">This browser client performs safe, read-only GET requests to IPs within your chosen CIDR. For global coordination and total internet progress, a backend is required.</p>
    </section>

    <!-- Live log + Index -->
    <div class="grid">
      <section class="panel">
        <h2>Live feed</h2>
        <div id="log" aria-live="polite"></div>
      </section>
      <section class="panel">
        <h2>Archived index</h2>
        <table id="indexTable">
          <thead><tr><th>Target</th><th>Status</th><th>Title</th><th>Time (ms)</th><th>Record</th></tr></thead>
          <tbody></tbody>
        </table>
      </section>
    </div>

    <!-- Details -->
    <section class="panel">
      <h2>Record details</h2>
      <pre id="details">Select a record to view details.</pre>
    </section>

    <section>
      <p class="small">🍯 Public archive • 🐝 Crowd-powered scanning • SEO-ready • Offline-friendly</p>
    </section>
  </main>

  <!-- Minimal LZ-String (Base64) for compression -->
  <script>
    var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},e={compressToBase64:function(o){if(null==o)return"";var n=e._compress(o,6,function(o){return r.charAt(o)});switch(n.length%4){default:case 0:return n;case 1:return n+"=";case 2:return n+"==";case 3:return n+"==="}},decompressFromBase64:function(n){return null==n?"":""==n?null:e._decompress(n.length,32,function(t){return o(r,n.charAt(t))})},_compress:function(o,r,n){if(null==o)return"";var t,e,i={},a={},s="",p="",u="",c=2,l=3,f=2,h=[],d=0,g=0;for(e=0;e<o.length;e+=1)if(s=o.charAt(e),Object.prototype.hasOwnProperty.call(i,s)||(i[s]=l++,a[s]=!0),p=u+s,Object.prototype.hasOwnProperty.call(i,p))u=p;else{if(Object.prototype.hasOwnProperty.call(a,u)){if(u.charCodeAt(0)<256){for(t=0;t<f;t++)d<<=1,g==r-1?(g=0,h.push(n(d)),d=0):g++;for(e=u.charCodeAt(0),t=0;t<8;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}else{for(e=1,t=0;t<f;t++)d=d<<1|e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e=0;for(e=u.charCodeAt(0),t=0;t<16;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}c--,0==c&&(c=Math.pow(2,f),f++),delete a[u]}else{for(e=i[u],t=0;t<f;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}c--,0==c&&(c=Math.pow(2,f),f++),i[p]=l++,u=String(s)}if(""!==u){if(Object.prototype.hasOwnProperty.call(a,u)){if(u.charCodeAt(0)<256){for(t=0;t<f;t++)d<<=1,g==r-1?(g=0,h.push(n(d)),d=0):g++;for(e=u.charCodeAt(0),t=0;t<8;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}else{for(e=1,t=0;t<f;t++)d=d<<1|e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e=0;for(e=u.charCodeAt(0),t=0;t<16;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}c--,0==c&&(c=Math.pow(2,f),f++),delete a[u]}else{for(e=i[u],t=0;t<f;t++)d=d<<1|1&e,g==r-1?(g=0,h.push(n(d)),d=0):g++,e>>=1}c--,0==c&&(c=Math.pow(2,f),f++)}for(e=0;e<h.length;e++)h[e]=String.fromCharCode(h[e]);return h.join("")}}();
  </script>

  <script>
    // Utilities
    const $ = s => document.querySelector(s);
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const humanSize = bytes => {
      if (bytes < 1024) return bytes + " B";
      const units = ["KB","MB","GB"]; let v = bytes, i = -1;
      do { v/=1024; i++; } while (v>=1024 && i<units.length-1);
      return v.toFixed(2)+" "+units[i];
    };

    // Global state
    const state = {
      running: false,
      dataset: [],
      errors: 0,
      totalTargets: 0,
      scanned: 0,
      bees: []
    };

    // Bees visual
    function spawnBees(count = 5) {
      const field = $("#beeField");
      // Clear existing
      [...field.querySelectorAll(".bee")].forEach(b => b.remove());
      state.bees = [];
      for (let i = 0; i < count; i++) {
        const bee = document.createElement("div");
        bee.className = "bee";
        bee.textContent = "🐝✨";
        bee.style.left = Math.round(10 + Math.random() * 80) + "%";
        bee.style.top = Math.round(10 + Math.random() * 80) + "%";
        bee.style.animationDuration = (4 + Math.random() * 3) + "s";
        field.appendChild(bee);
        state.bees.push(bee);
      }
    }

    function updateBeesActive(count) {
      spawnBees(count);
    }

    // CIDR to list of IPs (limited size for browser)
    function ipToInt(ip) {
      const [a,b,c,d] = ip.split(".").map(Number);
      return ((a<<24)>>>0) + (b<<16) + (c<<8) + d;
    }
    function intToIp(n) {
      return [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255].join(".");
    }
    function parseCIDR(cidr) {
      // Supports IPv4: a.b.c.d/nn
      try {
        const [ip, bitsStr] = cidr.trim().split("/");
        const bits = Number(bitsStr);
        if (!ip || isNaN(bits) || bits < 0 || bits > 32) return [];
        const base = ipToInt(ip);
        const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
        const network = base & mask;
        const size = bits === 32 ? 1 : (1 << (32 - bits));
        // Safety cap to avoid freezing the browser; let users pick small blocks
        const MAX_TARGETS = 4096; // cap per run to keep UI responsive
        const count = Math.min(size, MAX_TARGETS);
        const ips = [];
        for (let i = 0; i < count; i++) ips.push(intToIp((network + i) >>> 0));
        return ips;
      } catch { return []; }
    }

    function targetsFromCIDR(cidr) {
      const ips = parseCIDR(cidr);
      const targets = [];
      for (const ip of ips) {
        targets.push("http://" + ip);
        targets.push("https://" + ip);
      }
      return targets;
    }

    function logLine(text) {
      const d = document.createElement("div");
      d.textContent = text;
      $("#log").prepend(d);
    }

    function updateStatus() {
      $("#statusText").textContent = state.running ? "Scanning…" : "Idle";
      $("#countText").textContent = String(state.dataset.length);
      $("#errorText").textContent = String(state.errors);
      $("#localProgressText").textContent = `${state.scanned} / ${state.totalTargets}`;
      const raw = JSON.stringify(state.dataset);
      $("#sizeText").textContent = humanSize(new Blob([raw]).size);
      const pct = state.totalTargets ? Math.round((state.scanned / state.totalTargets) * 100) : 0;
      $("#progressFill").style.width = pct + "%";
      $("#progressPct").textContent = pct + "%";
    }

    async function timedFetch(url, timeoutMs) {
      const start = performance.now();
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal, cache: "no-store" });
        clearTimeout(tid);
        const text = await res.text().catch(() => "");
        let title = "";
        try {
          const doc = new DOMParser().parseFromString(text, "text/html");
          title = doc.querySelector("title")?.textContent?.trim() || "";
        } catch {}
        const headers = {};
        res.headers.forEach((v,k)=>{ headers[k] = v; });
        return {
          ok: res.ok,
          status: res.status,
          finalUrl: res.url || url,
          text,
          title,
          headers,
          timing: { totalMs: Math.round(performance.now() - start) }
        };
      } catch (e) {
        clearTimeout(tid);
        return {
          ok: false,
          status: 0,
          finalUrl: url,
          text: "",
          title: "",
          headers: {},
          error: String(e && e.message || e),
          timing: { totalMs: Math.round(performance.now() - start) }
        };
      }
    }

    function parseSameOriginLinks(html, baseUrl) {
      const out = [];
      try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const base = new URL(baseUrl);
        for (const a of Array.from(doc.querySelectorAll("a[href]"))) {
          const href = a.getAttribute("href"); if (!href) continue;
          let abs; try { abs = new URL(href, base).toString(); } catch { continue; }
          if (new URL(abs).origin === base.origin) out.push(abs);
        }
      } catch {}
      return Array.from(new Set(out));
    }

    function addRow(rec) {
      const tr = document.createElement("tr");
      const host = (() => { try { return new URL(rec.finalUrl || rec.url).host; } catch { return rec.url; } })();
      tr.innerHTML = `
        <td><a href="${rec.finalUrl || rec.url}" target="_blank" rel="noopener">${host}</a></td>
        <td style="color:${rec.ok? 'var(--good)': 'var(--bad)'}">${rec.status}</td>
        <td>${(rec.title || "").replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0, 120)}</td>
        <td>${rec.timing?.totalMs ?? "-"}</td>
        <td><a href="#${rec.id}">data</a></td>
      `;
      $("#indexTable tbody").appendChild(tr);
    }

    function makeRecord(url, pr) {
      return {
        id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        ts: new Date().toISOString(),
        url,
        finalUrl: pr.finalUrl || url,
        ok: pr.ok,
        status: pr.status,
        title: pr.title,
        headers: pr.headers,
        timing: pr.timing,
        fingerprint: {
          server: pr.headers["server"] || null,
          poweredBy: pr.headers["x-powered-by"] || null,
          via: pr.headers["via"] || null
        },
        snapshot: pr.text ? pr.text.slice(0, 40000) : null
      };
    }

    async function scanTarget(url, depth, timeoutMs, visited) {
      const pr = await timedFetch(url, timeoutMs);
      const rec = makeRecord(url, pr);
      state.dataset.push(rec);
      state.scanned++;
      addRow(rec);
      logLine(`${rec.ok ? "✅" : "❌"} ${url} — ${rec.status} (${rec.timing?.totalMs ?? "-"} ms)`);
      if (!pr.ok) state.errors++;
      updateStatus();

      // Optional same-origin crawl
      if (rec.ok && depth > 0 && pr.text) {
        const links = parseSameOriginLinks(pr.text, rec.finalUrl || url);
        for (const l of links) {
          if (!visited.has(l) && state.running) {
            visited.add(l);
            await scanTarget(l, depth - 1, timeoutMs, visited);
          }
        }
      }
    }

    async function workerLoop(id, targets, depth, timeoutMs) {
      const visited = new Set();
      for (let i = id; i < targets.length && state.running; i += Number($("#workers").value)) {
        const t = targets[i];
        visited.add(t);
        // Gentle pacing to mimic organic traffic
        await sleep(120 + Math.random()*240);
        if (!state.running) break;
        await scanTarget(t, depth, timeoutMs, visited);
      }
    }

    async function start() {
      const cidr = $("#cidr").value.trim();
      const targets = targetsFromCIDR(cidr);
      if (!targets.length) { alert("Invalid or too-large CIDR. Try a smaller block like 1.1.1.0/24."); return; }

      state.running = true;
      state.totalTargets = targets.length;
      state.scanned = 0;
      $("#startBtn").disabled = true;
      $("#stopBtn").disabled = false;
      updateBeesActive(Math.max(3, Math.min(Number($("#workers").value) || 3, 12)));
      logLine(`🍯 Starting scan: ${cidr} (${targets.length} targets)`);

      const depth = Math.max(0, Math.min(3, Number($("#depth").value) || 0));
      const timeoutMs = Math.max(1000, Number($("#timeout").value) || 7000);
      const workers = Math.max(1, Math.min(12, Number($("#workers").value) || 3));
      updateStatus();

      // Launch workers
      const jobs = [];
      for (let w = 0; w < workers; w++) jobs.push(workerLoop(w, targets, depth, timeoutMs));
      await Promise.all(jobs);

      state.running = false;
      $("#startBtn").disabled = false;
      $("#stopBtn").disabled = true;
      updateStatus();
      logLine(`✅ Scan complete for ${cidr}. Records: ${state.dataset.length}`);
      updateBeesActive(0);
    }

    function stop() {
      state.running = false;
      $("#startBtn").disabled = false;
      $("#stopBtn").disabled = true;
      updateStatus();
      logLine("⛔ Stopped by user.");
      updateBeesActive(0);
    }

    function clearAll() {
      state.dataset = [];
      state.errors = 0;
      state.scanned = 0;
      state.totalTargets = 0;
      $("#indexTable tbody").innerHTML = "";
      $("#log").innerHTML = "";
      $("#details").textContent = "Select a record to view details.";
      updateStatus();
    }

    function download(name, content, type="application/octet-stream") {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
    }

    function exportJSON() {
      const raw = JSON.stringify(state.dataset, null, 2);
      download("honeypot_archive.json", raw, "application/json");
    }

    function exportCompressed() {
      const lz = LZString.compressToBase64(JSON.stringify(state.dataset));
      download("honeypot_archive.lz", lz, "text/plain");
    }

    function buildIndexHTML() {
      const rows = state.dataset.map(rec => `
        <tr>
          <td><a href="${rec.finalUrl || rec.url}" target="_blank" rel="noopener">${(() => { try { return new URL(rec.finalUrl || rec.url).host; } catch { return rec.url; } })()}</a></td>
          <td>${rec.status}</td>
          <td>${(rec.title || "").replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0,120)}</td>
          <td>${rec.timing?.totalMs ?? "-"}</td>
          <td><a href="#${rec.id}">data</a></td>
        </tr>
      `).join("");
      const data = JSON.stringify(state.dataset);
      const html = `<!DOCTYPE html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Honeypot Archive Index</title>
<style>
body{margin:0;background:#0b0f14;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
main{padding:16px;max-width:1100px;margin:0 auto}
table{width:100%;border-collapse:collapse}
th,td{border-bottom:1px solid #1f2937;padding:8px 6px}
a{color:#60a5fa;text-decoration:none}a:hover{text-decoration:underline}
pre{background:#0b1218;border:1px solid #1f2937;border-radius:10px;padding:10px;overflow:auto;font-family:ui-monospace,Menlo,Consolas,Monaco,monospace;font-size:12px}
</style>
<main>
<h1>Honeypot Archive Index</h1>
<table><thead><tr><th>Target</th><th>Status</th><th>Title</th><th>Time (ms)</th><th>Record</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Record details</h2><pre id="details">Select a record above.</pre>
</main>
<script>
const DATA=${data};
function render(id){const el=document.getElementById("details");const rec=DATA.find(r=>r.id===id);el.textContent=rec?JSON.stringify(rec,null,2):"Not found";}
addEventListener("hashchange",()=>{const id=location.hash.slice(1);if(id)render(id);});
addEventListener("DOMContentLoaded",()=>{const id=location.hash.slice(1);if(id)render(id);});
</script></html>`;
      return html;
    }

    function exportIndex() {
      download("honeypot_archive_index.html", buildIndexHTML(), "text/html");
    }

    async function importArchive(file) {
      const text = await file.text();
      let data;
      if (file.name.endsWith(".lz")) {
        const raw = LZString.decompressFromBase64(text);
        data = JSON.parse(raw || "[]");
      } else {
        data = JSON.parse(text || "[]");
      }
      if (!Array.isArray(data)) { alert("Invalid archive format."); return; }
      clearAll();
      state.dataset = data;
      for (const rec of state.dataset) addRow(rec);
      updateStatus();
      logLine(`📥 Imported archive: ${file.name} (${state.dataset.length} records)`);
    }

    // Wire up
    $("#startBtn").addEventListener("click", start);
    $("#stopBtn").addEventListener("click", stop);
    $("#clearBtn").addEventListener("click", clearAll);
    $("#exportJsonBtn").addEventListener("click", exportJSON);
    $("#exportCompressedBtn").addEventListener("click", exportCompressed);
    $("#exportIndexBtn").addEventListener("click", exportIndex);
    $("#importBtn").addEventListener("click", () => $("#fileInput").click());
    $("#fileInput").addEventListener("change", e => {
      const f = e.target.files?.[0]; if (f) importArchive(f);
      e.target.value = "";
    });

    // Hash details
    addEventListener("hashchange", () => {
      const id = location.hash.slice(1);
      const rec = state.dataset.find(r => r.id === id);
      if (rec) $("#details").textContent = JSON.stringify(rec, null, 2);
    });

    // Init
    spawnBees(7);
    updateStatus();
  </script>
</body>
</html>
