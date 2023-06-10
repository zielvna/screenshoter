module.exports = {
    packagerConfig: {
        icon: 'src/icons/icon.ico',
        name: 'Screenshoter',
        appCopyright: 'Copyright (C) 2023 zielvna',
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['win32', 'linux', 'darwin'],
        },
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'zielvna',
                    name: 'screenshoter',
                },
            },
        },
    ],
};
