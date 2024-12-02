function getLocation() {
    // 使用高德地图API进行定位
    AMap.plugin('AMap.Geolocation', function() {
        var geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认:true
            timeout: 10000,           // 超过10秒后停止定位，默认：无穷大
            maximumAge: 0,            // 定位结果缓存0毫秒，默认：0
            convert: true,            // 自动偏移坐标，偏移后的坐标为高德坐标
            showButton: true,         // 显示定位按钮，默认：true
            buttonPosition: 'LB',     // 定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,         // 定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,         // 定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,      // 定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: true      // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        geolocation.getCurrentPosition(function(status, result) {
            if (status == 'complete') {
                onComplete(result);
            } else {
                onError(result);
            }
        });
    });
}

function onComplete(data) {
    const latitude = data.position.lat;
    const longitude = data.position.lng;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    // 处理加密、显示等逻辑
}

function onError(data) {
    alert('定位失败');
}


function showPosition(position) {
    console.log("showPosition called"); // 添加调试日志
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // 输出位置信息

    // Encrypt location data
    const key = CryptoJS.enc.Utf8.parse("1234567890123456");
    const iv = CryptoJS.enc.Utf8.parse("1234567890123456");
    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify({ latitude, longitude }), key, { iv }
    ).toString();
    console.log(`Encrypted location: ${encrypted}`); // 输出加密后的位置信息

    document.getElementById("location").innerHTML = `
        Encrypted location: ${encrypted}<br>
        Decrypted location: ${decryptLocation(encrypted, key, iv)}
    `;

    // Use Amap API to get nearby POIs
    getPOIs(latitude, longitude, "99a8554beacb34262546d455d62d08fc");
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function decryptLocation(encrypted, key, iv) {
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
