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
let isDragging = false;
let shape = "pen";

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

// function changeHandler(event) {
//     document.querySelector("[change]").innerHTML = `${canvas.width}x${canvas.height} : ${event.clientX || 0}x${event.clientY || 0}`;
// }

// function printCoordinates(x, y) {
//     document.querySelector("[change]").innerHTML = `${parseInt(x)}x${parseInt(y)}`;
// }

function shapeHandler(_shape) {
    shape = _shape;
    console.log(shape);
}

// Function to start drawing
function startDrawing(event) {
    console.log(shape);
    if (shape === "pen") {
        isDrawing = true;
        isDragging = false;

        // create empty array in drawnArray to store current move/drawning.
        // const len = drawnArray.length;
        drawnArray.push([]);
    }
    else if (shape === "hand") {
        isDragging = true;
        isDrawing = false;
    }
    [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
}

// Function to draw lines
function draw(event) {
    if (!isDrawing && !isDragging) return;

    // Get the current mouse position
    const [curX, curY] = adjustCoordinates(event.clientX, event.clientY);

    if (isDrawing) {
        // Draw a line from the last position to the current position.
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(curX, curY);
        context.stroke();

        // store path.
        const len = drawnArray.length;
        drawnArray[len - 1].push({ startX: startX, startY: startX, endX: curX, endY: curY, shape: "pen" });
    }
    else if (isDragging) {
        const translateX = (startX - curX);
        const translateY = (startY - curY);

        window.scrollBy({
            left: translateX,
            top: translateY,
            behavior: 'auto'
        });

        // printCoordinates(0, 0);

        // bug: code working properly when undefined function is called. 
        xyz();
    }

    // Update the last position.
    [startX, startY] = [curX, curY];
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
    isDragging = false;
}

function resizeHandler() {
    // const width = canvas.width;
    // const height = canvas.height;

    // console.log(canvas.width);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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

function zoomHandler(event) {
    const zoomOut = event.deltaY < 0;
    // console.log(scaleFactor);

    if (zoomOut) {
        if (scaleFactor < 2)
            scaleFactor += zoomSpeed;
    } else {
        if (scaleFactor > 0.7)
            scaleFactor -= zoomSpeed;
    }

    if (scaleFactor > 1) {
        canvas.style.marginTop = `${canvas.height * (scaleFactor - 1) * .5 - 4 * scaleFactor}px`;
        canvas.style.marginLeft = `${canvas.width * (scaleFactor - 1) * .5 - 4 * scaleFactor}px`;
    }
    else if (scaleFactor <= 1) {
        canvas.style.marginTop = `${0}px`;
        canvas.style.marginLeft = `${0}px`;
    }
    canvas.style.transform = `scale(${scaleFactor})`;
}



function adjustCoordinates(x, y) {
    // getBoundingClientRect method providing information about the size of an element and its position 
    // relative to the viewport. It includes properties such as top, right, bottom, left, width, and height.
    const rect = canvas.getBoundingClientRect();

    // Adjust coordinates based on canvas position and zoom factor
    x = (x - rect.left) / scaleFactor;
    y = (y - rect.top) / scaleFactor;

    if (rect.left < 0) {
        x += x * 0.025;
        y += y * 0.025;
    }
    return [x, y];
}

function resetZoomHandler() {
    scaleFactor = 1.0;
    // console.log("jhvhj");
    canvas.style.transform = `scale(${scaleFactor})`;
}

document.addEventListener('click', (event) => { console.log(event.clientX + " " + event.clientY), console.log(scaleFactor) });

// Add event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

window.addEventListener('resize', resizeHandler);
window.addEventListener('dblclick', resetZoomHandler);
canvas.addEventListener('wheel', zoomHandler);