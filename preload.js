const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startVpn: () => ipcRenderer.send('start-vpn'),
    stopVpn: () => ipcRenderer.send('stop-vpn'),
    onVpnStatus: (callback) => ipcRenderer.on('vpn-status', (_event, value) => callback(value))
});