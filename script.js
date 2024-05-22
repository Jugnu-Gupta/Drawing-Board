// const { data } = require("autoprefixer");

const dataPen = document.querySelector('[data-pen]');
const dataEraser = document.querySelector('[data-eraser]');
const dataMultipleShapes = document.querySelector('[data-multipleShapes]');
const dataZoom = document.querySelector('[data-zoom]');
const dataHand = document.querySelector('[data-hand]');
const dataLineWidthContainer = document.querySelector('[data-strokeWidth]');
const dataColorPickerConatiner = document.querySelector('[data-colorPickerConatiner]');

const lineWidthSlider = document.querySelector('[data-lineWidthSlider]');
const dataLineWidth = document.querySelector('[data-lineWidth]');

const dataListOfShapes = document.querySelector('[data-ListOfShapes]');
const dataColorPicker = document.querySelector('[data-colorPicker]');
const dataZoomInOut = document.querySelector('[data-zoomInOut]');

const optionArray = {
    pen: { name: dataPen },
    eraser: { name: dataEraser },
    hand: { name: dataHand },
    zoom: { name: dataZoom, child: dataZoomInOut },
    multipleShapes: { name: dataMultipleShapes, child: dataListOfShapes },
    lineWidth: { name: dataLineWidthContainer, child: dataLineWidth },
    colorPicker: { name: dataColorPickerConatiner, child: dataColorPicker },
};

// Get the canvas element
const forcanvas = document.querySelector("[for-canvas]");
const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = 'high';


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables to track the drawing state
let isDrawing = false;
let startX = 0;
let startY = 0;
let lineWidth = 2;
let style = 'black';
let backgroundColor = '#9ca3af';
let drawnArray = [];
let redoArray = [];
let curDrawing = [];
let isDragging = false;
let shape = "pen";
let list = null;
let selectedOption = "pen";

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

function selectOptionHandler(option, event) {
    console.log(optionArray[option]);
    if (option === "multipleShapes" || option === "zoom" || option === "lineWidth" || option === "colorPicker") {
        topDownListHandler(option);
    }
    else {
        optionArray[selectedOption].name.classList.remove('bg-gray-400');
        optionArray[option].name.classList.add('bg-gray-400');
        selectedOption = option;
    }
}


function topDownListHandler(name) {
    optionArray[list]?.child?.classList?.add("slideUp");
    optionArray[list]?.child?.classList?.remove("slideDown");

    console.log(list);

    console.log(name);
    if (name === list) {
        list = null; return;
    }
    list = name;
    if (optionArray[list].child.classList.contains("slideUp")) {
        optionArray[list].child.classList.remove("slideUp");
        optionArray[list].child.classList.add("slideDown");
    }
    else {
        optionArray[list].child.classList.add("slideUp");
        optionArray[list].child.classList.remove("slideDown");
    }
}

function shapeHandler(shapeName, event) {
    shape = shapeName;
    if (shape === "straightLine" || shape === "circle" || shape === "rectangle" ||
        shape === "solidCircle" || shape === "solidRectangle") {
        optionArray[selectedOption].name.classList.remove('bg-gray-400');
        optionArray.multipleShapes.name.classList.add('bg-gray-400');
        selectedOption = "multipleShapes";
    }
    else if (shape === "zoomIn" || shape === "zoomOut") {
        console.log("hello Zoom");
        optionArray[selectedOption].name.classList.remove('bg-gray-400');
        optionArray.zoom.name.classList.add('bg-gray-400');
        selectedOption = "zoom";
    }
    else {
        selectOptionHandler(shapeName);
    }
    console.log(shape);
    event.stopPropagation();
}

function slideHandler(event) {
    event.stopPropagation();
    lineWidth = lineWidthSlider.value;

    // slider background color.
    const min = event.target.min;
    const max = event.target.max;
    lineWidthSlider.style.background = `linear-gradient(to right, #0E61DE 0%, #0E61DE 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 100%)`
}

function colorPickerHandler(event) {
    event.stopPropagation();
    if (event.target.name === 'strokeColor') {
        style = event.target.value;
    }
    else if (event.target.name === 'backgroundColor') {
        backgroundColor = event.target.value;
        canvas.style.backgroundColor = backgroundColor;
        repaintHandler(1, 1);
    }
}

// function printCoordinates(x, y) {
//     // document.querySelector("[change]").innerHTML = `${parseInt(x)}x${parseInt(y)}`;
//     document.querySelector("[change]").innerHTML = `${x}x${y}`;
// }


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

        curDrawing = [];
    }
    [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
}


