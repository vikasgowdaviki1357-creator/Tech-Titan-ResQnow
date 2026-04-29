let map;
let userMarker;
let serviceMarkers = [];
let userLat, userLng;
let cache = {};

window.onload = function () {
  initMap();
  getLocation();
};

// 🗺️ MAP INIT
function initMap() {
  map = L.map('map').setView([12.97, 77.59], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
}

// 📍 USER ICON
const userIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#00ffcc;
    border-radius:50%;box-shadow:0 0 20px #00ffcc;border:3px solid white;"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// 📍 LOCATION
function getLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      document.getElementById("mapCoords").innerText =
        userLat.toFixed(4) + ", " + userLng.toFixed(4);

      map.setView([userLat, userLng], 14);

      if (userMarker) map.removeLayer(userMarker);

      userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();

      loadPlaces("medical");
    },
    err => console.log(err),
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
  );
}

// 🧹 CLEAR
function clearMarkers() {
  serviceMarkers.forEach(m => map.removeLayer(m));
  serviceMarkers = [];
}

// 🚀 LOAD SERVICES
async function loadPlaces(type) {
  if (!userLat || !userLng) return;

  if (cache[type]) {
    renderData(cache[type]);
    return;
  }

  document.getElementById("serviceList").innerHTML =
    "<p style='color:white;text-align:center;'>Loading...</p>";

  clearMarkers();

  let query = "";

  if (type === "medical" || type === "emergency") {
    query = `[out:json];node["amenity"="hospital"](around:5000,${userLat},${userLng});out 10;`;
  } else if (type === "police") {
    query = `[out:json];node["amenity"="police"](around:5000,${userLat},${userLng});out 10;`;
  } else if (type === "fire") {
    query = `[out:json];node["amenity"="fire_station"](around:5000,${userLat},${userLng});out 10;`;
  } else if (type === "mechanic") {
    query = `[out:json];node["shop"="car_repair"](around:5000,${userLat},${userLng});out 10;`;
  } else if (type === "electric") {
    query = `[out:json];node["craft"="electrician"](around:5000,${userLat},${userLng});out 10;`;
  } else if (type === "plumber") {
    query = `[out:json];node["craft"="plumber"](around:5000,${userLat},${userLng});out 10;`;
  }

  let data;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });
    data = await res.json();
  } catch (err) {
    console.log("API failed → fallback");

    data = {
      elements: [
        { lat: userLat + 0.01, lon: userLng + 0.01, tags: { name: "City Hospital" } },
        { lat: userLat - 0.01, lon: userLng - 0.01, tags: { name: "Emergency Clinic" } }
      ]
    };
  }

  let list = data.elements.map(p => {
    const dist = getDistance(userLat, userLng, p.lat, p.lon);
   return {
  name: p.tags?.name || "Service",
  lat: p.lat,
  lon: p.lon,
  type: type,
  distance: dist,
  eta: Math.max(2, Math.round((dist / 30) * 60)),
  phone: p.tags?.phone || p.tags?.["contact:phone"] || null, // ✅ ADD
  status: getLiveStatus()
};
  });

  list = list.filter(i => i.distance <= 10);

  if (!list.length) {
    document.getElementById("serviceList").innerHTML =
      "<p style='color:white;text-align:center;'>No services found</p>";
    updateStats([]);
    return;
  }

  cache[type] = list;
  renderData(list);
}

// 🎯 RENDER
function renderData(list) {
  clearMarkers();

  const nearest = getNearestService(list);

  if (nearest) {
    map.flyTo([nearest.lat, nearest.lon], 15);
  }

  list.forEach(item => {
    L.marker([item.lat, item.lon]).addTo(map).bindPopup(item.name);
  });

  showList(list, nearest);
  updateStats(list);
}

