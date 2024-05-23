// const { data } = require("autoprefixer");

const dataPen = document.querySelector('[data-pen]');
const dataEraser = document.querySelector('[data-eraser]');
const dataEraserContainer = document.querySelector('[data-eraserContainer]');
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

const toolbarOptions = {
    pen: { name: dataPen },
    eraser: { name: dataEraserContainer, child: dataEraser },
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
let strokeColor = '#000000';
let backgroundColor = '#9ca3af';
let drawnArray = [];
let redoArray = [];
let curDrawing = [];
let isDragging = false;
let shape = "pen";
let toggleList = null;
let toolbarOption = "pen";

// Zooming
let scaleFactor = 1.0;
const zoomSpeed = 0.1;

function toolbarOptionHandler(option) {
    console.log(toolbarOptions[option]);
    if (option === "multipleShapes" || option === "zoom" || option === "lineWidth" || option === "colorPicker" || option === "eraser") {
        console.log("hello", option);
        toggleListHandler(option);
    }
    else {
        toolbarOptions[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptions[option].name.classList.add('bg-gray-400');
        toolbarOption = option;
    }
}


function toggleListHandler(name) {
    toolbarOptions[toggleList]?.child?.classList?.add("slideUp");
    toolbarOptions[toggleList]?.child?.classList?.remove("slideDown");

    // console.log("list", list);

    // console.log("name", name);
    if (name === toggleList) {
        toggleList = null; return;
    }
    toggleList = name;
    if (toolbarOptions[toggleList].child.classList.contains("slideUp")) {
        toolbarOptions[toggleList].child.classList.remove("slideUp");
        toolbarOptions[toggleList].child.classList.add("slideDown");
    }
    else {
        toolbarOptions[toggleList].child.classList.add("slideUp");
        toolbarOptions[toggleList].child.classList.remove("slideDown");
    }
}

// function to handle the shape and toolbar.
function shapeAndToolHandler(shapeName, event) {
    shape = shapeName;
    if (shape === "straightLine" || shape === "circle" || shape === "rectangle" ||
        shape === "solidCircle" || shape === "solidRectangle") {
        toolbarOptions[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptions.multipleShapes.name.classList.add('bg-gray-400');
        toolbarOption = "multipleShapes";
    }
    else if (shape === "basicEraser" || shape === "objectEraser") {
        toolbarOptions[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptions.eraser.name.classList.add('bg-gray-400');
        toolbarOption = "eraser";
    }
    else if (shape === "zoomIn" || shape === "zoomOut") {
        toolbarOptions[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptions.zoom.name.classList.add('bg-gray-400');
        toolbarOption = "zoom";
    }
    else if (shape !== "pen" && shape !== "hand") {
        toggleListHandler(shape);
    }
    console.log(shape);
    event.stopPropagation();
}

// function to adjust the line/pen width.
function lineWidthAdjustmentHandler(event) {
    event.stopPropagation();
    lineWidth = lineWidthSlider.value;

    // slider background color.
    const min = event.target.min;
    const max = event.target.max;
    lineWidthSlider.style.background = `linear-gradient(to right, #0E61DE 0%, #0E61DE 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 100%)`
}


// function to handle the stroke color and background color.
function colorPickerHandler(event) {
    event.stopPropagation();
    if (event.target.name === 'strokeColor') {
        strokeColor = event.target.value;
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


// Function to start drawing.
function startDrawing(event) {
    console.log("startDrawing");

    if (shape === "hand") {
        isDragging = true;
        isDrawing = false;
    }
    else { // shapes
        isDrawing = true;
        isDragging = false;

        curDrawing = [];
    }
    [startX, startY] = adjustCoordinates(event.clientX, event.clientY);
}

// function to check if the point is below the line.
function isPointBelowTheline(line, point) {
    //     // Eq of line: y-y1 = ((y2-y1)/(x2-x1))*(x-x1);
    return (line.Y2 - line.Y1) * (point.X - line.X2) -
        (line.X2 - line.X1) * (point.Y - line.Y2) >= 0;
}

// function to check if the point is inside the rectangle.
function isPointInsideTheRectangle(rectangle, point) {
    console.log(rectangle, point);

    return rectangle.X1 <= point.X && point.X <= rectangle.X2 &&
        rectangle.Y1 <= point.Y && point.Y <= rectangle.Y2;
}

// function to check if the point is inside the circle.
function isPointInsideTheCircle(circle, point) {
    const dist = Math.sqrt(Math.pow((circle.X - point.X), 2) + Math.pow((circle.Y - point.Y), 2));

    // console.log(dist, circle.radius, dist <= circle.radius);
    return dist <= circle.radius;
}

// function to erase object.
function eraseObject(startX, startY, endX, endY) {
    for (let i = 0; i < drawnArray.length; i++) {
        if (curDrawing.includes(i)) continue;

        for (let j = 0; j < drawnArray[i].length; j++) {
            let shapeInfo = drawnArray[i][j].shape;
            const point1 = { X: startX, Y: startY };
            const point2 = { X: endX, Y: endY };

            if (shapeInfo?.name === "pen" || shapeInfo?.name === "straightLine") {
                const line1 = {
                    X1: shapeInfo.startX, Y1: shapeInfo.startY,
                    X2: shapeInfo.endX, Y2: shapeInfo.endY,
                    width: shapeInfo.lineWidth,
                };
                const line2 = {
                    X1: point1.X, Y1: point1.Y,
                    X2: point2.X, Y2: point2.Y,
                    width: lineWidth,
                };
                const point3 = { X: line1.X1, Y: line1.Y1 };
                const point4 = { X: line1.X2, Y: line1.Y2 };

                if (isPointBelowTheline(line1, point1) !== isPointBelowTheline(line1, point2) &&
                    isPointBelowTheline(line2, point3) !== isPointBelowTheline(line2, point4)) {
                    curDrawing.push(i);
                    console.log("line", i);
                    break;
                }
            }
            else if (shapeInfo?.name === "circle") {
                const circle = {
                    X: shapeInfo.startX, Y: shapeInfo.startY,
                    radius: shapeInfo.radius,
                }

                if ((isPointInsideTheCircle(circle, point1) !== isPointInsideTheCircle(circle, point2)) ||
                    ((isPointInsideTheCircle(circle, point1) || isPointInsideTheCircle(circle, point2)) && shapeInfo?.solid)) {
                    curDrawing.push(i);
                    console.log("circle", i);
                    break;
                }
            }
            else if (shapeInfo?.name === "rectangle") {
                const rectangle = {
                    X1: shapeInfo.startX, Y1: shapeInfo.startY,
                    X2: shapeInfo.startX + shapeInfo.width, Y2: shapeInfo.startY + shapeInfo.height,
                };
                console.log(rectangle);

                if ((isPointInsideTheRectangle(rectangle, point1) !== isPointInsideTheRectangle(rectangle, point2)) ||
                    ((isPointInsideTheRectangle(rectangle, point1) || isPointInsideTheRectangle(rectangle, point2)) && shapeInfo?.solid)) {
                    curDrawing.push(i);
                    console.log("rectangle", i);
                    break;
                }
            }
        }
    }
}

// function to erase basic.
function eraseBasic(startX, startY, endX, endY, lineWidth) {
    context.beginPath();
    context.strokeStyle = backgroundColor;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

// function to draw line.
function drawLine(startX, startY, endX, endY, lineWidth, style, isErasing = 0) {
    context.beginPath();
    context.strokeStyle = style + (isErasing ? "88" : "ff");
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

// function to draw rectangle.
function drawRectangle(startX, startY, width, height, lineWidth,
    style, solid, isErasing = 0) {
    context.beginPath();
    context.strokeStyle = style + (isErasing ? "88" : "ff");
    context.lineWidth = lineWidth;
    context.rect(startX, startY, width, height);

    // solid: fill the rectangle.
    if (solid) {
        context.fillStyle = style + (isErasing ? "88" : "ff");
        context.fill();
    }
    context.stroke();
}

// function to draw circle.
function drawCircle(startX, startY, radius, lineWidth, style, solid, isErasing = 0) {
    context.beginPath();
    context.strokeStyle = style + (isErasing ? "88" : "ff");
    context.lineWidth = lineWidth;
    context.arc(startX, startY, radius, 0, 2 * Math.PI);

    // solid: fill the circle.
    if (solid) {
        context.fillStyle = style + (isErasing ? "88" : "ff");
        context.fill();
    }
    context.stroke();
}

// Function to draw the path on mouse movement.
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
            drawLine(prevX, prevY, curX, curY, lineWidth, strokeColor);

            // store path.
            const temp = {
                shape: {
                    name: "pen",
                    startX: prevX, startY: prevY, endX: curX, endY: curY,
                    style: strokeColor, lineWidth: lineWidth,
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
            drawCircle(prevX, prevY, radius, lineWidth, strokeColor, (shape === "solidCircle"));

            // store.
            curDrawing = [{
                shape: {
                    name: "circle",
                    startX: prevX, startY: prevY, radius: radius,
                    style: strokeColor, lineWidth: lineWidth,
                    solid: (shape === "solidCircle"),
                }
            }];
        }
        else if (shape === "rectangle" || shape === "solidRectangle") {
            const [_startX, _startY] = [Math.min(startX, curX), Math.min(startY, curY)];
            const width = Math.abs(curX - startX);
            const height = Math.abs(curY - startY);

            repaintHandler(1, 1);
            drawRectangle(_startX, _startY, width, height, lineWidth, strokeColor, (shape === "solidRectangle"));

            // store.
            curDrawing = [{
                shape: {
                    name: "rectangle",
                    startX: _startX, startY: _startY, width: width, height: height,
                    style: strokeColor, lineWidth: lineWidth,
                    solid: (shape === "solidRectangle"),
                }
            }];
        }

        else if (shape === "basicEraser" || shape === "objectEraser") {
            const [prevX, prevY] = [startX, startY];

            if (shape === "basicEraser") {
                eraseBasic(prevX, prevY, curX, curY, lineWidth);

                // store
                curDrawing.push({
                    shape: {
                        name: "basicEraser",
                        startX: prevX, startY: prevY, endX: curX, endY: curY,
                        lineWidth: lineWidth,
                    }
                });
            } else {// eraser: objectEraser.
                repaintHandler(1, 1);
                eraseObject(prevX, prevY, curX, curY);
            }

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

        // bug: code working properly when undefined function is called. 
        xyz();

        // Update the last position.
        startX = curX;
        startY = curY;
    }
    // console.log(curDrawing);
}

// Function to stop drawing and store the path in drawnArray.
function stopDrawing() {
    isDrawing = false;
    isDragging = false;

    if (curDrawing.length !== 0) {
        if (shape === "objectEraser") {
            // sort the array in ascending order.
            curDrawing.sort((a, b) => a - b);

            // update the curDrawing: storing index and its content.
            for (let i = curDrawing.length - 1; i >= 0; i--) {
                const idx = curDrawing[i];

                curDrawing[i] = {
                    shape: "objectEraser",
                    index: idx,
                    content: drawnArray[idx],
                }
                drawnArray.splice(idx, 1);
            }
        }
        // store path.
        drawnArray.push(curDrawing);

        // console.log(drawnArray);
        // console.log(curDrawing);

        repaintHandler(1, 1);
        curDrawing = [];
        redoArray = [];
    }
}

// Function to repaint the canvas.
function repaintHandler(ratioWidth, ratioHeight) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawnArray.length; i++) {
        if (drawnArray[i]?.shape === "objectEraser") continue;

        for (let j = 0; j < drawnArray[i].length; j++) {
            let shapeInfo = drawnArray[i][j].shape;

            if (shapeInfo?.name === "pen" || shapeInfo?.name === "straightLine") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.endX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.endY *= ratioHeight;

                drawLine(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.endX, shapeInfo.endY,
                    shapeInfo.lineWidth, shapeInfo.style, curDrawing.includes(i));
            }
            else if (shapeInfo?.name === "circle") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.radius *= (ratioWidth + ratioHeight) / 2;

                drawCircle(shapeInfo.startX, shapeInfo.startY, shapeInfo.radius,
                    shapeInfo.lineWidth, shapeInfo.style,
                    shapeInfo.solid, curDrawing.includes(i));
            }
            else if (shapeInfo?.name === "rectangle") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.width *= ratioWidth;
                shapeInfo.height *= ratioHeight;
                shapeInfo.lineWidth *= (ratioWidth + ratioHeight) / 2;

                drawRectangle(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.width, shapeInfo.height,
                    shapeInfo.lineWidth, shapeInfo.style,
                    shapeInfo.solid, curDrawing.includes(i));
            }
            else if (shapeInfo?.name === "basicEraser") {
                shapeInfo.startX *= ratioWidth;
                shapeInfo.endX *= ratioWidth;
                shapeInfo.startY *= ratioHeight;
                shapeInfo.endY *= ratioHeight;

                eraseBasic(shapeInfo.startX, shapeInfo.startY,
                    shapeInfo.endX, shapeInfo.endY,
                    shapeInfo.lineWidth);
            }
        }
    }
}

// Function to undo the last path.
function undoHandler() {
    if (drawnArray.length === 0) return;

    const undoItem = drawnArray.pop();
    redoArray.push(undoItem);
    if (undoItem[0]?.shape === "objectEraser") {
        for (let i = 0; i < undoItem.length; i++) {
            drawnArray.splice(undoItem[i].index, 0, undoItem[i].content);
        }
    }
    repaintHandler(1, 1);
}

// Function to redo the last path.
function redoHandler() {
    if (redoArray.length === 0) return;

    const redoItem = redoArray.pop();
    drawnArray.push(redoItem);
    if (redoItem[0]?.shape === "objectEraser") {
        for (let i = redoItem.length - 1; i >= 0; i--) {
            drawnArray.splice(redoItem[i].index, 1);
        }
    }
    repaintHandler(1, 1);
}

// Function to resize the canvas.
function resizeHandler() {
    const ratioWidth = window.innerWidth / canvas.width;
    const ratioHeight = window.innerHeight / canvas.height;

    // console.log(canvas.width);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    repaintHandler(ratioWidth, ratioHeight);
}

// Function to zoom in or zoom out the canvas.
function zoomHandler(event) {
    if (event.ctrlKey === true || shape === "zoomIn" || shape === "zoomOut") {
        event.preventDefault();

        const zoomOut = (event.deltaY < 0) || (shape === "zoomOut");
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


// Function to adjust the coordinates based on the canvas position and zoom factor.
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