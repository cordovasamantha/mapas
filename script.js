'use strict';

/*
  Mapa interactivo con Leaflet + OpenStreetMap.
  Carga datos desde un Google Sheets público (CSV), crea marcadores con tooltip y popup.
  Incluye opción "Cómo llegar" que abre Google Maps con la dirección precargada.

  Notas:
  - Si la hoja incluye columnas Latitud y Longitud, se usan directamente.
  - Si NO incluye coordenadas, se intenta geocodificar la Dirección con Nominatim (OSM),
    guardando resultados en localStorage y aplicando un retardo entre peticiones.
  - Para un rendimiento y fiabilidad óptimos, se recomienda añadir columnas Latitud/Longitud al Sheet.
*/

// =============== CONFIGURACIÓN ==================
const DATA_MODE = 'csv'; // 'wordpress' | 'opensheet' | 'csv'
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmJpHUjla_aC3_3PUrju45_EGkVzpel7GPXQpRHlbnt_00ECp-tzlBWKHBZX9JRq72-d87pPdYHL1M/pub?output=csv';

// Color del pin (SVG)
<<<<<<< HEAD
const PIN_COLOR = '#272556';
=======
const PIN_COLOR = '#e21054';
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38

// Retardo (ms) entre geocodificaciones para respetar Nominatim
const GEOCODE_DELAY_MS = 900;

<<<<<<< HEAD
// Preferencia: si hay columna combinada "Coordenadas", usarla primero
const PREFER_COORDINATE_FIELD = true;

// Forzar orden de par combinado de coordenadas: 'auto' | 'latlng' | 'lnglat'
const FORCE_COORDINATE_ORDER = 'auto';

// Pista opcional de límites geográficos para resolver ambigüedad (ej. México)
// Deja null si no quieres usarlo. Ejemplo MX: { minLat: 14, maxLat: 33, minLng: -118, maxLng: -86 }
const BOUNDS_HINT = null;
=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
// Centro y zoom inicial (se ajusta luego a los marcadores)
const INITIAL_VIEW = { center: [19.4326, -99.1332], zoom: 5 }; // CDMX aprox.

// =================================================

// Aviso si se abre con file:// (origen null) — puede provocar bloqueos CORS en algunos servicios
if (location.protocol === 'file:') {
  console.warn('Estás abriendo el archivo con file://. Usa un servidor local (p. ej., "python3 -m http.server") para evitar CORS por origen null.');
}

