const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('core', {
    getDisplays: () => {
        return ipcRenderer.invoke('get-displays');
    },
    getDisplaysTotalSize: () => {
        return ipcRenderer.invoke('get-displays-total-size');
    },
    onScreenshots: (callback) => {
        ipcRenderer.on('send-screenshots', (event, screenshots) => {
            callback(screenshots);
        });
    },
    allImagesLoaded: () => {
        ipcRenderer.send('all-images-loaded', null);
    },
    copyToClipboard: (screenshot) => {
        ipcRenderer.send('copy-to-clipboard', screenshot);
    },
    save: (screenshot) => {
        ipcRenderer.send('save', screenshot);
    },
    onClearSelect: (callback) => {
        ipcRenderer.on('clear-select', () => {
            callback();
        });
    },
});
