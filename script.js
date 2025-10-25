let watchId;
let path = [];
let distance = 0;

let startTime = 0;
let elapsedTime = 0;
let timerInterval;

// ---------------- Timer ----------------
function updateTimerDisplay() {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2,'0');
  const minutes = String(Math.floor((totalSeconds % 3600)/60)).padStart(2,'0');
  const seconds = String(totalSeconds % 60).padStart(2,'0');
  document.getElementById('timer').innerText = `Time: ${hours}:${minutes}:${seconds}`;
}

function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

// ---------------- Map Setup ----------------
const map = L.map('map')?.setView([56.3398, -2.7967], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

let polyline = L.polyline([], {color:'#2575fc', weight:5}).addTo(map);
let marker = L.marker([56.3398, -2.7967]).addTo(map);

// ---------------- Distance ----------------
function toRad(deg){ return deg*Math.PI/180; }

function getDistance(lat1, lon1, lat2, lon2){
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2-lat1);
  const Δλ = toRad(lon2-lon1);
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ---------------- Map Update ----------------
function updateMap(lat, lon){
  polyline.addLatLng([lat, lon]);
  marker.setLatLng([lat, lon]);
  map.setView([lat, lon]);
}

// ---------------- Score Persistence ----------------
function getTotalScore(){ return parseFloat(localStorage.getItem('totalScore'))||0; }
function updateTotalScore(newPoints){
  const total = getTotalScore()+newPoints;
  localStorage.setItem('totalScore', total.toFixed(2));
  const totalDisplay = document.getElementById('totalScoreDisplay');
  if(totalDisplay) totalDisplay.textContent = `Total Score: ${total.toFixed(2)}`;
  return total;
}

// ---------------- Start Journey ----------------
document.getElementById('startBtn')?.addEventListener('click', () => {
  if(!navigator.geolocation){ alert('Geolocation not supported'); return; }

  if(!watchId){
    distance = 0; path=[]; elapsedTime=0; updateTimerDisplay();
    document.getElementById('distance').innerText='Distance: 0 m';
    document.getElementById('score').innerText='Score: 0';
  }

  startTimer();

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const {latitude, longitude} = pos.coords;
      path.push({latitude, longitude});
      if(path.length>1){
        const last=path[path.length-2];
        distance+=getDistance(last.latitude,last.longitude,latitude,longitude);
      }
      document.getElementById('distance').innerText=`Distance: ${distance.toFixed(2)} m`;
      updateMap(latitude, longitude);
    },
    err => console.error(err),
    {enableHighAccuracy:true, maximumAge:1000, timeout:5000}
  );
});

// ---------------- Stop Journey ----------------
document.getElementById('stopBtn')?.addEventListener('click', () => {
  if(watchId){ navigator.geolocation.clearWatch(watchId); watchId=null; }
  stopTimer();

  const earned = distance/100;
  const total = updateTotalScore(earned);

  document.getElementById('score').innerText=`Score: ${earned.toFixed(2)}`;

  alert(`Journey stopped.\nDistance: ${distance.toFixed(2)} m\nTime: ${document.getElementById('timer').innerText.split(' ')[1]}\nScore earned: ${earned.toFixed(2)}\nTotal score: ${total.toFixed(2)}`);

  distance=0; elapsedTime=0; startTime=0; updateTimerDisplay();
  document.getElementById('distance').innerText='Distance: 0 m';
  path=[]; polyline.setLatLngs([]);
  marker.setLatLng([56.3398, -2.7967]);
  map.setView([56.3398, -2.7967],13);
});

// ---------------- Initialize total score display ----------------
const totalDisplay = document.getElementById('totalScoreDisplay');
if(totalDisplay) totalDisplay.textContent = `Total Score: ${getTotalScore().toFixed(2)}`;
