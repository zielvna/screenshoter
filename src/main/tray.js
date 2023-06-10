const path = require('path');
const { app, Tray, Menu, nativeImage } = require('electron');

const createTray = () => {
    const icon = nativeImage.createFromPath(path.join(__dirname, '../icons/icon.ico'));
    app.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Capture (CTRL + PRTSC)', click: onCapture },
        { label: 'Exit', click: onExit },
    ]);
    app.tray.setContextMenu(contextMenu);

    app.tray.setToolTip('Screenshoter');
};

const onCapture = () => {
    app.capture();
};

const onExit = () => {
    app.exit();
};

module.exports = { createTray };
