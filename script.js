// Get the canvas element
const lineWidthSlider = document.querySelector('[data-lineWidthSlider]');
const forcanvas = document.querySelector("[for-canvas]");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables to track the drawing state
let isDrawing = false;
let startX = 0;
let startY = 0;
let lineWidth = 2;
let drawnArray = [];
let currDrawing = [];
let isDragging = false;
let shape = "pen";

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

function shapesAndLineHandler(name) {
    let shapesAndLines;
    if (name === "shapes") {
        shapesAndLines = document.querySelector('[data-shapes]');
    }
    else if (name === "lineWidth") {
        shapesAndLines = document.querySelector('[data-lineWidth]');
    }
    console.log(shapesAndLines.classList);
    if (shapesAndLines.classList.contains("slideUp")) {
        shapesAndLines.classList.remove("slideUp");
        shapesAndLines.classList.add("slideDown");
    }
    else {
        shapesAndLines.classList.add("slideUp");
        shapesAndLines.classList.remove("slideDown");
    }
}

function handleSlider(event) {
    lineWidthSlider.value = lineWidth;
    // lengthDisplay.textContent = passwordLength;

    // slider background color.
    const min = lineWidthSlider.min;
    const max = inputSlider.max;
    // lineWidthSlider.style.backgroundSize = ( (passwordLength - min )* 100 / ( max - min) ) + "% 100%";  // not working.
    lineWidthSlider.style.background = `linear-gradient(to right, #0E61DE 0%, #0E61DE ${(passwordLength - min) / (max - min) * 100}%, #261263 ${(passwordLength - min) / (max - min) * 100}%, #261263 100%)`

    // console.log(lineWidthSlider.style.backgroundSize);
}

function printCoordinates(x, y) {
    // document.querySelector("[change]").innerHTML = `${parseInt(x)}x${parseInt(y)}`;
    document.querySelector("[change]").innerHTML = `${x}x${y}`;
}

function shapeHandler(_shape) {
    shape = _shape;
    // console.log(shape);
}

// Function to start drawing
function startDrawing(event) {
    if (shape === "hand") {
        isDragging = true;
        isDrawing = false;
    }
    else { // shapes
        isDrawing = true;
        isDragging = false;
        // console.log("in");

        currDrawing = [];
    }
    [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
}

function drawLine(prevX, prevY, curX, curY) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = lineWidth;
    context.moveTo(prevX, prevY);
    context.lineTo(curX, curY);
    context.stroke();
}

function drawCircle(startX, startY, radius) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = lineWidth;
    context.arc(startX, startY, radius, 0, 2 * Math.PI);
    context.stroke();
}

// Function to draw lines
function draw(event) {
    if (!isDrawing && !isDragging) return;

    const X = event.clientX || (event.touches && event.touches[0].clientX);
    const Y = event.clientY || (event.touches && event.touches[0].clientY);
    const [curX, curY] = adjustCoordinates(X, Y);

    if (isDrawing) {
        if (shape == "pen") {
            const [prevX, prevY] = [startX, startY];

            drawLine(prevX, prevY, curX, curY);
            // console.log(prevX, prevY, curX, curY);

            // console.log("line");

            // store path.
            const len = drawnArray.length;
            currDrawing.push({
                shape: {
                    name: "pen",
                    startX: prevX, startY: prevY, endX: curX, endY: curY,
                }
            }
            );

            // Update the last position.
            startX = curX;
            startY = curY;
        }
        if (shape == "circle") {
            const [prevX, prevY] = [startX, startY];
            const r = Math.sqrt(Math.pow((prevX - curX), 2) + Math.pow((prevY - curY), 2));

            // console.log("circle");

            // undoHandler();
            repaintHandler(1, 1);

            drawCircle(prevX, prevY, r);

            // store.
            currDrawing = [{
                shape: {
                    name: "circle",
                    startX: prevX,
                    startY: prevY, radius: r,
                }
            }];
        }
    }
    else if (isDragging) {
        const translateX = (startX - curX) * scaleFactor;
        const translateY = (startY - curY) * scaleFactor;

        window.scrollBy({
            left: translateX,
            top: translateY,
            behavior: 'auto'
        });

        // printCoordinates(0, 0);

        // bug: code working properly when undefined function is called. 
        // xyz();
        // Update the last position.
        startX = curX;
        startY = curY;
    }
    // console.log(currDrawing);
}