document.addEventListener('DOMContentLoaded', async () => {
  const map = L.map('map', {
    scrollWheelZoom: true,
    zoomControl: true,
  });

  // Capa base OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.setView(INITIAL_VIEW.center, INITIAL_VIEW.zoom);

  // Contenedor de marcadores para calcular límites
  const markersGroup = L.featureGroup().addTo(map);
  const allMarkers = [];
<<<<<<< HEAD
  const infoBar = document.getElementById('infoBar');
=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38

  // Fijar el icono por defecto para TODOS los marcadores
  L.Marker.prototype.options.icon = generatePinIcon(PIN_COLOR);

  try {
    const rows = await loadRows();
    console.info(`[MAPA] Filas cargadas: ${rows.length}`);

    // Normaliza y mapea columnas esperadas
    const places = mapRowsToSchema(rows);
    console.info(`[MAPA] Registros normalizados: ${places.length}`);

    // Crea marcadores (geocodifica si hace falta)
    let created = 0, failed = 0, geocoded = 0, usedLatLng = 0, skipped = 0;
    for (const place of places) {
      const coords = await getCoordsForPlace(place);
      if (!coords) { skipped++; continue; }
      if (toNumberOrNull(place.latitud) != null && toNumberOrNull(place.longitud) != null) usedLatLng++; else geocoded++;

      const marker = L.marker(coords, { icon: generatePinIcon(PIN_COLOR) })
        .bindTooltip(place.nombre || place.direccion || 'Ubicación', {
          direction: 'top',
          offset: [0, -28]
        })
        .bindPopup(createPopupHtml(place), { closeButton: true });

      try {
        marker.addTo(markersGroup);
        allMarkers.push({ marker, place });
<<<<<<< HEAD
        // Actualiza barra inferior al hacer clic
        marker.on('click', () => updateInfoBar(place));
=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
        created++;
      } catch (e) {
        failed++;
        console.warn('[MAPA] Falló al agregar marcador:', e);
      }
    }

    console.info(`[MAPA] Marcadores => creados: ${created}, geocodificados: ${geocoded}, con lat/lng: ${usedLatLng}, fallidos: ${failed}, sin coords: ${skipped}`);

    // Ajusta el mapa a los marcadores
    const bounds = markersGroup.getBounds();
    if (bounds.isValid()) {
<<<<<<< HEAD
      // Si sólo hay un marcador, enfocar con zoom fijo (evita problemas de fitBounds en punto único)
      if (allMarkers.length === 1) {
        map.setView(allMarkers[0].marker.getLatLng(), 16);
      } else {
        map.fitBounds(bounds.pad(0.12));
      }
=======
      map.fitBounds(bounds.pad(0.12));
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
    }

    // Arregla el tamaño del mapa si el contenedor cambia (p. ej., en WordPress)
    setTimeout(() => map.invalidateSize(), 100);
    window.addEventListener('resize', () => map.invalidateSize());

    // Wire del filtro de búsqueda
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', () => applyFilter(input.value, markersGroup, allMarkers, map));
    }
  } catch (err) {
    console.error('Error cargando datos:', err);
    alert('No se pudieron cargar los datos. Revisa el modo de datos (wordpress/opensheet/csv) y la URL configurada.');
  }
});

// ------------------- Utilidades principales -------------------

<<<<<<< HEAD
function updateInfoBar(place) {
  if (!infoBar) return;
  const name = escapeHtml(String(place.nombre || '').trim());
  const desc = escapeHtml(String(place.descripcion || '').trim());
  const content = (name || desc)
    ? `${name ? `<strong>${name}</strong>` : ''}${name && desc ? ' — ' : ''}${desc || ''}`
    : 'Selecciona un lugar para ver el nombre y descripción.';
  infoBar.innerHTML = content;
}

