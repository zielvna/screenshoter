const path = require('path');
const { app, BrowserWindow } = require('electron');
const { getDisplaysTotalSize } = require('./utils');

const createWindow = () => {
    app.window = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
        },
    });

    const totalDisplaysSize = getDisplaysTotalSize();
    app.window.setMinimumSize(totalDisplaysSize.x, totalDisplaysSize.y);

    app.window.show();
    app.window.hide();

    app.window.loadFile(path.join(__dirname, '../renderer/index.html'));
};

module.exports = { createWindow };
