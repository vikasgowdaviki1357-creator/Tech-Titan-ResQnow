let map;
let userMarker;
let serviceMarkers = [];

window.onload = function () {
  initMap();
  getLocation();
};

// MAP INIT
function initMap() {
  map = L.map('map').setView([12.97, 77.59], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
}

// LOCATION
function getLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    document.getElementById("mapCoords").innerText =
      lat.toFixed(4) + ", " + lon.toFixed(4);

    map.setView([lat, lon], 14);

    // USER MARKER
    userMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup("📍 You are here")
      .openPopup();

    getNearbyHospitals(lat, lon);
  });
}

// API
async function getNearbyHospitals(lat, lon) {
  const query = `
    [out:json];
    node["amenity"="hospital"](around:10000,${lat},${lon});
    out;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  });

  const data = await response.json();

  const hospitals = [];

  serviceMarkers.forEach(m => m.remove());
  serviceMarkers = [];

  data.elements.slice(0, 10).forEach(place => {
    const name = place.tags?.name || "Hospital";

    const hospitalIcon = L.divIcon({
  html: "🏥",
  className: "",
  iconSize: [30, 30],
});

const marker = L.marker([place.lat, place.lon], {
  icon: hospitalIcon
}).addTo(map)
  .bindPopup("🏥 " + name);

    serviceMarkers.push(marker);

    hospitals.push({
      name,
      lat: place.lat,
      lon: place.lon
    });
  });

  showList(hospitals);
}

// LIST
function showList(list) {
  const el = document.getElementById("serviceList");

  el.innerHTML = list.map(s => `
    <div style="padding:10px;margin:10px;background:#1e293b;color:white;border-radius:8px;">
      🏥 ${s.name}
    </div>
  `).join("");
}

// DUMMY FIXES
function filterSearch() {}
function filterCategory() {}