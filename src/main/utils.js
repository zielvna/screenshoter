const { screen } = require('electron');

const getDisplaysTotalSize = () => {
    const displays = screen.getAllDisplays();

    let maxX = 0;
    let maxY = 0;

    displays.forEach((display) => {
        let x = display.bounds.x + display.bounds.width;
        let y = display.bounds.y + display.bounds.height;

        if (x > maxX) {
            maxX = x;
        }

        if (y > maxY) {
            maxY = y;
        }
    });

    return { x: maxX, y: maxY };
};

module.exports = { getDisplaysTotalSize };
