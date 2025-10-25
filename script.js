let watchId;
let path = [];
let distance = 0;

// Timer variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval;

function updateTimerDisplay() {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('timer').innerText = `Time: ${hours}:${minutes}:${seconds}`;
}

function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Existing map setup
const map = L.map('map').setView([0, 0], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let polyline = L.polyline([], { color: '#2575fc', weight: 5 }).addTo(map);
let marker = L.marker([0,0]).addTo(map);

function toRad(deg) { return deg * Math.PI / 180; }

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function updateMap(lat, lon) {
  polyline.addLatLng([lat, lon]);
  marker.setLatLng([lat, lon]);
  map.setView([lat, lon]);
}

// Start Journey
document.getElementById('startBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  // Reset only if this is a new journey
  if (!watchId) {
    distance = 0;
    path = [];
    elapsedTime = 0;
    updateTimerDisplay();
  }

  startTimer();

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      path.push({ latitude, longitude });

      if (path.length > 1) {
        const last = path[path.length - 2];
        distance += getDistance(last.latitude, last.longitude, latitude, longitude);
      }

      document.getElementById('distance').innerText = `Distance: ${distance.toFixed(2)} m`;
      updateMap(latitude, longitude);
    },
    (err) => console.error(err),
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
  );
});

// Stop Journey
document.getElementById('stopBtn').addEventListener('click', () => {
  navigator.geolocation.clearWatch(watchId);  // stop tracking

  alert(`Journey stopped. Total distance: ${distance.toFixed(2)} meters.`);

  // Send journey data to backend
  fetch('http://localhost:5000/submit-journey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ path, distance, time })
  })
  .then(response => response.json())
  .then(data => {
    alert(`Journey data submitted successfully! Total distance: ${distance.toFixed(2)} meters.`);
  })
  .catch(error => {
    console.error('Error submitting journey data:', error);
    alert('Failed to submit journey data.');
  });
});
