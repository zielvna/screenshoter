const path = require('path');
const fs = require('fs');
const { app, globalShortcut, ipcMain, desktopCapturer, nativeImage, dialog, clipboard, screen } = require('electron');
const { createWindow } = require('./window');
const { createTray } = require('./tray');
const { getDisplaysTotalSize } = require('./utils');

app.on('ready', async () => {
    setup();
    createWindow();
    createTray();

    globalShortcut.register('CommandOrControl+PrintScreen', onCapture);
    globalShortcut.register('Escape', onExit);

    ipcMain.on('all-images-loaded', onAllImagesLoaded);
    ipcMain.on('copy-to-clipboard', onCopyToClipboard);
    ipcMain.on('save', onSave);
    ipcMain.handle('get-displays', onGetDisplays);
    ipcMain.handle('get-displays-total-size', onGetDisplaysTotalSize);
});

const setup = async () => {
    app.setLoginItemSettings({
        openAtLogin: true,
    });

    const directoryPath = path.join(app.getPath('documents'), 'Screenshots');

    try {
        await fs.promises.access(directoryPath);
    } catch (error) {
        fs.promises.mkdir(directoryPath);
    }

    app.capture = capture;
};

const capture = async () => {
    if (!app.window.isVisible()) {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
                width: 1920,
                height: 1080,
            },
        });

        const screenshots = sources.map((source) => source.thumbnail.toDataURL());
        app.window.webContents.send('send-screenshots', screenshots);
    }
};

const onCapture = async () => {
    capture();
};

const onExit = async () => {
    app.window.webContents.send('clear-select');
    app.window.hide();
};

const onAllImagesLoaded = () => {
    app.window.show();
};

const onCopyToClipboard = async (event, screenshot) => {
    app.window.hide();

    const nativeScreenshot = nativeImage.createFromDataURL(screenshot);
    clipboard.writeImage(nativeScreenshot);
};

const onSave = async (event, screenshot) => {
    app.window.hide();

    const files = await fs.promises.readdir(path.join(app.getPath('documents'), 'Screenshots'));
    const number = files.length + 1;

    const nativeScreenshot = nativeImage.createFromDataURL(screenshot);
    const screenshotPath = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('documents'), 'Screenshots', `Screenshot ${number}.png`),
    });

    await fs.promises.writeFile(screenshotPath.filePath, nativeScreenshot.toPNG());
};

const onGetDisplays = () => {
    return screen.getAllDisplays();
};

const onGetDisplaysTotalSize = () => {
    return getDisplaysTotalSize();
};
