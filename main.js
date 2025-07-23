const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');

let mainWindow;
let ssProcess = null; // Shadowsocks sürecini burada tutacağız

// === KENDİ BİLGİLERİNİZLE DOLDURUN ===
const serverConfig = {
    server_addr: "35.193.6.130",
    server_port: "1080",
    password: "j4_UlEKtJ-x3hsKN7kjbLw",
    method: "CHACHA20-IETF-POLY1305", // Sunucudaki şifreleme metoduyla aynı olmalı
    local_port: 1080 // Bilgisayarda çalışacak yerel port
};
// ===================================

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 650,
        resizable: false, // Boyutlandırmayı engelle
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    mainWindow.loadFile('index.html');
    // Menüyü kaldır
    mainWindow.setMenu(null);
}

app.whenReady().then(createWindow);

// Bütün pencereler kapandığında uygulamadan çık (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // VPN'i durdur ve çık
    if (ssProcess) {
        ssProcess.kill();
    }
    exec(gsettings set org.gnome.system.proxy mode 'none');
    app.quit();
  }
});


// VPN'i başlatan fonksiyon
ipcMain.on('start-vpn', () => {
    console.log('VPN başlatma isteği alındı...');

    const command_ss = ss-local -s ${serverConfig.server_addr} -p ${serverConfig.server_port} -k ${serverConfig.password} -m ${serverConfig.method} -l ${serverConfig.local_port};
    const command_set_proxy = gsettings set org.gnome.system.proxy mode 'manual' && gsettings set org.gnome.system.proxy.socks host '127.0.0.1' && gsettings set org.gnome.system.proxy.socks port ${serverConfig.local_port};

    ssProcess = spawn('sh', ['-c', command_ss]);
    
    ssProcess.stdout.on('data', (data) => console.log(ss-local: ${data}));
    ssProcess.stderr.on('data', (data) => console.error(ss-local HATA: ${data}));
    
    exec(command_set_proxy, (error, stdout, stderr) => {
        if (error) {
            console.error(Proxy ayarlanamadı: ${error.message});
            mainWindow.webContents.send('vpn-status', 'hata');
            return;
        }
        console.log("Proxy başarıyla ayarlandı.");
        mainWindow.webContents.send('vpn-status', 'baglandi');
    });
});

// VPN'i durduran fonksiyon
ipcMain.on('stop-vpn', () => {
    console.log('VPN durdurma isteği alındı...');
    
    if (ssProcess) {
        ssProcess.kill();
        ssProcess = null;
    }

    const command_disable_proxy = gsettings set org.gnome.system.proxy mode 'none';
    exec(command_disable_proxy, (error, stdout, stderr) => {
        if (error) {
            console.error(Proxy kapatılamadı: ${error.message});
            return;
        }
        console.log("Proxy başarıyla kapatıldı.");
        mainWindow.webContents.send('vpn-status', 'baglanti-kesildi');
    });
});