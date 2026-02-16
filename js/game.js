/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: game.js
 * Declaration ID: IP-BA96F3B-MLL28ZV3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

function initGame() {
  const loadingScreen = document.getElementById('loading-screen');
  const hudLatLon = document.getElementById('hud-latlon');
  const hudHex = document.getElementById('hud-hex');
  const hudSwatch = document.getElementById('hud-swatch');
  const hudHint = document.getElementById('hud-hint');

  const EARTH_RADIUS = 5;
  const MARKER_RADIUS = EARTH_RADIUS + 0.06;

  function setHudSample(lat, lon, hex) {
    if (hudLatLon) hudLatLon.textContent = `lat: ${lat.toFixed(4)}, lon: ${lon.toFixed(4)}`;
    if (hudHex) hudHex.textContent = hex || '#------';
    if (hudSwatch) hudSwatch.style.background = hex || 'transparent';
  }

  function hideLoading() {
    if (loadingScreen) loadingScreen.style.display = 'none';
  }

  // NASA Toolkit (UI + programmatic API for agents)
  const NASA_API_CATALOG = [
    {
      id: 'apod',
      name: 'APOD: Astronomy Picture of the Day',
      description: "NASA's daily astronomy image + metadata.",
      docs: 'https://api.nasa.gov/'
    },
    {
      id: 'neows',
      name: 'Asteroids NeoWs',
      description: 'Near-Earth Object Web Service (NEO feed/lookup).',
      docs: 'https://api.nasa.gov/'
    },
    {
      id: 'donki',
      name: 'DONKI',
      description: 'Space weather events (CMEs, flares, etc.).',
      docs: 'https://api.nasa.gov/'
    },
    {
      id: 'eonet',
      name: 'EONET',
      description: 'Earth Observatory Natural Event Tracker.',
      docs: 'https://eonet.gsfc.nasa.gov/docs/v3'
    },
    {
      id: 'epic',
      name: 'EPIC',
      description: 'Earth Polychromatic Imaging Camera images by date.',
      docs: 'https://api.nasa.gov/'
    },
    {
      id: 'image-video-library',
      name: 'NASA Image and Video Library',
      description: 'Search images.nasa.gov (no api_key required).',
      docs: 'https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf'
    }
  ];

  function getNasaApiKey() {
    const input = document.getElementById('nasa-key');
    const fromHud = input && input.value ? input.value.trim() : '';
    const fromWindow = (window.NASA_API_KEY && String(window.NASA_API_KEY).trim()) || '';
    const fromStorage = getStoredApiKey();
    return fromHud || fromWindow || fromStorage || '';
  }

  // API Key persistence
  function getStoredApiKey() {
    try {
      return localStorage.getItem('nasa-api-key') || '';
    } catch (e) {
      return '';
    }
  }

  function saveApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem('nasa-api-key', key.trim());
        showNotification('NASA API key saved');
      }
    } catch (e) {
      console.warn('Failed to save API key:', e);
    }
  }

  // Load saved API key on init
  const savedKey = getStoredApiKey();
  if (savedKey) {
    const keyInput = document.getElementById('nasa-key');
    if (keyInput) keyInput.value = savedKey;
  }

  function setNasaResults(html) {
    const el = document.getElementById('nasa-results');
    if (!el) return;
    el.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCatalog(filterText) {
    const q = (filterText || '').trim().toLowerCase();
    const rows = NASA_API_CATALOG
      .filter((item) => {
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      })
      .map((item) => {
        const name = escapeHtml(item.name);
        const desc = escapeHtml(item.description);
        const link = escapeHtml(item.docs);
        return `
          <div class="nasa-item">
            <div class="nasa-item-title">${name}</div>
            <div class="nasa-item-desc">${desc}</div>
            <a class="nasa-item-link" href="${link}" target="_blank" rel="noreferrer">Docs</a>
          </div>
        `;
      })
      .join('');

    setNasaResults(rows || '<div class="nasa-item-desc">No matches.</div>');
  }

  async function cachedJson(url, { cacheSeconds = 300 } = {}) {
    const key = `nasa_cache:${url}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.t && (Date.now() - parsed.t) / 1000 < cacheSeconds) {
          return parsed.v;
        }
      }
    } catch (e) {
      // ignore cache read errors
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const json = await res.json();

    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: json }));
    } catch (e) {
      // ignore cache write errors
    }
    return json;
  }

  async function nasaGetApod() {
    const apiKey = getNasaApiKey() || 'DEMO_KEY';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}`;
    const data = await cachedJson(url, { cacheSeconds: 6 * 60 * 60 });
    return data;
  }

  async function nasaGetEonetOpenEvents() {
    // EONET does not require api_key.
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=75';
    const data = await cachedJson(url, { cacheSeconds: 5 * 60 });
    return data;
  }

  function getCesiumViewer() {
    return window.__CESIUM_VIEWER || null;
  }

  function clearCesiumEonet() {
    const viewer = getCesiumViewer();
    if (!viewer) return;
    if (window.__EONET_ENTITY_IDS && Array.isArray(window.__EONET_ENTITY_IDS)) {
      for (const id of window.__EONET_ENTITY_IDS) {
        const ent = viewer.entities.getById(id);
        if (ent) viewer.entities.remove(ent);
      }
    }
    window.__EONET_ENTITY_IDS = [];
  }

  function addCesiumEonet(events) {
    const viewer = getCesiumViewer();
    if (!viewer) return { added: 0, reason: 'Cesium viewer not active.' };

    clearCesiumEonet();

    const Cesium = window.Cesium;
    if (!Cesium) return { added: 0, reason: 'Cesium not available.' };

    const ids = [];
    let added = 0;

    const list = Array.isArray(events) ? events : [];
    for (const ev of list) {
      const geoms = Array.isArray(ev.geometry) ? ev.geometry : [];
      for (const g of geoms) {
        // EONET uses GeoJSON-like coords.
        // - Point: [lon, lat]
        // - Polygon: [[lon,lat],...]
        const type = g && g.type;
        const coords = g && g.coordinates;
        let lonLat = null;
        if (type === 'Point' && Array.isArray(coords) && coords.length >= 2) {
          lonLat = [coords[0], coords[1]];
        } else if (type === 'Polygon' && Array.isArray(coords) && Array.isArray(coords[0]) && coords[0].length) {
          // Take first vertex as a simple representative point.
          const first = coords[0][0];
          if (Array.isArray(first) && first.length >= 2) lonLat = [first[0], first[1]];
        }
        if (!lonLat) continue;

        const lon = Number(lonLat[0]);
        const lat = Number(lonLat[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

        const id = `eonet:${ev.id || ev.title || 'event'}:${added}`;
        ids.push(id);
        added += 1;

        viewer.entities.add({
          id,
          position: Cesium.Cartesian3.fromDegrees(lon, lat),
          point: {
            pixelSize: 6,
            color: Cesium.Color.YELLOW.withAlpha(0.95),
            outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
            outlineWidth: 1
          },
          label: {
            text: String(ev.title || ev.id || 'Event'),
            font: '12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(10, -10),
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.55),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5.0e7)
          }
        });

        // Keep count reasonable.
        if (added >= 150) break;
      }
      if (added >= 150) break;
    }

    window.__EONET_ENTITY_IDS = ids;
    return { added };
  }

  function initNasaToolkitUi() {
    const search = document.getElementById('nasa-search');
    const clear = document.getElementById('nasa-clear');
    const apodBtn = document.getElementById('nasa-apod');
    const eonetBtn = document.getElementById('nasa-eonet');
    const keyInput = document.getElementById('nasa-key');

    renderCatalog('');

    // Save API key when changed
    if (keyInput) {
      keyInput.addEventListener('change', () => {
        saveApiKey(keyInput.value);
      });
    }

    if (search) {
      search.addEventListener('input', () => renderCatalog(search.value));
    }
    if (clear) {
      clear.addEventListener('click', () => {
        if (search) search.value = '';
        renderCatalog('');
      });
    }

    if (apodBtn) {
      apodBtn.addEventListener('click', async () => {
        setNasaResults('<div class="nasa-item-desc">Loading APOD…</div>');
        try {
          const apod = await nasaGetApod();
          const title = escapeHtml(apod.title || 'APOD');
          const date = escapeHtml(apod.date || '');
          const explanation = escapeHtml(apod.explanation || '');
          const mediaType = escapeHtml(apod.media_type || '');
          const url = escapeHtml(apod.url || '');
          const hdurl = escapeHtml(apod.hdurl || '');

          // Enhanced media display with image preview
          let media = '';
          if (mediaType === 'image') {
            media = `
              <div style="margin: 10px 0;">
                <img src="${url}" alt="${title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;" />
                <div style="display: flex; gap: 10px;">
                  <a class="nasa-item-link" href="${hdurl || url}" target="_blank" rel="noreferrer">Open HD Image</a>
                  <a class="nasa-item-link" href="${url}" target="_blank" rel="noreferrer">Standard</a>
                </div>
              </div>
            `;
          } else if (url) {
            media = `<a class="nasa-item-link" href="${url}" target="_blank" rel="noreferrer">Open media</a>`;
          }

          setNasaResults(`
            <div class="nasa-item">
              <div class="nasa-item-title">${title} <span style="opacity:.8;font-weight:400">${date}</span></div>
              <div class="nasa-item-desc">${explanation}</div>
              ${media}
            </div>
          `);
        } catch (e) {
          setNasaResults(`<div class="nasa-item-desc">APOD failed: ${escapeHtml(e.message || e)}</div>`);
        }
      });
    }

    if (eonetBtn) {
      eonetBtn.addEventListener('click', async () => {
        setNasaResults('<div class="nasa-item-desc">Loading EONET events…</div>');
        try {
          const data = await nasaGetEonetOpenEvents();
          const events = Array.isArray(data.events) ? data.events : [];

          // If Cesium is active, also plot events.
          const plotted = addCesiumEonet(events);

          const rows = events.slice(0, 50).map((ev) => {
            const name = escapeHtml(ev.title || ev.id || 'Event');
            const link = (ev.link && escapeHtml(ev.link)) || '';
            const cats = (ev.categories || []).map((c) => c && c.title).filter(Boolean).join(', ');
            return `
              <div class="nasa-item">
                <div class="nasa-item-title">${name}</div>
                <div class="nasa-item-desc">${escapeHtml(cats || '—')}</div>
                ${link ? `<a class="nasa-item-link" href="${link}" target="_blank" rel="noreferrer">Details</a>` : ''}
              </div>
            `;
          }).join('');

          const note = plotted && plotted.added
            ? `<div class="nasa-item-desc">Plotted ${plotted.added} events on the globe.</div>`
            : '';
          setNasaResults((note ? `<div class="nasa-item">${note}</div>` : '') + (rows || '<div class="nasa-item-desc">No open events found.</div>'));
        } catch (e) {
          setNasaResults(`<div class="nasa-item-desc">EONET failed: ${escapeHtml(e.message || e)}</div>`);
        }
      });
    }
  }

  // Expose for agents: consistent programmatic interface.
  window.NASA_TOOLKIT = {
    catalog: NASA_API_CATALOG,
    getApiKey: getNasaApiKey,
    getApod: nasaGetApod,
    getEonetOpenEvents: nasaGetEonetOpenEvents,
    addCesiumEonet,
    clearCesiumEonet,
    renderCatalog
  };

  initNasaToolkitUi();

  // Prefer Cesium (tile-streaming globe). If Cesium is unavailable (offline), fall back to Three.js.
  if (window.Cesium && typeof window.Cesium.Viewer === 'function') {
    initCesiumGlobe().catch((error) => {
      console.error('Cesium init failed, falling back to Three.js:', error);
      // If Cesium can't load (network/CORS/blocked CDN), keep the app usable via Three.js.
      // eslint-disable-next-line no-lone-blocks
      {
        // continue into the existing Three.js init below
      }
    });
    return;
  }

  async function initCesiumGlobe() {
    const Cesium = window.Cesium;
    const container = document.getElementById('globe');
    if (!container) {
      throw new Error('Missing #globe container for Cesium viewer.');
    }

    if (hudHint) {
      hudHint.textContent = 'Click the globe to show lat/lon (tile mode; exact pixel sampling depends on imagery/CORS).';
    }

    // Create the viewer with minimal UI; imagery is provided via NASA GIBS WMTS.
    const viewer = new Cesium.Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shouldAnimate: true,
      terrainProvider: new Cesium.EllipsoidTerrainProvider()
    });

    // Make viewer accessible to the NASA toolkit + agents.
    window.__CESIUM_VIEWER = viewer;

    // Render sharp (avoid blurry/"wispy" look from post-processing + low render scale).
    // Note: Some "soft" appearance can still come from the imagery itself (JPEG).
    viewer.resolutionScale = (window.devicePixelRatio && window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;
    if (viewer.scene && viewer.scene.postProcessStages && viewer.scene.postProcessStages.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = false;
    }
    viewer.scene.fog.enabled = false;
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    viewer.scene.globe.maximumScreenSpaceError = 1; // higher quality tiles
    if (viewer.scene.skyBox) viewer.scene.skyBox.show = true;

    // Replace any default imagery.
    viewer.imageryLayers.removeAll();

    // NASA GIBS WMTS (EPSG:4326 / CRS84).
    // Use a known global-coverage base layer so the globe is always fully filled.
    // (Some "near real time" layers are time-dependent and can have gaps if Time is wrong/unavailable.)
    const GIBS_LAYER_ID = 'BlueMarble_NextGeneration';
    const GIBS_TILE_MATRIX_SET = '500m';
    const GIBS_FORMAT = 'image/jpeg';

    // TileMatrix identifiers and tile sizes must match capabilities or you get blank bands/patches.
    const gibsCfg = await getGibsWmtsConfig({
      layerId: GIBS_LAYER_ID,
      tileMatrixSetId: GIBS_TILE_MATRIX_SET,
      needsTime: false
    });

    const provider = new Cesium.WebMapTileServiceImageryProvider({
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi',
      layer: GIBS_LAYER_ID,
      style: 'default',
      format: GIBS_FORMAT,
      tileMatrixSetID: GIBS_TILE_MATRIX_SET,
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: gibsCfg.tileMatrixLabels,
      tileWidth: gibsCfg.tileWidth,
      tileHeight: gibsCfg.tileHeight,
      rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
      dimensions: gibsCfg.time ? { Time: gibsCfg.time } : undefined,
      maximumLevel: gibsCfg.maximumLevel,
      credit: 'NASA GIBS'
    });

    viewer.imageryLayers.addImageryProvider(provider);

    // Basic interaction: click to read lat/lon.
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if (!cartesian) return;
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      setHudSample(lat, lon, null);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    hideLoading();
  }

  async function getGibsWmtsConfig({ layerId, tileMatrixSetId, needsTime }) {
    const fallbackDate = needsTime
      ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;
    const fallbackLabels = Array.from({ length: 9 }, (_, i) => String(i));
    const fallback = {
      time: fallbackDate,
      tileMatrixLabels: fallbackLabels,
      tileWidth: 512,
      tileHeight: 512,
      maximumLevel: fallbackLabels.length - 1
    };

    try {
      const response = await fetch(
        'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?request=GetCapabilities',
        { cache: 'no-store' }
      );
      if (!response.ok) return fallback;
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'application/xml');

      const wmtsNS = 'http://www.opengis.net/wmts/1.0';
      const owsNS = 'http://www.opengis.net/ows/1.1';

      let time = null;
      if (needsTime) {
        const layers = xml.getElementsByTagNameNS(wmtsNS, 'Layer');
        for (const layer of layers) {
          const idNode = Array.from(layer.children).find(
            (n) => n.namespaceURI === owsNS && n.localName === 'Identifier'
          );
          const idText = idNode ? (idNode.textContent || '').trim() : null;
          if (idText !== layerId) continue;

          const dims = layer.getElementsByTagNameNS(wmtsNS, 'Dimension');
          for (const dim of dims) {
            const dimIdNode = Array.from(dim.children).find(
              (n) => n.namespaceURI === owsNS && n.localName === 'Identifier'
            );
            const dimId = dimIdNode ? (dimIdNode.textContent || '').trim() : null;
            if (dimId !== 'Time') continue;

            const defaults = dim.getElementsByTagNameNS(wmtsNS, 'Default');
            if (defaults && defaults[0] && defaults[0].textContent) {
              const t = defaults[0].textContent.trim();
              if (t) time = t;
            }
          }
          break;
        }
      }

      let tileMatrixLabels = null;
      let tileWidth = null;
      let tileHeight = null;

      const contents = xml.getElementsByTagNameNS(wmtsNS, 'Contents');
      const contentsNode = contents && contents[0];
      if (contentsNode) {
        const tileMatrixSets = contentsNode.getElementsByTagNameNS(wmtsNS, 'TileMatrixSet');
        for (const tms of tileMatrixSets) {
          const idNode = Array.from(tms.children).find(
            (n) => n.namespaceURI === owsNS && n.localName === 'Identifier'
          );
          const idText = idNode ? (idNode.textContent || '').trim() : null;
          if (idText !== tileMatrixSetId) continue;

          const matrices = tms.getElementsByTagNameNS(wmtsNS, 'TileMatrix');
          const labels = [];
          for (const m of matrices) {
            const midNode = Array.from(m.children).find(
              (n) => n.namespaceURI === owsNS && n.localName === 'Identifier'
            );
            const mid = midNode ? (midNode.textContent || '').trim() : null;
            if (mid) labels.push(mid);

            if (tileWidth == null) {
              const tw = m.getElementsByTagNameNS(wmtsNS, 'TileWidth');
              const th = m.getElementsByTagNameNS(wmtsNS, 'TileHeight');
              const twVal = tw && tw[0] ? parseInt(tw[0].textContent, 10) : NaN;
              const thVal = th && th[0] ? parseInt(th[0].textContent, 10) : NaN;
              if (Number.isFinite(twVal)) tileWidth = twVal;
              if (Number.isFinite(thVal)) tileHeight = thVal;
            }
          }

          if (labels.length) tileMatrixLabels = labels;
          break;
        }
      }

      return {
        time: (needsTime ? (time || fallback.time) : null),
        tileMatrixLabels: tileMatrixLabels || fallback.tileMatrixLabels,
        tileWidth: tileWidth || fallback.tileWidth,
        tileHeight: tileHeight || fallback.tileHeight,
        maximumLevel: (tileMatrixLabels && tileMatrixLabels.length)
          ? tileMatrixLabels.length - 1
          : fallback.maximumLevel
      };
    } catch (e) {
      return fallback;
    }
  }

  function rgbToHex(r, g, b) {
    const to2 = (n) => n.toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  }

  function latLonToUv(lat, lon) {
    // Equirectangular map: lon -180..180 => u 0..1, lat 90..-90 => v 0..1
    const u = (lon + 180) / 360;
    const v = (90 - lat) / 180;
    return { u, v };
  }

  function pointOnSphereToLatLon(point) {
    const p = point.clone().normalize();
    const phi = Math.acos(THREE.MathUtils.clamp(p.y, -1, 1)); // 0..pi
    let theta = Math.atan2(p.z, p.x); // -pi..pi
    if (theta < 0) theta += Math.PI * 2; // 0..2pi
    const lat = 90 - THREE.MathUtils.radToDeg(phi);
    const lon = THREE.MathUtils.radToDeg(theta) - 180;
    return { lat, lon };
  }

  function createTextureSampler(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('2D canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          width: canvas.width,
          height: canvas.height,
          sampleUv(u, v) {
            // clamp/wrap to avoid out-of-bounds
            const uu = ((u % 1) + 1) % 1;
            const vv = Math.min(1, Math.max(0, v));
            const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(uu * (canvas.width - 1))));
            const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(vv * (canvas.height - 1))));
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
          },
          sampleLatLon(lat, lon) {
            const { u, v } = latLonToUv(lat, lon);
            return this.sampleUv(u, v);
          }
        });
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      // same-origin when serving locally; avoids tainted canvas
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  }

  function createFallbackEquirectangularTexture() {
    // Generates a deterministic “map-like” texture so the app works even without earth.jpg.
    // This is NOT a real Earth map; it exists to make sampling/markers visibly functional.
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0b1e4a');
    grad.addColorStop(0.5, '#123d7a');
    grad.addColorStop(1, '#0b1e4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // lat/lon grid every 30 degrees
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += canvas.width / 12) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += canvas.height / 6) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.width, y + 0.5);
      ctx.stroke();
    }

    // pseudo “land” blobs based on lon/lat waves
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let py = 0; py < canvas.height; py++) {
      const v = py / (canvas.height - 1);
      const lat = (0.5 - v) * Math.PI; // +pi/2..-pi/2
      for (let px = 0; px < canvas.width; px++) {
        const u = px / (canvas.width - 1);
        const lon = (u - 0.5) * Math.PI * 2;
        const n =
          Math.sin(lon * 1.7) * 0.55 +
          Math.cos(lat * 2.3) * 0.45 +
          Math.sin(lon * 3.1 + lat * 1.3) * 0.25;
        const idx = (py * canvas.width + px) * 4;
        if (n > 0.55 && Math.abs(lat) < 1.25) {
          // land
          data[idx + 0] = 44;
          data[idx + 1] = 130;
          data[idx + 2] = 72;
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // sampler from the same canvas
    const samplerCanvas = canvas;
    const samplerCtx = ctx;
    return {
      texture,
      sampler: {
        width: samplerCanvas.width,
        height: samplerCanvas.height,
        sampleUv(u, v) {
          const uu = ((u % 1) + 1) % 1;
          const vv = Math.min(1, Math.max(0, v));
          const x = Math.min(samplerCanvas.width - 1, Math.max(0, Math.floor(uu * (samplerCanvas.width - 1))));
          const y = Math.min(samplerCanvas.height - 1, Math.max(0, Math.floor(vv * (samplerCanvas.height - 1))));
          const pixel = samplerCtx.getImageData(x, y, 1, 1).data;
          return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
        },
        sampleLatLon(lat, lon) {
          const { u, v } = latLonToUv(lat, lon);
          return this.sampleUv(u, v);
        }
      }
    };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // More realistic defaults
  renderer.physicallyCorrectLights = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('globe').appendChild(renderer.domElement);

  // Make colors/lighting look correct (Three r124 style)
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
  }

  // Add lighting
  // Ambient baseline
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  // Hemisphere light gives a softer "sky/ground" look
  const hemiLight = new THREE.HemisphereLight(0xaac7ff, 0x1a2230, 0.7);
  scene.add(hemiLight);

  // Key + fill lights (studio-style)
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.25);
  keyLight.position.set(12, 8, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
  fillLight.position.set(-10, -3, -8);
  scene.add(fillLight);

  // A dim rim/back light helps the sphere read against space
  const rimLight = new THREE.DirectionalLight(0xbad6ff, 0.65);
  rimLight.position.set(-18, 12, 18);
  scene.add(rimLight);

  // Load texture for the globe
  const textureLoader = new THREE.TextureLoader();
  // Needed for external imagery (best-effort; depends on server CORS headers)
  if (typeof textureLoader.setCrossOrigin === 'function') {
    textureLoader.setCrossOrigin('anonymous');
  }
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2244aa,
    roughness: 0.9,
    metalness: 0.0
  });
  const globe = new THREE.Mesh(geometry, material);

  let textureSampler = null;
  const markers = [];

  function colorForLatLon(lat, lon) {
    if (!textureSampler) return '#ff0000';
    const { r, g, b } = textureSampler.sampleLatLon(lat, lon);
    return rgbToHex(r, g, b);
  }

  function recolorExistingMarkers() {
    if (!textureSampler) return;
    for (const marker of markers) {
      const { lat, lon } = marker.userData || {};
      if (typeof lat !== 'number' || typeof lon !== 'number') continue;
      const hex = colorForLatLon(lat, lon);
      marker.material.color.set(hex);
      marker.material.needsUpdate = true;
    }
  }

  // Try to load a realistic texture set if present.
  // If you add these files, the globe will look much more realistic:
  // - assets/textures/earth_day.jpg (equirectangular)
  // - assets/textures/earth_normal.jpg
  // - assets/textures/earth_spec.jpg
  // - assets/textures/earth_clouds.png (RGBA/alpha)
  // Fallback remains functional without them.
  const TEXTURES = {
    day: 'assets/textures/earth_day.jpg',
    normal: 'assets/textures/earth_normal.jpg',
    spec: 'assets/textures/earth_spec.jpg',
    clouds: 'assets/textures/earth_clouds.png',
    legacy: 'assets/textures/earth.jpg'
  };

  function isoDateUTC(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function gibsWmsEpsg4326Url({ layer, date, width, height, format = 'image/jpeg' }) {
    // NASA GIBS WMS (EPSG:4326). Axis order for EPSG:4326 in WMS 1.3.0 is lat,lon.
    const base = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
    const params = new URLSearchParams({
      SERVICE: 'WMS',
      REQUEST: 'GetMap',
      VERSION: '1.3.0',
      LAYERS: layer,
      STYLES: '',
      FORMAT: format,
      TRANSPARENT: 'FALSE',
      CRS: 'EPSG:4326',
      BBOX: '-90,-180,90,180',
      WIDTH: String(width),
      HEIGHT: String(height),
      TIME: date
    });
    return `${base}?${params.toString()}`;
  }

  function setMapTexture(tex) {
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);
    material.map = tex;
    material.needsUpdate = true;
  }

  // Primary: earth_day.jpg, fallback: earth.jpg, final: procedural
  textureLoader.load(
    TEXTURES.day,
    (dayTexture) => {
      setMapTexture(dayTexture);
      // Normal/spec are optional
      textureLoader.load(
        TEXTURES.normal,
        (normalTex) => {
          material.normalMap = normalTex;
          material.normalScale = new THREE.Vector2(0.65, 0.65);
          material.needsUpdate = true;
        },
        undefined,
        () => {}
      );
      textureLoader.load(
        TEXTURES.spec,
        (specTex) => {
          material.roughnessMap = specTex;
          material.roughness = 0.85;
          material.needsUpdate = true;
        },
        undefined,
        () => {}
      );

      // Create a sampler from the day texture for exact pixel sampling.
      createTextureSampler(TEXTURES.day)
        .then((sampler) => {
          textureSampler = sampler;
          recolorExistingMarkers();
        })
        .catch((err) => {
          console.warn('Texture sampler unavailable:', err);
        })
        .finally(() => {
          if (loadingScreen) loadingScreen.style.display = 'none';
        });
    },
    undefined,
    () => {
      // Try legacy name
      textureLoader.load(
        TEXTURES.legacy,
        (legacyTexture) => {
          setMapTexture(legacyTexture);
          createTextureSampler(TEXTURES.legacy)
            .then((sampler) => {
              textureSampler = sampler;
              recolorExistingMarkers();
            })
            .catch((err) => {
              console.warn('Texture sampler unavailable:', err);
            })
            .finally(() => {
              if (loadingScreen) loadingScreen.style.display = 'none';
            });
        },
        undefined,
        () => {
          // Online fallback: NASA GIBS near-real-time global imagery (no API key).
          // If CORS blocks sampling, the globe can still render, but pixel sampling may be disabled.
          const layer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
          const maxLookbackDays = 7;
          const size = { width: 2048, height: 1024 };

          const tryLoadGibs = (lookbackDays) => {
            if (lookbackDays > maxLookbackDays) {
              console.warn('GIBS imagery unavailable; using built-in fallback texture.');
              const fallback = createFallbackEquirectangularTexture();
              if (fallback) {
                material.map = fallback.texture;
                material.needsUpdate = true;
                textureSampler = fallback.sampler;
                recolorExistingMarkers();
              }
              if (loadingScreen) loadingScreen.style.display = 'none';
              return;
            }

            const d = new Date();
            d.setUTCDate(d.getUTCDate() - lookbackDays);
            const date = isoDateUTC(d);
            const url = gibsWmsEpsg4326Url({ layer, date, ...size });

            textureLoader.load(
              url,
              (gibsTexture) => {
                console.log(`[GIBS] Loaded ${layer} for ${date}`);
                setMapTexture(gibsTexture);

                // Best-effort sampler (may fail if server does not allow canvas readback)
                createTextureSampler(url)
                  .then((sampler) => {
                    textureSampler = sampler;
                    recolorExistingMarkers();
                  })
                  .catch((err) => {
                    console.warn('GIBS sampler unavailable (likely CORS/canvas restrictions):', err);
                  })
                  .finally(() => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                  });

                // Periodically refresh imagery (keeps it closer to "live")
                setInterval(() => {
                  const dd = new Date();
                  const latest = isoDateUTC(dd);
                  const refreshUrl = gibsWmsEpsg4326Url({ layer, date: latest, ...size });
                  textureLoader.load(
                    refreshUrl,
                    (newTex) => {
                      if (material.map) material.map.dispose?.();
                      setMapTexture(newTex);
                    },
                    undefined,
                    () => {}
                  );
                }, 30 * 60 * 1000);
              },
              undefined,
              () => {
                tryLoadGibs(lookbackDays + 1);
              }
            );
          };

          tryLoadGibs(0);
        }
      );
    }
  );

  // Optional clouds layer (adds realism if you provide an alpha PNG)
  const cloudsGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.01, 64, 64);
  const cloudsMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  clouds.visible = false;
  scene.add(clouds);

  textureLoader.load(
    TEXTURES.clouds,
    (cloudsTex) => {
      if (THREE.sRGBEncoding) cloudsTex.encoding = THREE.sRGBEncoding;
      cloudsMaterial.map = cloudsTex;
      cloudsMaterial.alphaMap = cloudsTex;
      cloudsMaterial.needsUpdate = true;
      clouds.visible = true;
    },
    undefined,
    () => {}
  );

  // Atmosphere glow (simple Fresnel shader)
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.03, 64, 64);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color(0x5aa8ff) },
      intensity: { value: 0.9 },
      falloff: { value: 2.6 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      uniform float falloff;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main(){
        float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), falloff);
        vec3 col = glowColor * fresnel * intensity;
        gl_FragColor = vec4(col, fresnel);
      }
    `
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);
  scene.add(globe);
  camera.position.z = 15;

  // Add user interaction (OrbitControls)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth rotation
  controls.dampingFactor = 0.05;
  controls.minDistance = 8;
  controls.maxDistance = 35;

  // Add data overlays (Markers)
  const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);

  function addMarker(lat, lon) {
    const hex = colorForLatLon(lat, lon);

    const marker = new THREE.Mesh(
      markerGeometry,
      new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(hex),
        emissive: new THREE.Color(hex),
        emissiveIntensity: 0.5
      })
    );

    marker.userData = { lat, lon, createdAt: Date.now() };

    // Convert lat/lon to 3D coordinates
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = MARKER_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = MARKER_RADIUS * Math.cos(phi);
    const z = MARKER_RADIUS * Math.sin(phi) * Math.sin(theta);

    marker.position.set(x, y, z);
    scene.add(marker);
    markers.push(marker);

    // Enhanced animation with pulsating and fade-out effect
    const scaleFactor = 1.5;
    const pulseDuration = 1000; // 1 second pulse
    const fadeOutDelay = 10000; // Start fading after 10 seconds
    const fadeOutDuration = 2000; // 2 second fade
    const clock = new THREE.Clock();
    let animationRunning = true;

    function animateMarker() {
      if (!animationRunning || !marker.parent) return;
      
      const elapsedTime = clock.getElapsedTime() * 1000;
      
      // Pulsating effect
      const scale = 1 + Math.sin((elapsedTime % pulseDuration) / pulseDuration * Math.PI * 2) * (scaleFactor - 1);
      marker.scale.set(scale, scale, scale);
      
      // Fade out after delay
      if (elapsedTime > fadeOutDelay) {
        const fadeProgress = Math.min((elapsedTime - fadeOutDelay) / fadeOutDuration, 1);
        marker.material.opacity = 1 - fadeProgress;
        marker.material.transparent = true;
        
        if (fadeProgress >= 1) {
          animationRunning = false;
          return;
        }
      }
      
      requestAnimationFrame(animateMarker);
    }

    animateMarker();

    return marker;
  }

  // Marker history for tracking clicked locations
  const markerHistory = [];
  const MAX_HISTORY = 20;

  // Enhanced addMarker with history tracking
  const originalAddMarker = addMarker;
  addMarker = function(lat, lon, label) {
    const marker = originalAddMarker(lat, lon);
    
    // Add to history
    const historyEntry = {
      lat,
      lon,
      label: label || `Point ${markerHistory.length + 1}`,
      timestamp: new Date().toISOString(),
      marker
    };
    markerHistory.push(historyEntry);
    
    // Limit history size
    if (markerHistory.length > MAX_HISTORY) {
      const removed = markerHistory.shift();
      if (removed.marker && removed.marker.parent) {
        scene.remove(removed.marker);
      }
    }
    
    updateMarkerHistoryUI();
    return marker;
  };

  // Example markers (colors will match the map pixels once a texture is present)
  addMarker(37.7749, -122.4194, 'San Francisco');
  addMarker(51.5074, -0.1278, 'London');
  addMarker(-33.8688, 151.2093, 'Sydney');

  // Click-to-sample: raycast the globe, convert point -> lat/lon -> pixel color
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clickable = [globe];

  function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickable, false);
    if (!hits.length) return;

    const { lat, lon } = pointOnSphereToLatLon(hits[0].point);
    if (!textureSampler) {
      console.warn('No texture sampler yet. Add assets/textures/earth.jpg and reload.');
      setHudSample(lat, lon, '#------');
      return;
    }

    const { r, g, b } = textureSampler.sampleLatLon(lat, lon);
    const hex = rgbToHex(r, g, b);
    setHudSample(lat, lon, hex);
    addMarker(lat, lon);
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  // Keyboard shortcuts for navigation
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    
    switch(key) {
      case 'h':
        // Show help modal
        toggleHelpModal();
        break;
      case 's':
        // Show settings panel
        toggleSettingsPanel();
        break;
      case 'c':
        // Clear all markers
        clearAllMarkers();
        break;
      case 'r':
        // Reset camera position
        resetCamera();
        break;
      case '+':
      case '=':
        // Zoom in
        camera.position.multiplyScalar(0.9);
        break;
      case '-':
      case '_':
        // Zoom out
        camera.position.multiplyScalar(1.1);
        break;
      case 'p':
        // Toggle auto-rotation
        toggleAutoRotation();
        break;
      case 'd':
        // Toggle day/night cycle
        toggleDayNightCycle();
        break;
    }
  });

  // User preferences
  let preferences = {
    autoRotate: true,
    rotationSpeed: 0.0015,
    showClouds: false,
    showAtmosphere: true,
    atmosphereIntensity: 0.9,
    dayNightCycle: false
  };

  // Load preferences from localStorage
  try {
    const saved = localStorage.getItem('rdata-preferences');
    if (saved) {
      preferences = { ...preferences, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e);
  }

  // Apply initial preferences
  clouds.visible = preferences.showClouds;
  
  // Update atmosphere intensity
  if (atmosphere && atmosphere.material && atmosphere.material.uniforms) {
    atmosphere.material.uniforms.intensity.value = preferences.atmosphereIntensity;
  }

  // Save preferences
  function savePreferences() {
    try {
      localStorage.setItem('rdata-preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }

  // Toggle functions
  function toggleAutoRotation() {
    preferences.autoRotate = !preferences.autoRotate;
    savePreferences();
    showNotification(`Auto-rotation ${preferences.autoRotate ? 'enabled' : 'disabled'}`);
  }

  function toggleDayNightCycle() {
    preferences.dayNightCycle = !preferences.dayNightCycle;
    savePreferences();
    showNotification(`Day/Night cycle ${preferences.dayNightCycle ? 'enabled' : 'disabled'}`);
  }

  function clearAllMarkers() {
    markers.forEach(marker => {
      if (marker && marker.parent) {
        scene.remove(marker);
      }
    });
    markers.length = 0;
    markerHistory.length = 0;
    updateMarkerHistoryUI();
    showNotification('All markers cleared');
  }

  function resetCamera() {
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);
    controls.reset();
    showNotification('Camera reset');
  }

  // Settings panel
  function toggleSettingsPanel() {
    let panel = document.getElementById('settings-panel');
    if (panel) {
      panel.remove();
      return;
    }

    panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.innerHTML = `
      <div class="settings-overlay">
        <div class="settings-content">
          <h2>⚙️ Settings</h2>
          
          <div class="setting-group">
            <label>
              <input type="checkbox" id="setting-autorotate" ${preferences.autoRotate ? 'checked' : ''} />
              <span>Auto-Rotation</span>
            </label>
          </div>

          <div class="setting-group">
            <label>
              <span>Rotation Speed</span>
              <input type="range" id="setting-rotation-speed" min="0" max="5" step="0.1" 
                     value="${preferences.rotationSpeed * 1000}" />
              <span class="setting-value">${(preferences.rotationSpeed * 1000).toFixed(1)}</span>
            </label>
          </div>

          <div class="setting-group">
            <label>
              <input type="checkbox" id="setting-clouds" ${preferences.showClouds ? 'checked' : ''} />
              <span>Show Clouds</span>
            </label>
          </div>

          <div class="setting-group">
            <label>
              <input type="checkbox" id="setting-atmosphere" ${preferences.showAtmosphere ? 'checked' : ''} />
              <span>Show Atmosphere</span>
            </label>
          </div>

          <div class="setting-group">
            <label>
              <span>Atmosphere Intensity</span>
              <input type="range" id="setting-atmos-intensity" min="0" max="2" step="0.1" 
                     value="${preferences.atmosphereIntensity}" />
              <span class="setting-value">${preferences.atmosphereIntensity.toFixed(1)}</span>
            </label>
          </div>

          <div class="setting-group">
            <label>
              <input type="checkbox" id="setting-daynight" ${preferences.dayNightCycle ? 'checked' : ''} />
              <span>Day/Night Cycle (Experimental)</span>
            </label>
          </div>

          <button class="close-modal" onclick="document.getElementById('settings-panel').remove()">
            Close (S)
          </button>
        </div>
      </div>
    `;
    
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 20000;
    `;
    
    document.body.appendChild(panel);

    // Add event listeners
    const autoRotateEl = document.getElementById('setting-autorotate');
    const rotationSpeedEl = document.getElementById('setting-rotation-speed');
    const cloudsEl = document.getElementById('setting-clouds');
    const atmosphereEl = document.getElementById('setting-atmosphere');
    const atmosIntensityEl = document.getElementById('setting-atmos-intensity');
    const dayNightEl = document.getElementById('setting-daynight');

    if (autoRotateEl) {
      autoRotateEl.addEventListener('change', () => {
        preferences.autoRotate = autoRotateEl.checked;
        savePreferences();
      });
    }

    if (rotationSpeedEl) {
      rotationSpeedEl.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 1000;
        preferences.rotationSpeed = value;
        e.target.nextElementSibling.textContent = e.target.value;
        savePreferences();
      });
    }

    if (cloudsEl) {
      cloudsEl.addEventListener('change', () => {
        preferences.showClouds = cloudsEl.checked;
        clouds.visible = preferences.showClouds;
        savePreferences();
      });
    }

    if (atmosphereEl) {
      atmosphereEl.addEventListener('change', () => {
        preferences.showAtmosphere = atmosphereEl.checked;
        atmosphere.visible = preferences.showAtmosphere;
        savePreferences();
      });
    }

    if (atmosIntensityEl) {
      atmosIntensityEl.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        preferences.atmosphereIntensity = value;
        if (atmosphere && atmosphere.material && atmosphere.material.uniforms) {
          atmosphere.material.uniforms.intensity.value = value;
        }
        e.target.nextElementSibling.textContent = value.toFixed(1);
        savePreferences();
      });
    }

    if (dayNightEl) {
      dayNightEl.addEventListener('change', () => {
        preferences.dayNightCycle = dayNightEl.checked;
        savePreferences();
      });
    }
  }

  // Notification system
  function showNotification(message, duration = 2000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 255, 255, 0.9);
      color: #000;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Help modal
  function toggleHelpModal() {
    let modal = document.getElementById('help-modal');
    if (modal) {
      modal.remove();
      return;
    }

    modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>🌍 Rdata: The Freedom Quest - Controls</h2>
          <div class="help-section">
            <h3>Mouse Controls:</h3>
            <ul>
              <li><strong>Left Click + Drag:</strong> Rotate globe</li>
              <li><strong>Click on Globe:</strong> Sample color and add marker</li>
              <li><strong>Scroll:</strong> Zoom in/out</li>
            </ul>
          </div>
          <div class="help-section">
            <h3>Keyboard Shortcuts:</h3>
            <ul>
              <li><strong>H:</strong> Show/hide this help</li>
              <li><strong>S:</strong> Open settings panel</li>
              <li><strong>C:</strong> Clear all markers</li>
              <li><strong>R:</strong> Reset camera position</li>
              <li><strong>P:</strong> Toggle auto-rotation</li>
              <li><strong>D:</strong> Toggle day/night cycle</li>
              <li><strong>+/-:</strong> Zoom in/out</li>
            </ul>
          </div>
          <div class="help-section">
            <h3>NASA Toolkit:</h3>
            <ul>
              <li>Use the HUD panel to access NASA APIs</li>
              <li>APOD: Astronomy Picture of the Day</li>
              <li>EONET: Earth natural events tracker</li>
            </ul>
          </div>
          <button class="close-modal" onclick="document.getElementById('help-modal').remove()">Close (H)</button>
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 20000;
    `;
    
    document.body.appendChild(modal);
  }

  // Update marker history UI
  function updateMarkerHistoryUI() {
    let historyPanel = document.getElementById('marker-history');
    if (!historyPanel) {
      historyPanel = document.createElement('div');
      historyPanel.id = 'marker-history';
      historyPanel.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ffff;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid rgba(0, 255, 255, 0.3);
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        font-size: 0.85rem;
        z-index: 1500;
      `;
      document.body.appendChild(historyPanel);
    }

    if (markerHistory.length === 0) {
      historyPanel.innerHTML = '<div style="opacity: 0.6;">No markers yet. Click the globe to add markers.</div>';
      return;
    }

    let html = '<div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 5px;">Marker History</div>';
    markerHistory.slice().reverse().forEach((entry, idx) => {
      html += `
        <div style="margin: 8px 0; padding: 8px; background: rgba(0,255,255,0.1); border-radius: 5px;">
          <div style="font-weight: bold;">${entry.label}</div>
          <div style="font-size: 0.75rem; opacity: 0.8;">
            Lat: ${entry.lat.toFixed(4)}, Lon: ${entry.lon.toFixed(4)}
          </div>
        </div>
      `;
    });
    historyPanel.innerHTML = html;
  }

  // Handle window resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    
    // Apply auto-rotation if enabled
    if (preferences.autoRotate) {
      globe.rotation.y += preferences.rotationSpeed;
      if (clouds.visible) clouds.rotation.y += preferences.rotationSpeed * 1.5;
    }

    // Day/night cycle simulation (experimental)
    if (preferences.dayNightCycle && directionalLight) {
      const cycleSpeed = 0.0001;
      const time = Date.now() * cycleSpeed;
      const intensity = 0.5 + Math.sin(time) * 0.5; // Oscillate between 0 and 1
      directionalLight.intensity = intensity;
      
      // Adjust ambient light inversely for night effect
      if (ambientLight) {
        ambientLight.intensity = 0.3 + (1 - intensity) * 0.3;
      }
    }
    
    controls.update(); // Update controls
    renderer.render(scene, camera);
  }

  animate();

  // Show welcome notification
  setTimeout(() => {
    showNotification('Press H for help, S for settings', 3000);
  }, 1000);

  // Initialize marker history UI
  updateMarkerHistoryUI();
}
