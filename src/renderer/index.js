const canvasElement = document.querySelector('.canvas');
const actionsElement = document.querySelector('.actions');
const copyElement = document.querySelector('.actions__tile--copy');
const saveElement = document.querySelector('.actions__tile--save');
const selectElement = document.querySelector('.select');
const clipCanvasElement = document.createElement('canvas');
const context = canvasElement.getContext('2d');
const clipContext = clipCanvasElement.getContext('2d');

let displays = [];
let totalDisplaysSize = { x: 0, y: 0 };
let images = [];
let imagesLoaded = 0;
let isMouseDown = false;
let selectArea = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
let selectPoint = { x: 0, y: 0 };
let selectBorder = parseInt(getComputedStyle(selectElement, null).getPropertyValue('border-width').replace('px', ''));

const setup = async () => {
    displays = await core.getDisplays();
    totalDisplaysSize = await core.getDisplaysTotalSize();

    canvasElement.width = totalDisplaysSize.x;
    canvasElement.height = totalDisplaysSize.y;

    displays.forEach(() => {
        const image = new Image();

        image.addEventListener('load', async () => {
            imagesLoaded++;

            if (imagesLoaded === displays.length) {
                updateSelect();
                core.allImagesLoaded();
                imagesLoaded = 0;
            }
        });

        images.push(image);
    });

    actionsElement.style.left = displays[0].bounds.width / 2 - actionsElement.offsetWidth / 2 + 'px';

    core.onScreenshots(async (screenshots) => {
        screenshots.forEach((screenshot, i) => {
            images[i].src = screenshot;
        });
    });

    core.onClearSelect(() => {
        selectArea = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
        updateSelect();
    });

    document.body.addEventListener('mousedown', (event) => {
        isMouseDown = true;

        selectElement.style.display = 'block';

        if (event.target === actionsElement || actionsElement.contains(event.target)) {
            return;
        }

        selectPoint = { x: event.clientX, y: event.clientY };
        selectArea = { from: { x: event.clientX, y: event.clientY }, to: { x: event.clientX, y: event.clientY } };

        updateSelect();
    });

    document.body.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            if (event.clientX < selectPoint.x) {
                selectArea.from.x = event.clientX;
                selectArea.to.x = selectPoint.x;
            } else {
                selectArea.from.x = selectPoint.x;
                selectArea.to.x = event.clientX;
            }

            if (event.clientY < selectPoint.y) {
                selectArea.from.y = event.clientY;
                selectArea.to.y = selectPoint.y;
            } else {
                selectArea.from.y = selectPoint.y;
                selectArea.to.y = event.clientY;
            }
        }

        updateSelect();
    });

    document.body.addEventListener('mouseup', (event) => {
        isMouseDown = false;

        updateSelect();
    });

    copyElement.addEventListener('click', () => {
        sendScreenshot('copy-to-clipboard');
    });

    saveElement.addEventListener('click', () => {
        sendScreenshot('save');
    });

    const updateSelect = () => {
        if (selectArea.to.x > selectArea.from.x) {
            selectElement.style.left = `${selectArea.from.x - selectBorder}px`;
            selectElement.style.width = `${selectArea.to.x - selectArea.from.x}px`;
        } else {
            selectElement.style.left = `${selectArea.to.x - selectBorder}px`;
            selectElement.style.width = `${selectArea.from.x - selectArea.to.x}px`;
        }

        if (selectArea.to.y > selectArea.from.y) {
            selectElement.style.top = `${selectArea.from.y - selectBorder}px`;
            selectElement.style.height = `${selectArea.to.y - selectArea.from.y}px`;
        } else {
            selectElement.style.top = `${selectArea.to.y - selectBorder}px`;
            selectElement.style.height = `${selectArea.from.y - selectArea.to.y}px`;
        }

        displays.forEach((display, i) => {
            context.drawImage(
                images[i],
                display.bounds.x,
                display.bounds.y,
                display.bounds.width,
                display.bounds.height
            );
        });

        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, totalDisplaysSize.x, selectArea.from.y);
        context.fillRect(0, selectArea.to.y, totalDisplaysSize.x, totalDisplaysSize.y);
        context.fillRect(0, selectArea.from.y, selectArea.from.x, selectArea.to.y - selectArea.from.y);
        context.fillRect(selectArea.to.x, selectArea.from.y, totalDisplaysSize.x, selectArea.to.y - selectArea.from.y);
    };

    const sendScreenshot = (type) => {
        const image = new Image();

        image.addEventListener('load', () => {
            clipCanvasElement.width = selectArea.to.x - selectArea.from.x;
            clipCanvasElement.height = selectArea.to.y - selectArea.from.y;
            clipContext.drawImage(image, -selectArea.from.x, -selectArea.from.y);
            const dataURL = clipCanvasElement.toDataURL();

            switch (type) {
                case 'save':
                    core.save(dataURL);
                    break;
                case 'copy-to-clipboard':
                    core.copyToClipboard(dataURL);
                    break;
            }

            selectArea = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
            updateSelect();
        });

        image.src = canvasElement.toDataURL();
    };
};

setup();
