// Get the canvas element
const forcanvas = document.querySelector("[for-canvas]");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables to track the drawing state
let isDrawing = false;
let startX = 0;
let startY = 0;
let lineWidth = 5;
let drawnArray = [];


function changeHandler(event) {
    document.querySelector("[change]").innerHTML = `${canvas.width}x${canvas.height} : ${event.clientX || 0}x${event.clientY || 0}`;
}

// Function to start drawing
function startDrawing(event) {
    isDrawing = true;
    [startX, startY] = adjustCoordinates(event.clientX, event.clientY);

    const len = drawnArray.length;
    drawnArray.push([]);
}

// Function to draw lines
function draw(event) {
    if (!isDrawing) return;

    // Get the current mouse position
    const [x, y] = adjustCoordinates(event.clientX, event.clientY);
    // changeHandler(event);
    const _x = startX;
    const _y = startY;

    // Draw a line from the last position to the current position.
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(x, y);
    context.stroke();

    // Update the last position.
    [startX, startY] = [x, y];

    // store path.
    const len = drawnArray.length;
    drawnArray[len - 1].push({ startX: _x, startY: _y, endX: x, endY: y, shape: "pen" });
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
}

function handleResize() {
    // const width = canvas.width;
    // const height = canvas.height;

    console.log(canvas.width);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // console.log(drawnArray);

    for (let i = 0; i < drawnArray.length; i++) {
        for (let j = 0; j < drawnArray[i].length; j++) {

            // console.log(drawnArray[i][j]);
            context.beginPath();
            context.moveTo(drawnArray[i][j].startX, drawnArray[i][j].startY);
            context.lineTo(drawnArray[i][j].endX, drawnArray[i][j].endY);
            context.stroke();

        }
    }
}

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

window.addEventListener('wheel', (event) => {

    const zoomOut = event.deltaY < 0;
    console.log("hhein");
    console.log(scaleFactor);

    if (zoomOut) {
        if (scaleFactor < 3)
            scaleFactor += zoomSpeed;
    } else {
        if (scaleFactor > 0.7)
            scaleFactor -= zoomSpeed;
    }

    // [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
    // context.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    document.querySelector('canvas').style.transform = `scale(${scaleFactor})`;
});

// Reset zoom
window.addEventListener('dblclick', () => {
    scaleFactor = 1.0;
    console.log("jhvhj");
    document.querySelector('canvas').style.transform = `scale(${scaleFactor})`;

    // context.setTransform(1, 0, 0, 1, 0, 0);
});

function adjustCoordinates(x, y) {
    // getBoundingClientRect method providing information about the size of an element and its position 
    // relative to the viewport. It includes properties such as top, right, bottom, left, width, and height.
    const rect = canvas.getBoundingClientRect();

    // Adjust coordinates based on canvas position and zoom factor
    console.log(rect);
    if (rect.left >= 0) {
        x -= rect.left;
        y -= rect.top;

        x /= scaleFactor;
        y /= scaleFactor;
    }
    else {
        x -= rect.left;
        y -= rect.top;

        x /= scaleFactor;
        y /= scaleFactor;

        x += x * 0.025;
        y += y * 0.025;
    }

    return [x, y];
}
document.addEventListener('click', (event) => { console.log(event.clientX + " " + event.clientY), console.log(scaleFactor) });

// Add event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
window.addEventListener('resize', handleResize);
canvas.addEventListener('mouseout', stopDrawing);