=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
async function fetchCsv(url) {
  const res = await fetch(url, { mode: 'cors', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  // Si Google devuelve HTML (login/preview) en lugar de CSV, avisamos claramente
  if (!contentType.includes('text/csv') && text.trim().startsWith('<')) {
    throw new Error('La respuesta no es CSV (¿usaste el enlace de "Publicar en la web" o "export?format=csv"?).');
  }
  return text;
}

async function fetchJson(url) {
  const res = await fetch(url, { mode: 'cors', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function loadRows() {
  if (DATA_MODE === 'wordpress') {
    const csvText = await fetchCsv(WP_PROXY_URL);
    return parseCsvToObjects(csvText);
  }
  if (DATA_MODE === 'opensheet') {
    const arr = await fetchJson(OPENSHEET_URL);
    if (!Array.isArray(arr)) throw new Error('OpenSheet no devolvió un arreglo JSON');
    // Normaliza claves a lower+sin tildes
    return arr.map(rec => {
      const norm = {};
      Object.keys(rec).forEach(k => {
        norm[normalizeHeader(k)] = String(rec[k] ?? '').trim();
      });
      return norm;
    });
  }
  // DATA_MODE === 'csv'
  const csvText = await fetchCsv(SHEET_CSV_URL);
  return parseCsvToObjects(csvText);
}

function parseCsvToObjects(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length === 0) return [];

  const rawHeaders = rows[0];
  const dataRows = rows.slice(1);
  const normalizedHeaders = rawHeaders.map(h => normalizeHeader(h));

  return dataRows
    .filter(r => r.some(cell => String(cell || '').trim().length > 0))
    .map(row => {
      const obj = {};
      row.forEach((cell, idx) => {
        obj[normalizedHeaders[idx] || `col_${idx}`] = String(cell || '').trim();
      });
      return obj;
    });
}

function mapRowsToSchema(objs) {
  // Mapeo flexible de encabezados -> campos esperados
  const headerMap = {
    nombre: ['nombre', 'name'],
<<<<<<< HEAD
    direccion: ['direccion', 'descripción', 'address', 'ubicacion', 'ubicación'],
    descripcion: ['descripcion', 'descripción', 'description', 'detalle', 'resumen'],
    coordenadas: ['coordenadas', 'coordinates', 'latlon', 'lonlat', 'coord', 'ubicacion coords'],
=======
    direccion: ['direccion', 'dirección', 'address', 'ubicacion', 'ubicación'],
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
    contacto: ['contacto', 'contact', 'telefono', 'teléfono', 'email', 'correo', 'web', 'sitio', 'sitio web'],
    horarios: ['horarios', 'horario', 'hours', 'schedule'],
    horarios2: ['horarios 2', 'horarios2', 'hours 2', 'schedule 2'],
    tarifaAdultos: ['tarifa adultos', 'adultos', 'tarifa general', 'precio adultos'],
    tarifaExtranjeros: ['tarifa extranjeros', 'extranjeros', 'precio extranjeros'],
    tarifaEstudiantes: ['tarifa estudiantes', 'estudiantes', 'precio estudiantes'],
    latitud: ['latitud', 'lat', 'latitude'],
    longitud: ['longitud', 'lng', 'long', 'longitude']
  };

  function pick(obj, keys) {
    for (const k of keys) {
      const nk = normalizeHeader(k);
      if (obj[nk] != null && String(obj[nk]).trim() !== '') return String(obj[nk]).trim();
    }
    return '';
  }

  return objs.map(o => ({
    nombre: pick(o, headerMap.nombre),
    direccion: pick(o, headerMap.direccion),
<<<<<<< HEAD
    descripcion: pick(o, headerMap.descripcion),
    coordenadas: pick(o, headerMap.coordenadas),
=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
    contacto: pick(o, headerMap.contacto),
    horarios: pick(o, headerMap.horarios),
    horarios2: pick(o, headerMap.horarios2),
    tarifaAdultos: pick(o, headerMap.tarifaAdultos),
    tarifaExtranjeros: pick(o, headerMap.tarifaExtranjeros),
    tarifaEstudiantes: pick(o, headerMap.tarifaEstudiantes),
    latitud: pick(o, headerMap.latitud),
    longitud: pick(o, headerMap.longitud)
  }));
}

<<<<<<< HEAD
function parseCoordinatePair(text) {
  // Limpia y normaliza el texto de entrada
  const s = String(text || '').trim()
    .replace(/\s+/g, ' ')               // normaliza espacios
    .replace(/[[\]()]/g, '')            // elimina corchetes/paréntesis
    .replace(/\s*[;,|]\s*/g, ',')       // normaliza separadores (coma, punto y coma, pipe)
    .replace(/\s*,\s*/g, ',');          // normaliza comas

  // Si hay orden forzado, respétalo cuando sea posible
  if (FORCE_COORDINATE_ORDER === 'latlng' || FORCE_COORDINATE_ORDER === 'lnglat') {
    const parts = s.split(/[,\s]+/);
    if (parts.length >= 2) {
      const a = toNumberOrNull(parts[0]);
      const b = toNumberOrNull(parts[1]);
      if (a !== null && b !== null) {
        return FORCE_COORDINATE_ORDER === 'latlng' ? [a, b] : [b, a];
      }
    }
  }

  // Intento estándar: "lat,lng" o "lat lng" (ahora acepta ; o | porque los normalizamos arriba)
  const parts = s.split(/[,\s]+/);
  if (parts.length === 2) {
    const [pa, pb] = parts.map(x => toNumberOrNull(x));
    if (pa !== null && pb !== null) {
      const c1 = isValidLat(pa) && isValidLng(pb) ? [pa, pb] : null;
      const c2 = isValidLat(pb) && isValidLng(pa) ? [pb, pa] : null;
      if (c1 && !c2) return c1;
      if (c2 && !c1) return c2;
      if (c1 && c2 && BOUNDS_HINT) {
        const in1 = isInsideBounds(c1[0], c1[1], BOUNDS_HINT);
        const in2 = isInsideBounds(c2[0], c2[1], BOUNDS_HINT);
        if (in1 && !in2) return c1;
        if (in2 && !in1) return c2;
      }
      if (c1) return c1; // por defecto
    }
  }

  // Extrae el primer par de números si el formato es libre
  const matches = s.match(/[-+]?\d+(?:[.,]\d+)?/g);
  if (matches && matches.length >= 2) {
    const a = toNumberOrNull(matches[0]);
    const b = toNumberOrNull(matches[1]);
    if (a !== null && b !== null) {
      const c1 = isValidLat(a) && isValidLng(b) ? [a, b] : null;
      const c2 = isValidLat(b) && isValidLng(a) ? [b, a] : null;
      if (c1 && !c2) return c1;
      if (c2 && !c1) return c2;
      if (c1 && c2 && BOUNDS_HINT) {
        const in1 = isInsideBounds(c1[0], c1[1], BOUNDS_HINT);
        const in2 = isInsideBounds(c2[0], c2[1], BOUNDS_HINT);
        if (in1 && !in2) return c1;
        if (in2 && !in1) return c2;
      }
      if (c1) return c1;
    }
  }
  return null;
}

async function getCoordsForPlace(place) {
  // Si hay coordenadas explícitas en lat/lng, úsalas primero
  const lat = toNumberOrNull(place.latitud);
  const lng = toNumberOrNull(place.longitud);
  
  if (lat !== null && lng !== null) {
    // Verifica el rango de las coordenadas
    if (isValidLat(lat) && isValidLng(lng)) {
      console.debug(`[MAPA][coords] explícitas OK para ${place.nombre}: lat=${lat}, lng=${lng}`);
      return [lat, lng];
    }
    // Si están invertidas, hacer swap
    if (isValidLat(lng) && isValidLng(lat)) {
      console.debug(`[MAPA][coords] detectadas invertidas para ${place.nombre}, corrigiendo a lat=${lng}, lng=${lat}`);
      return [lng, lat];
    }
  }

  // Intenta usar el campo de coordenadas combinado
  const coordField = String(place.coordenadas || '').trim();
  if (coordField) {
    const parsed = parseCoordinatePair(coordField);
    if (parsed) {
      const [coord1, coord2] = parsed;
      if (isValidLat(coord1) && isValidLng(coord2)) {
        console.debug(`[MAPA][coords] campo combinado usado para ${place.nombre}: lat=${coord1}, lng=${coord2}`);
        return [coord1, coord2];
      } else if (isValidLat(coord2) && isValidLng(coord1)) {
        console.debug(`[MAPA][coords] campo combinado invertido para ${place.nombre}, corrigiendo a lat=${coord2}, lng=${coord1}`);
        return [coord2, coord1];
      }
    }
  }

  // Si no hay coordenadas válidas, intenta geocodificar
  const addr = String(place.direccion || '').trim();
  if (!addr) {
    console.warn(`[MAPA] No hay dirección para geocodificar: ${place.nombre}`);
    return null;
  }

  const cached = getCachedGeocode(addr);
  if (cached) {
    console.log(`[MAPA] Usando coordenadas cacheadas para ${place.nombre}: ${cached.lat},${cached.lng}`);
    // Asegura el orden correcto para Leaflet
    return [cached.lat, cached.lng];
  }

  console.log(`[MAPA] Geocodificando dirección para ${place.nombre}: ${addr}`);
  const geo = await geocodeAddressNominatim(addr);
  if (!geo) {
    console.warn(`[MAPA] Falló la geocodificación para: ${place.nombre}`);
    return null;
  }

  setCachedGeocode(addr, geo.lat, geo.lng);
  await sleep(GEOCODE_DELAY_MS);
  // Asegura el orden correcto para Leaflet
=======
async function getCoordsForPlace(place) {
  // Usa lat/lng si están disponibles
  const lat = toNumberOrNull(place.latitud);
  const lng = toNumberOrNull(place.longitud);
  if (lat != null && lng != null) return [lat, lng];

  // Si no hay coords, intenta geocodificar la dirección
  const addr = (place.direccion || '').trim();
  if (!addr) return null;

  const cached = getCachedGeocode(addr);
  if (cached) return [cached.lat, cached.lng];

  const geo = await geocodeAddressNominatim(addr);
  if (!geo) return null;

  setCachedGeocode(addr, geo.lat, geo.lng);
  // Pequeño retardo entre peticiones para respetar al servicio
  await sleep(GEOCODE_DELAY_MS);
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
  return [geo.lat, geo.lng];
}

function createPopupHtml(place) {
  const nombreRaw = String(place.nombre || '').trim();
  const direccionRaw = String(place.direccion || '').trim();
  const contactoRaw = String(place.contacto || '').trim();
  const horariosRaw = String(place.horarios || '').trim();
  const horarios2Raw = String(place.horarios2 || '').trim();
  const taRaw = String(place.tarifaAdultos || '').trim();
  const teRaw = String(place.tarifaExtranjeros || '').trim();
  const tsRaw = String(place.tarifaEstudiantes || '').trim();

  const nombre = nombreRaw ? escapeHtml(nombreRaw) : '';
  const direccion = direccionRaw ? escapeHtml(direccionRaw) : '';
  const contacto = contactoRaw ? formatContact(contactoRaw) : '';
  const horarios = horariosRaw ? escapeHtml(horariosRaw) : '';
  const horarios2Block = horarios2Raw
    ? `<div><span class="label">Horarios 2</span><span class="value"> ${escapeHtml(horarios2Raw)}</span></div>`
    : '';
  const ta = taRaw ? escapeHtml(taRaw) : '';
  const te = teRaw ? escapeHtml(teRaw) : '';
  const ts = tsRaw ? escapeHtml(tsRaw) : '';

  const rows = [];
  if (direccion) rows.push(`<div><span class="label">Dirección</span><span class="value"> ${direccion}</span></div>`);
  if (contacto) rows.push(`<div><span class="label">Contacto</span><span class="value"> ${contacto}</span></div>`);
  if (horarios) rows.push(`<div><span class="label">Horarios</span><span class="value"> ${horarios}</span></div>`);
  if (horarios2Block) rows.push(horarios2Block);
  if (ta) rows.push(`<div><span class="label">Tarifa Adultos</span><span class="value"> ${ta}</span></div>`);
  if (te) rows.push(`<div><span class="label">Tarifa Extranjeros</span><span class="value"> ${te}</span></div>`);
  if (ts) rows.push(`<div><span class="label">Tarifa Estudiantes</span><span class="value"> ${ts}</span></div>`);

  const destinationBase = direccionRaw || nombreRaw || '';
  const destination = encodeURIComponent(destinationBase);
  const routeBtn = destinationBase
    ? `<a class="route-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${destination}">Cómo llegar</a>`
    : '';

  return `
    <div class="popup-content">
      ${nombre ? `<h3>${nombre}</h3>` : ''}
      ${rows.length ? `<div class="popup-table">${rows.join('')}</div>` : ''}
      ${routeBtn}
    </div>
  `;
}

// ------------------- Geocodificación (Nominatim) -------------------

async function geocodeAddressNominatim(address) {
  try {
    const params = new URLSearchParams({
      format: 'json',
      q: address,
      addressdetails: '0',
      limit: '1'
      // Nota: Nominatim recomienda identificar la app (header User-Agent). En navegador no es posible fijarlo.
      // Usa este geocoder con moderación. Para producción, considera un servicio con API key.
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const best = data[0];
    const lat = toNumberOrNull(best.lat);
    const lng = toNumberOrNull(best.lon);
    if (lat == null || lng == null) return null;
    return { lat, lng };
  } catch (e) {
    console.warn('Geocoding error:', e);
    return null;
  }
}

function getCachedGeocode(address) {
  try {
    const key = `geocodeCache::${address}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (typeof obj?.lat === 'number' && typeof obj?.lng === 'number') return obj;
    return null;
  } catch { return null; }
}

function setCachedGeocode(address, lat, lng) {
  try {
    const key = `geocodeCache::${address}`;
    localStorage.setItem(key, JSON.stringify({ lat, lng }));
  } catch { /* almacenamiento puede fallar en modo privado */ }
}

// ------------------- Helpers -------------------

function generatePinIcon(hexColor) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.35"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path filter="url(#shadow)" fill="${hexColor}" d="M12.5 0C5.596 0 0 5.596 0 12.5 0 20.938 12.5 41 12.5 41S25 20.938 25 12.5C25 5.596 19.404 0 12.5 0z"/>
  <circle cx="12.5" cy="12.5" r="5.5" fill="#ffffff"/>
</svg>`;
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return L.icon({
    iconUrl: url,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -34]
  });
}

function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { // doble comilla => comilla escapada
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true; i++; continue;
      }
      if (char === ',') {
        row.push(field); field = ''; i++; continue;
      }
      if (char === '\n') {
        row.push(field); rows.push(row); field = ''; row = []; i++; continue;
      }
      if (char === '\r') { // Windows CRLF
        i++;
        continue;
      }
      field += char; i++;
    }
  }
  // último campo/registro si termina sin salto de línea
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

function toNumberOrNull(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

<<<<<<< HEAD
function isValidLat(n) { return typeof n === 'number' && n >= -90 && n <= 90; }
function isValidLng(n) { return typeof n === 'number' && n >= -180 && n <= 180; }

function isInsideBounds(lat, lng, b) {
  if (!b) return true;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

=======
>>>>>>> f163d1be3b809909837a7cea24b0e138f3d67d38
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isLikelyUrl(s) {
  try { const u = new URL(s.startsWith('http') ? s : `https://${s}`); return !!u.host; } catch { return false; }
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
}

function telSanitize(s) {
  return String(s).replace(/[^+\d]/g, '');
}

function formatContact(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (isEmail(v)) return `<a href="mailto:${escapeHtml(v)}">${escapeHtml(v)}</a>`;
  if (isLikelyUrl(v)) {
    const href = v.startsWith('http') ? v : `https://${v}`;
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(v)}</a>`;
  }
  if (/\d{6,}/.test(v)) {
    const tel = telSanitize(v);
    return `<a href="tel:${tel}">${escapeHtml(v)}</a>`;
  }
  return escapeHtml(v);
}

// ------------------- Filtro de búsqueda -------------------

function applyFilter(query, group, allMarkers, map) {
  const q = normalizeHeader(String(query || ''));
  let visible = 0;
  const tempGroup = L.featureGroup();

  for (const { marker, place } of allMarkers) {
    const haystack = normalizeHeader(`${place.nombre || ''} ${place.direccion || ''}`);
    const match = q.length === 0 || haystack.includes(q);
    if (match) {
      tempGroup.addLayer(marker);
      visible++;
    }
  }

  // Reemplaza el contenido del grupo con los visibles
  group.clearLayers();
  tempGroup.eachLayer(l => group.addLayer(l));

  // Ajusta vista
  const b = group.getBounds();
  if (visible > 0 && b.isValid()) {
    map.fitBounds(b.pad(0.12));
  } else {
    map.setView(INITIAL_VIEW.center, INITIAL_VIEW.zoom);
  }
}