function eraseLine(startX, startY, endX, endY, lineWidth) {
    context.beginPath();
    context.strokeStyle = backgroundColor;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

function drawLine(startX, startY, endX, endY, lineWidth, style) {
    context.beginPath();
    context.strokeStyle = style;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

function drawRectangle(startX, startY, width, height, lineWidth,
    style, solid) {
    context.beginPath();
    context.strokeStyle = style;
    context.lineWidth = lineWidth;
    context.rect(startX, startY, width, height);

    if (solid) {
        context.fillStyle = style;
        context.fill();
    }
    context.stroke();
}

function drawCircle(startX, startY, radius, lineWidth, style, solid) {
    context.beginPath();
    context.strokeStyle = style;
    context.lineWidth = lineWidth;
    context.arc(startX, startY, radius, 0, 2 * Math.PI);

    if (solid) {
        context.fillStyle = style;
        context.fill();
    }
    context.stroke();
}

function draw(event) {
    if (!isDrawing && !isDragging) return;

    const X = event.clientX || (event.touches && event.touches[0].clientX);
    const Y = event.clientY || (event.touches && event.touches[0].clientY);
    const [curX, curY] = adjustCoordinates(X, Y);

    if (isDrawing) {
        if (shape === "pen" || shape === "straightLine") {
            const [prevX, prevY] = [startX, startY];

            if (shape === "straightLine") {
                repaintHandler(1, 1);
            }
            drawLine(prevX, prevY, curX, curY, lineWidth, style);

            // store path.
            const temp = {
                shape: {
                    name: "pen",
                    startX: prevX, startY: prevY, endX: curX, endY: curY,
                    style: style, lineWidth: lineWidth,
                }
            };
            if (shape === "straightLine") {
                curDrawing = [temp];
            }
            else { // shape: pen
                curDrawing.push(temp);

                // Update the last position.
                startX = curX;
                startY = curY;
            }
        }
        else if (shape === "circle" || shape === "solidCircle") {
            const [prevX, prevY] = [startX, startY];
            const radius = Math.sqrt(Math.pow((prevX - curX), 2) + Math.pow((prevY - curY), 2));

            repaintHandler(1, 1);
            drawCircle(prevX, prevY, radius, lineWidth, style, (shape === "solidCircle"));

            // store.
            curDrawing = [{
                shape: {
                    name: "circle",
                    startX: prevX, startY: prevY, radius: radius,
                    style: style, lineWidth: lineWidth,
                    solid: (shape === "solidCircle"),
                }
            }];
        }
        else if (shape === "rectangle" || shape === "solidRectangle") {
            const [_startX, _startY] = [Math.min(startX, curX), Math.min(startY, curY)];
            const width = Math.abs(curX - startX);
            const height = Math.abs(curY - startY);

            repaintHandler(1, 1);
            drawRectangle(_startX, _startY, width, height, lineWidth, style, (shape === "solidRectangle"));

            // store.
            curDrawing = [{
                shape: {
                    name: "rectangle",
                    startX: _startX, startY: _startY, width: width, height: height,
                    style: style, lineWidth: lineWidth,
                    solid: (shape === "solidRectangle"),
                }
            }];
        }
        else if (shape === "eraser") {
            const [prevX, prevY] = [startX, startY];

            eraseLine(prevX, prevY, curX, curY, lineWidth);

            // store path.
            curDrawing.push({
                shape: {
                    name: "eraser",
                    startX: prevX, startY: prevY, endX: curX, endY: curY,
                    lineWidth: lineWidth,
                }
            });

            // Update the last position.
            startX = curX;
            startY = curY;
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
        xyz();

        // Update the last position.
        startX = curX;
        startY = curY;
    }
    // console.log(curDrawing);
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
    isDragging = false;

    if (curDrawing.length !== 0) {
        drawnArray.push(curDrawing);
        curDrawing = [];
        redoArray = [];
    }
}

function repaintHandler(ratioWidth, ratioHeight) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawnArray.length; i++) {
        for (let j = 0; j < drawnArray[i].length; j++) {
            let shapeInfo = drawnArray[i][j].shape;

            if (shapeInfo?.name === "pen" || shapeInfo?.name === "straightLine") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.endX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.endY *= ratioHeight;

                drawLine(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.endX, shapeInfo.endY,
                    shapeInfo.lineWidth, shapeInfo.style);
            }
            else if (shapeInfo?.name === "circle" || shapeInfo?.name === "solidCircle") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.radius *= (ratioWidth + ratioHeight) / 2;

                drawCircle(shapeInfo.startX, shapeInfo.startY, shapeInfo.radius,
                    shapeInfo.lineWidth, shapeInfo.style,
                    shapeInfo.solid);
            }
            else if (shapeInfo?.name === "rectangle" || shapeInfo?.name === "solidRectangle") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.width *= ratioWidth;
                shapeInfo.height *= ratioHeight;
                shapeInfo.lineWidth *= (ratioWidth + ratioHeight) / 2;

                drawRectangle(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.width, shapeInfo.height,
                    shapeInfo.lineWidth, shapeInfo.style,
                    shapeInfo.solid);
            }
            else if (shapeInfo?.name === "eraser") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.endX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.endY *= ratioHeight;

                eraseLine(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.endX, shapeInfo.endY,
                    shapeInfo.lineWidth);
            }
        }
    }
}

function undoHandler() {
    if (drawnArray.length === 0) return;

    redoArray.push(drawnArray.pop());
    repaintHandler(1, 1);
}

function redoHandler() {
    if (redoArray.length === 0) return;

    drawnArray.push(redoArray.pop());
    repaintHandler(1, 1);
}

function resizeHandler() {
    const ratioWidth = window.innerWidth / canvas.width;
    const ratioHeight = window.innerHeight / canvas.height;

    // console.log(canvas.width);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    repaintHandler(ratioWidth, ratioHeight);
}

function zoomHandler(event) {
    if (event.ctrlKey === true || shape === "zoomIn" || shape === "zoomOut") {
        event.preventDefault();

        let zoomOut = event.deltaY < 0;
        if (shape === "zoomIn" || shape === "zoomOut") zoomOut = (shape === "zoomOut");
        console.log(zoomOut);

        if (zoomOut) {
            scaleFactor = Math.max(scaleFactor - zoomSpeed, 1);
        } else {
            scaleFactor = Math.min(scaleFactor + zoomSpeed, 10);
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
canvas.addEventListener('click', zoomHandler);
canvas.parentElement.addEventListener('wheel', zoomHandler);


// var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
// window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
// document.body.addEventListener('wheel', (event) => event.preventDefault())