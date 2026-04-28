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
  html: `
    <div style="position:relative;">
      <div style="
        width:20px;height:20px;background:#00ffcc;
        border-radius:50%;border:3px solid white;
        position:relative;z-index:2;"></div>

      <div style="
        position:absolute;
        width:40px;height:40px;
        background:#00ffcc;
        border-radius:50%;
        top:-10px;left:-10px;
        opacity:0.4;
        animation:pulse 1.5s infinite;">
      </div>
    </div>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// 📍 LOCATION
function getLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    document.getElementById("mapCoords").innerText =
      userLat.toFixed(4) + ", " + userLng.toFixed(4);

    map.flyTo([userLat, userLng], 14);

    userMarker = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup("📍 You are here")
      .openPopup();

    setTimeout(() => {
      loadPlaces("medical");
    }, 15000);
  });
}

// 🧹 CLEAR MARKERS
function clearMarkers() {
  serviceMarkers.forEach(m => m.remove());
  serviceMarkers = [];
}

// 🚀 LOAD SERVICES
async function loadPlaces(type) {
  if (!userLat || !userLng) return;

  if (cache[type]) {
    renderData(cache[type]);
    return;
  }

  document.getElementById("serviceList").innerHTML = `
  <div style="text-align:center;color:white;">
    <div style="
      width:30px;height:30px;
      border:4px solid #ccc;
      border-top:4px solid #00ffcc;
      border-radius:50%;
      animation:spin 1s linear infinite;
      margin:auto;">
    </div>
    <p>Loading nearby services...</p>
  </div>
`;

  clearMarkers();

  let emoji = "🏥";
  let color = "#ff3b3b";
  let query = "";

  if (type === "medical" || type === "emergency") {
    query = `[out:json];node["amenity"="hospital"](around:3000,${userLat},${userLng});out 10;`;
  } else if (type === "police") {
    emoji = "🚓"; color = "#3b82f6";
    query = `[out:json];node["amenity"="police"](around:3000,${userLat},${userLng});out 10;`;
  } else if (type === "fire") {
    emoji = "🔥"; color = "#f97316";
    query = `[out:json];node["amenity"="fire_station"](around:3000,${userLat},${userLng});out 10;`;
  } else if (type === "mechanic") {
    emoji = "🔧"; color = "#9ca3af";
    query = `[out:json];node["shop"="car_repair"](around:3000,${userLat},${userLng});out 10;`;
  } else if (type === "electric") {
    emoji = "⚡"; color = "#facc15";
    query = `[out:json];node["craft"="electrician"](around:3000,${userLat},${userLng});out 10;`;
  } else if (type === "plumber") {
    emoji = "🔩"; color = "#06b6d4";
    query = `[out:json];node["craft"="plumber"](around:3000,${userLat},${userLng});out 10;`;
  }

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });

    const data = await res.json();

    if (!data.elements.length) {
      document.getElementById("serviceList").innerHTML =
        "<p style='text-align:center;color:white;'>No services found</p>";
      updateStats([]);
      return;
    }

    // ✅ ADD DISTANCE + ETA HERE
    const list = data.elements.map(place => {
      const distance = getDistance(userLat, userLng, place.lat, place.lon);
      const speed = 30; // km/h
const eta = Math.max(2, Math.round((distance / speed) * 60));

      return {
        name: place.tags?.name || "Service",
        lat: place.lat,
        lon: place.lon,
        type,
        icon: createIcon(color, emoji),
        distance: distance.toFixed(2),
        eta
      };
    });

    cache[type] = list;
    renderData(list);

  } catch (err) {
    document.getElementById("serviceList").innerHTML =
      "⚠️ Network error, try again.";
  }
}

// 🎯 RENDER
function renderData(list) {
  clearMarkers();

  list.forEach(item => {
    const marker = L.marker([item.lat, item.lon], { icon: item.icon })
      .addTo(map)
      .bindPopup(`${getEmoji(item.type)} ${item.name}`);

    serviceMarkers.push(marker);
  });

  showList(list);
  updateStats(list);
}

// 🎨 ICON
function createIcon(color, emoji) {
  return L.divIcon({
    html: `<div style="
      width:40px;height:40px;background:${color};
      border-radius:50%;display:flex;
      align-items:center;justify-content:center;color:white;">
      ${emoji}
    </div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

// 📋 LIST WITH ETA
function showList(list) {
  const el = document.getElementById("serviceList");

  el.innerHTML = list.map(s => `
    <div style="
      padding:15px;
      margin:12px;
      background:#1e293b;
      color:white;
      border-radius:12px;
    ">
      <div style="font-weight:600;">
        ${getEmoji(s.type)} ${s.name}
      </div>

      <div style="color:#9ca3af;font-size:13px;">
        📍 ${s.distance} km away
      </div>

      <div style="color:#22c55e;font-size:13px;">
        ⏱️ ${s.eta} mins away
      </div>

      <button onclick="openNavigation(${s.lat}, ${s.lon})"
        style="
          margin-top:10px;
          padding:8px 12px;
          background:#00ffcc;
          border:none;
          border-radius:6px;
          cursor:pointer;
        ">
        🚗 Get Directions
      </button>
    </div>
  `).join("");
}

// 🎯 BUTTONS
function filterCategory(type) {
  loadPlaces(type === "all" ? "medical" : type);
}

// 📊 STATS
function updateStats(list) {
  const el = document.querySelectorAll(".stat-num");

  if (!list.length) {
    el.forEach(e => e.innerText = 0);
    return;
  }

  el[0].innerText = list[0].eta;
  el[1].innerText = list.length;
  el[2].innerText = 24;
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

// 🧭 NAVIGATION
function openNavigation(lat, lon) {
  window.open(`https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lon}`);
}

// 🎨 EMOJI
function getEmoji(type) {
  return {
    medical:"🏥", police:"🚓", fire:"🔥",
    mechanic:"🔧", electric:"⚡", plumber:"🔩", emergency:"🚨"
  }[type] || "📍";
}

// 🚨 SOS
function sendSOS() {
  const msg = `🚨 Emergency! https://maps.google.com/?q=${userLat},${userLng}`;
  alert(msg);
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

// 🔐 LOGOUT
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
const speed = Math.random() > 0.5 ? 25 : 35;
const eta = Math.max(2, Math.round((distance / speed) * 60));