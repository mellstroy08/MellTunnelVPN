const connectBtn = document.getElementById('connectBtn');
const adBtn = document.getElementById('adBtn');
const statusDiv = document.getElementById('status');
const timerDiv = document.getElementById('timer');

let isConnected = false;
let remainingTime = 3600; // 1 saat = 3600 saniye
let timerInterval;

function updateTimerDisplay() {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    timerDiv.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Önceki timer'ı temizle
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 0) {
            stopVpnConnection();
            alert("Süreniz doldu! Lütfen reklam izleyerek ek süre kazanın.");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function startVpnConnection() {
    if (remainingTime > 0 && !isConnected) {
        window.electronAPI.startVpn();
    }
}

function stopVpnConnection() {
    window.electronAPI.stopVpn();
}

connectBtn.addEventListener('click', () => {
    if (isConnected) {
        stopVpnConnection();
    } else {
        if(remainingTime > 0) {
            startVpnConnection();
        } else {
            alert("Süreniz bitti! Lütfen reklam izleyerek süre ekleyin.");
        }
    }
});

adBtn.addEventListener('click', () => {
    // Şimdilik reklamı simüle edelim. 
    adBtn.disabled = true;
    adBtn.textContent = "Reklam İzleniyor...";
    
    // 3 saniyelik sahte reklam beklemesi
    setTimeout(() => {
        console.log("Reklam izlendi.");
        remainingTime += 3600; // 1 saat (3600 saniye) ekle
        updateTimerDisplay();
        alert("1 saat eklendi! Toplam süreniz: " + timerDiv.textContent);
        adBtn.disabled = false;
        adBtn.textContent = "1 Saat Ekstra Zaman Kazan";
    }, 3000); 
});

// Main process'ten gelen durum güncellemelerini dinle
window.electronAPI.onVpnStatus((status) => {
    if (status === 'baglandi') {
        isConnected = true;
        statusDiv.textContent = 'BAĞLANDI (USA)';
        statusDiv.style.color = '#33ff99';
        connectBtn.textContent = 'BAĞLANTIYI KES';
        startTimer();
    } else if (status === 'baglanti-kesildi') {
        isConnected = false;
        statusDiv.textContent = 'BAĞLANTI KESİLDİ';
        statusDiv.style.color = '#ff4d4d';
        connectBtn.textContent = 'BAĞLAN';
        stopTimer();
    } else if (status === 'hata') {
        isConnected = false;
        statusDiv.textContent = 'BAĞLANTI HATASI';
        statusDiv.style.color = '#ff4d4d';
        connectBtn.textContent = 'BAĞLAN';
    }
});

// Başlangıçta zamanı göster
updateTimerDisplay();