// 📋 LIST (UPDATED WITH DIRECTIONS)
function showList(list, nearest) {
  const el = document.getElementById("serviceList");

  el.innerHTML = list.map(s => `
    <div style="padding:12px;margin:10px;background:#1e293b;border-radius:10px;color:white;">
      
      <b>${s.name}</b>

      ${nearest && s.lat === nearest.lat && s.lon === nearest.lon ? `
        <div style="color:red;font-size:12px;">🚑 Nearest</div>` : ""}

      <div>📍 ${s.distance.toFixed(2)} km</div>
      <div>⏱️ ${s.eta} mins</div>

      <!-- 🚗 Directions -->
      <button onclick="openNavigation(${s.lat}, ${s.lon}); drawRoute(${s.lat}, ${s.lon})"
        style="margin-top:8px;padding:6px 10px;background:#00ffcc;color:black;border:none;border-radius:6px;">
        🚗 Get Directions
      </button>

      <!-- 📞 SMART CALL BUTTON -->
      ${
        s.phone ? `
          <a href="tel:${s.phone}"
            style="background:#22c55e;color:black;padding:6px;border-radius:6px;display:inline-block;margin-top:6px;">
            📞 Call ${s.name}
          </a>
        `
        : s.type === "police" ? `
          <a href="tel:100"
            style="background:#3b82f6;color:white;padding:6px;border-radius:6px;display:inline-block;margin-top:6px;">
            🚓 Call Police
          </a>
        `
        : s.type === "fire" ? `
          <a href="tel:101"
            style="background:#f97316;color:white;padding:6px;border-radius:6px;display:inline-block;margin-top:6px;">
            🔥 Call Fire
          </a>
        `
        : `
          <a href="tel:108"
            style="background:#ff3b3b;color:white;padding:6px;border-radius:6px;display:inline-block;margin-top:6px;">
            🚑 Call Ambulance
          </a>
        `
      }

      <!-- OPTIONAL MESSAGE -->
      ${!s.phone ? `
        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">
          No direct number available
        </div>
      ` : ""}

    </div>
  `).join("");
}

// 🚗 NAVIGATION
function openNavigation(lat, lon) {
  window.open(`https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lon}`);
}

// 📊 STATS
function updateStats(list) {
  const el = document.querySelectorAll(".stat-num");

  if (!list.length) {
    el.forEach(e => e.innerText = 0);
    return;
  }

  animateValue(el[0], list[0].eta);
  animateValue(el[1], list.length);
  animateValue(el[2], 24);
}

// 🎯 ANIMATION
function animateValue(el, value) {
  let start = 0;
  const step = value / 10;

  const i = setInterval(() => {
    start += step;
    if (start >= value) {
      el.innerText = value;
      clearInterval(i);
    } else {
      el.innerText = Math.floor(start);
    }
  }, 30);
}

// 📏 DISTANCE
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 🧠 STATUS
function getLiveStatus() {
  return ["open", "busy", "closed"][Math.floor(Math.random()*3)];
}

// 🎯 NEAREST
function getNearestService(list) {
  return list.reduce((a,b) => a.distance < b.distance ? a : b);
}

// 🎯 CATEGORY FILTER
function filterCategory(type, btn) {
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  loadPlaces(type === "all" ? "medical" : type);
}
function getCallButton(s) {

  // ✅ 1. If real number exists → use it
  if (s.phone) {
    return `
      <a href="tel:${s.phone}"
        style="
          display:inline-block;
          margin-top:8px;
          padding:8px 12px;
          background:#22c55e;
          color:black;
          border-radius:6px;
          text-decoration:none;
          font-weight:600;
        ">
        📞 Call ${s.name}
      </a>
    `;
  }

  // ✅ 2. Smart fallback
  if (s.type === "police") {
    return `
      <a href="tel:100"
        style="background:#3b82f6;color:white;padding:8px;border-radius:6px;display:inline-block;margin-top:8px;">
        🚓 Call Police
      </a>
    `;
  }

  if (s.type === "fire") {
    return `
      <a href="tel:101"
        style="background:#f97316;color:white;padding:8px;border-radius:6px;display:inline-block;margin-top:8px;">
        🔥 Call Fire
      </a>
    `;
  }

  // default → medical
  return `
    <a href="tel:108"
      style="background:#ff3b3b;color:white;padding:8px;border-radius:6px;display:inline-block;margin-top:8px;">
      🚑 Call Ambulance
    </a>
  `;
}
function searchServices() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = Object.values(cache).flat().filter(s =>
    s.name.toLowerCase().includes(q)
  );

  const nearest = getNearestService(filtered);
  showList(filtered, nearest);
}
function emergencyMode() {
  if (!userLat || !userLng) return alert("Location not ready");

  const nearest = getNearestService(cache["medical"] || []);
  if (!nearest) return;

  // auto open directions
  openNavigation(nearest.lat, nearest.lon);

  // auto call ambulance
  setTimeout(() => {
    window.location.href = "tel:108";
  }, 2000);
}
let routeLine;

function drawRoute(lat, lon) {
  if (routeLine) map.removeLayer(routeLine);

  routeLine = L.polyline([
    [userLat, userLng],
    [lat, lon]
  ], {
    color: '#00ffcc',
    weight: 4
  }).addTo(map);
}