// Function to stop drawing
function stopDrawing() {
    // console.log("out");
    isDrawing = false;
    isDragging = false;

    if (currDrawing.length !== 0) {
        drawnArray.push(currDrawing);
        currDrawing = [];
    }
}

function repaintHandler(ratioWeight, ratioHeight) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawnArray.length; i++) {
        for (let j = 0; j < drawnArray[i].length; j++) {
            let shapeInfo = drawnArray[i][j].shape;

            if (shapeInfo?.name === "pen") {
                shapeInfo.startX *= ratioWeight;
                shapeInfo.endX *= ratioWeight;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.endY *= ratioHeight;

                drawLine(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.endX, shapeInfo.endY);
            }
            else if (shapeInfo?.name === "circle") {
                console.log("hello ");
                shapeInfo.startX *= ratioWeight;
                shapeInfo.endX *= ratioWeight;
                shapeInfo.radius *= (ratioWeight + ratioHeight) / 2;

                drawCircle(shapeInfo.startX, shapeInfo.startY, shapeInfo.radius);
            }
        }
    }
}

function undoHandler() {
    drawnArray.pop();
    repaintHandler(1, 1);
}

function resizeHandler() {
    const ratioWeight = window.innerWidth / canvas.width;
    const ratioHeight = window.innerHeight / canvas.height;

    // console.log(canvas.width);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    repaintHandler(ratioWeight, ratioHeight);
}

function zoomHandler(event) {
    if (event.ctrlKey === true) {
        event.preventDefault();

        const zoomOut = event.deltaY < 0;
        // console.log(scaleFactor);

        if (zoomOut) {
            scaleFactor = Math.min(scaleFactor + zoomSpeed, 10);
        } else {
            scaleFactor = Math.max(scaleFactor - zoomSpeed, 1);
        }

        if (scaleFactor > 1) {
            canvas.style.marginTop = `${canvas.height * (scaleFactor - 1) * .5 - 4 * scaleFactor}px`;
            canvas.style.marginLeft = `${canvas.width * (scaleFactor - 1) * .5 - 7 * scaleFactor}px`;
        }
        else if (scaleFactor <= 1) {
            canvas.style.marginTop = `${0}px`;
            canvas.style.marginLeft = `${0}px`;
        }
        canvas.style.transform = `scale(${scaleFactor})`;
        // printCoordinates(scaleFactor, scaleFactor);
    }
}

// console.log("ratio " + devicePixelRatio);
function adjustCoordinates(x, y) {
    // getBoundingClientRect method providing information about the size of an element and its position 
    // relative to the viewport. It includes properties such as top, right, bottom, left, width, and height.
    const rect = canvas.getBoundingClientRect();

    // Adjust coordinates based on canvas position and zoom factor
    x = (x - rect.left) / scaleFactor;
    y = (y - rect.top) / scaleFactor;

    if (scaleFactor > 1) {
        x += x * 0.02;
        y += y * 0.001;
    }
    return [x, y];
}

function resetZoomHandler() {
    scaleFactor = 1.0;
    canvas.style.transform = `scale(${scaleFactor})`;
}

// document.addEventListener('click', (event) => { console.log(event.clientX + " " + event.clientY), console.log(scaleFactor) });

// Add event listeners for drawing.
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
window.addEventListener('resize', resizeHandler);
window.addEventListener('dblclick', resetZoomHandler);
canvas.parentElement.addEventListener('wheel', zoomHandler);


// var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
// window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
// document.body.addEventListener('wheel', (event) => event.preventDefault())