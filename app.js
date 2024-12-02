const key = CryptoJS.enc.Utf8.parse("1234567890123456");
const iv = CryptoJS.enc.Utf8.parse("1234567890123456");

function getLocation() {
    console.log("getLocation called");
    AMap.plugin('AMap.Geolocation', function() {
        console.log("AMap plugin loaded");
        var geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 30000, // 增加超时时间到30秒
            maximumAge: 0,
            convert: true,
            showButton: true,
            buttonPosition: 'LB',
            buttonOffset: new AMap.Pixel(10, 20),
            showMarker: true,
            showCircle: true,
            panToLocation: true,
            zoomToAccuracy: true
        });
        geolocation.getCurrentPosition(function(status, result) {
            console.log(`Geolocation status: ${status}`);
            if (status === 'complete') {
                showPosition(result); // 在定位成功时调用 showPosition 函数
            } else {
                onError(result);
            }
        });
    });
}

function showPosition(position) {
    console.log("showPosition called"); // 添加调试日志
    const latitude = position.position.lat;  // 适用于高德地图API的结构
    const longitude = position.position.lng; // 适用于高德地图API的结构
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // 输出位置信息

    // Encrypt location data
    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify({ latitude, longitude }), key, { iv }
    ).toString();
    console.log(`Encrypted location: ${encrypted}`); // 输出加密后的位置信息

    document.getElementById("location").innerHTML = `
        Encrypted location: ${encrypted}<br>
        Decrypted location: ${decryptLocation(encrypted)}
    `;

    // Use Amap API to get nearby POIs
    getPOIs(latitude, longitude, "99a8554beacb34262546d455d62d08fc");
}

function onError(data) {
    console.log('定位失败', data);
    alert(`定位失败：${data.message}`);
}

function decryptLocation(encrypted) {
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv });
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    const location = JSON.parse(decryptedStr);
    console.log(`Decrypted location: Latitude ${location.latitude}, Longitude ${location.longitude}`); // 输出解密后的位置信息
    return `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
}

function getPOIs(latitude, longitude, apiKey) {
    const url = `https://restapi.amap.com/v3/place/around?key=${apiKey}&location=${longitude},${latitude}&keywords=肯德基&radius=5000&output=json`;
    console.log(`Fetching POIs from URL: ${url}`); // 输出请求的URL
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                const pois = data.pois.map(poi => `
                    <p>名称: ${poi.name}, 地址: ${poi.address}, 坐标: ${poi.location}</p>
                `).join("");
                document.getElementById("pois").innerHTML = pois;
            } else {
                alert("无法获取POI信息");
            }
        })
        .catch(error => {
            console.error("Error fetching POIs:", error);
            alert("Error fetching POIs.");
        });
}

document.getElementById('shareLocation').addEventListener('change', function() {
    if (this.checked) { 
        console.log("用户允许访问位置数据"); 
    } else { 
        console.log("用户禁止访问位置数据"); 
    } 
});
