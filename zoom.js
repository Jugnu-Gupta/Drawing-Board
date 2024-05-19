// Get the canvas element
const forcanvas = document.querySelector("[for-canvas]");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// window.onbeforeunload = function () {
//     window.scrollTo(0, 0);
// }

// Variables to track the drawing state
let isDrawing = false;
let startX = 0;
let startY = 0;
let lineWidth = 5;
let drawnArray = [];
let translateX = 0;
let translateY = 0;
let isDragging = false;
let shape = "pen";

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

// function changeHandler(event) {
//     document.querySelector("[change]").innerHTML = `${canvas.width}x${canvas.height} : ${event.clientX || 0}x${event.clientY || 0}`;
// }

function printCoordinates(x, y) {
    document.querySelector("[change]").innerHTML = `${parseInt(x)}x${parseInt(y)}`;
}

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

        const len = drawnArray.length;
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
    const [x, y] = adjustCoordinates(event.clientX, event.clientY);

    // changeHandler(event);
    const _x = startX;
    const _y = startY;

    if (isDrawing) {
        // Draw a line from the last position to the current position.
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(x, y);
        context.stroke();

        // store path.
        const len = drawnArray.length;
        drawnArray[len - 1].push({ startX: _x, startY: _y, endX: x, endY: y, shape: "pen" });
    }
    else if (isDragging) {
        const rect = canvas.getBoundingClientRect();

        translateX = _x - x;
        translateY = _y - y;

        // let coordX = canvas.width / scaleFactor;
        // let coordY = canvas.height / scaleFactor;
        let coordX = _x - canvas.width / 2;
        let coordY = _y - canvas.height / 2;
        // let coordX =  rect.left - canvas.width / 2;
        // let coordY = rect.top - canvas.height / 2;

        window.scrollTo(coordX, coordY);

        printCoordinates(coordX, coordY);

        // drag
        // document.querySelector('canvas').style.transform = `translate(${translateX}px, ${translateY}px)`;
        // document.querySelector('canvas').style.transition = `500ms all`;
    }

    // Update the last position.
    [startX, startY] = [x, y];
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
    isDragging = false;
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

// canvas.addEventListener('wheel', (event) => {

//     const zoomOut = event.deltaY < 0;
//     // console.log(scaleFactor);

//     if (zoomOut) {
//         if (scaleFactor < 2)
//             scaleFactor += zoomSpeed;
//     } else {
//         if (scaleFactor > 0.7)
//             scaleFactor -= zoomSpeed;
//     }

// [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
// context.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

// if (scaleFactor > 1) {
//     canvas.style.marginTop = `${canvas.height * (scaleFactor - 1) * .5}px`;
//     canvas.style.marginLeft = `${canvas.width * (scaleFactor - 1) * .5}px`;
//     // canvas.style.marginLeft = `${100}px`;
// }
// else if (scaleFactor <= 1) {
//     canvas.style.marginTop = `${0}px`;
//     canvas.style.marginLeft = `${0}px`;
// }
//     canvas.style.transform = `scale(${scaleFactor})`;
// });

// Reset zoom
window.addEventListener('dblclick', () => {
    scaleFactor = 1.0;
    console.log("jhvhj");
    canvas.style.transform = `scale(${scaleFactor})`;

    // context.setTransform(1, 0, 0, 1, 0, 0);
});

function adjustCoordinates(x, y) {
    // getBoundingClientRect method providing information about the size of an element and its position 
    // relative to the viewport. It includes properties such as top, right, bottom, left, width, and height.
    const rect = canvas.getBoundingClientRect();

    // Adjust coordinates based on canvas position and zoom factor
    // console.log(rect);
    x -= rect.left;
    y -= rect.top;

    x /= scaleFactor;
    y /= scaleFactor;
    if (scaleFactor > 1) {

        x += x * 0.025;
        y += y * 0.025;
        // x += (x * (scaleFactor - 1)) / 110;
        // y += (y * (scaleFactor - 1)) / 110;
        // x += (x * (scaleFactor - 1)) / 100;
        // y += (y * (scaleFactor - 1)) / 100;
    }

    return [x, y];
}
document.addEventListener('click', (event) => { console.log(event.clientX + " " + event.clientY), console.log(scaleFactor) });

// Add event listeners for drawing
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
window.addEventListener('resize', handleResize);
canvas.addEventListener('pointerout', stopDrawing);