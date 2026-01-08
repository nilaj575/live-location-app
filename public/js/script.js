const socket = io("/");

const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Live Location Tracker",
}).addTo(map);

const markers = {};
let mapCentered = false;

const geoOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000,
};

// 🎯 SUCCESS
function successHandler(position) {
    const { latitude, longitude } = position.coords;

    socket.emit("send-location", { latitude, longitude });

    if (!mapCentered) {
        map.setView([latitude, longitude], 16);
        mapCentered = true;
    }
}

// 🛟 FALLBACK (PERMANENT FIX)
function errorHandler() {
    console.warn("GPS failed → Using IP-based location");

    fetch("https://ipapi.co/json/")
        .then(res => res.json())
        .then(data => {
            const { latitude, longitude } = data;

            socket.emit("send-location", { latitude, longitude });
            map.setView([latitude, longitude], 12);
        })
        .catch(() => {
            console.error("Location completely unavailable");
        });
}

// 🚀 START
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        successHandler,
        errorHandler,
        geoOptions
    );

    navigator.geolocation.watchPosition(
        successHandler,
        errorHandler,
        geoOptions
    );
}
