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

const toolbarOptionsObject = {
    pen: { name: dataPen },
    eraser: { name: dataEraserContainer, child: dataEraser },
    hand: { name: dataHand },
    zoom: { name: dataZoom, child: dataZoomInOut },
    multipleShapes: { name: dataMultipleShapes, child: dataListOfShapes },
    lineWidth: { name: dataLineWidthContainer, child: dataLineWidth },
    colorPicker: { name: dataColorPickerConatiner, child: dataColorPicker },
};

// Get the canvas element
const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = 'high';

// footer
// const clearPageButton = document.querySelector("[data-clearPageButton]");
const deletePageButton = document.querySelector("[data-deletePageButton]");
const prevPageButton = document.querySelector("[data-prevPageButton]");
const nextAndAddPageButton = document.querySelector("[data-nextAndAddPageButton]");

// const notesContainer = document.querySelector("[data-notesConatiner]");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables to track the drawing state
let pages = [{
    backgroundColor: '#9ca3af',
    drawnArray: [],
    redoArray: [],
    scaleFactor: 1.0,
}];
let curPageNo = 0;

let notes = {};
let noteNo = 0;
console.log("script.js", notes);


// Variables to keep track of the current page.
let isDrawing = false;
let isDragging = false;
let lineWidth = 2;
let startX = 0;
let startY = 0;
let strokeColor = '#000000';
let shape = "pen";
let curDrawing = [];
let toolbarOption = "pen";
let toggleList = null;

let backgroundColor = pages[curPageNo].backgroundColor;
let drawnArray = pages[curPageNo].drawnArray;
let redoArray = pages[curPageNo].redoArray;
let offsetX = 0;
let offsetY = 0;

// zoom
const zoomSpeed = 0.2;
let scaleFactor = pages[curPageNo].scaleFactor;


function toolbarOptionHandler(option) {
    if (option === "multipleShapes" || option === "zoom" || option === "lineWidth" || option === "colorPicker" || option === "eraser") {
        toggleListHandler(option);
    }
    else {
        toolbarOptionsObject[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptionsObject[option].name.classList.add('bg-gray-400');
        toolbarOption = option;
    }
}


function toggleListHandler(name) {
    toolbarOptionsObject[toggleList]?.child?.classList?.add("slideUp");
    toolbarOptionsObject[toggleList]?.child?.classList?.remove("slideDown");

    // console.log("list", toggleList);

    // console.log("name", name);
    if (name === toggleList) {
        toggleList = null; return;
    }
    toggleList = name;
    if (toolbarOptionsObject[toggleList].child.classList.contains("slideUp")) {
        toolbarOptionsObject[toggleList].child.classList.remove("slideUp");
        toolbarOptionsObject[toggleList].child.classList.add("slideDown");
    }
    else {
        toolbarOptionsObject[toggleList].child.classList.add("slideUp");
        toolbarOptionsObject[toggleList].child.classList.remove("slideDown");
    }
}

// function to handle the shape and toolbar.
function shapeAndToolHandler(shapeName, event) {
    shape = shapeName;
    if (shape === "straightLine" || shape === "circle" || shape === "rectangle" ||
        shape === "solidCircle" || shape === "solidRectangle") {
        toolbarOptionsObject[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptionsObject.multipleShapes.name.classList.add('bg-gray-400');
        toolbarOption = "multipleShapes";
    }
    else if (shape === "basicEraser" || shape === "objectEraser") {
        toolbarOptionsObject[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptionsObject.eraser.name.classList.add('bg-gray-400');
        toolbarOption = "eraser";
    }
    else if (shape === "zoomIn" || shape === "zoomOut") {
        toolbarOptionsObject[toolbarOption].name.classList.remove('bg-gray-400');
        toolbarOptionsObject.zoom.name.classList.add('bg-gray-400');
        toolbarOption = "zoom";
    }
    else if (shape === "pen" || shape === "hand") {
        toolbarOptionHandler(shape);
    }
    else {
        toggleListHandler(shape);
    }
    // else if (shape !== "pen" && shape !== "hand") {
    //     toggleListHandler(shape);
    // }
    console.log(shape);
    event.stopPropagation();
}

// function to adjust the line/pen width.
function lineWidthAdjustmentHandler(event) {
    lineWidth = lineWidthSlider.value;

    // slider background color.
    const min = event.target.min;
    const max = event.target.max;
    lineWidthSlider.style.background = `linear-gradient(to right, #0E61DE 0%, #0E61DE 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 
        ${(lineWidth - min) / (max - min) * 100}%, #261263 100%)`;

    event.stopPropagation();
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
    // Eq of line: y-y1 = ((y2-y1)/(x2-x1))*(x-x1);
    return (line.Y2 - line.Y1) * (point.X - line.X2) -
        (line.X2 - line.X1) * (point.Y - line.Y2) >= 0;
}


// function to check if the point is inside the rectangle.
function isPointInsideTheRectangle(rectangle, point) {
    return rectangle.X1 <= point.X && point.X <= rectangle.X2 &&
        rectangle.Y1 <= point.Y && point.Y <= rectangle.Y2;
}


// function to check if the point is inside the circle.
function isPointInsideTheCircle(circle, point) {
    const dist = Math.sqrt(Math.pow((circle.X - point.X), 2) + Math.pow((circle.Y - point.Y), 2));

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
                    break;
                }
            }
            else if (shapeInfo?.name === "rectangle") {
                const rectangle = {
                    X1: shapeInfo.startX, Y1: shapeInfo.startY,
                    X2: shapeInfo.startX + shapeInfo.width, Y2: shapeInfo.startY + shapeInfo.height,
                };

                if ((isPointInsideTheRectangle(rectangle, point1) !== isPointInsideTheRectangle(rectangle, point2)) ||
                    ((isPointInsideTheRectangle(rectangle, point1) || isPointInsideTheRectangle(rectangle, point2)) && shapeInfo?.solid)) {
                    curDrawing.push(i);
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
            }
            else {// eraser: objectEraser.
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

// function to modify the current drawing array for objectEraser.
function modifyCurrentDrawingArray() {
    for (let i = curDrawing.length - 1; i >= 0; i--) {
        const idx = curDrawing[i];
        curDrawing[i] = {
            shape: "objectEraser",
            index: idx,
            content: drawnArray[idx],
        };
        drawnArray.splice(idx, 1);
    }
}

// Function to stop drawing and store the path in drawnArray.
function stopDrawing() {
    isDrawing = false;
    isDragging = false;

    if (curDrawing.length !== 0) {
        if (shape === "objectEraser") {
            // sort the curDrawing array in ascending order.
            curDrawing.sort((a, b) => a - b);

            modifyCurrentDrawingArray();
        }
        // store path.
        drawnArray.push(curDrawing);

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

function deletePageHandler() {
    if (curPageNo === pages.length - 2) {
        nextAndAddPageButton.innerHTML = "Add";
    }
    if (curPageNo === 1 && pages.length === 2) {
        prevPageButton.classList.add("hidden");
        deletePageButton.classList.add("hidden");
    }
    console.log(curPageNo, pages.length);

    // last page cannot be deleted.
    if (pages.length === 1) return;

    // delete the current page and update the page no.
    pages.splice(curPageNo, 1);
    if (curPageNo === pages.length) curPageNo--;

    // update the global variables.
    drawnArray = pages[curPageNo].drawnArray;
    redoArray = pages[curPageNo].redoArray;
    backgroundColor = pages[curPageNo].backgroundColor;
    scaleFactor = pages[curPageNo].scaleFactor;

    // update the canvas.
    canvas.style.backgroundColor = backgroundColor;
    scaleCanvas(scaleFactor);
    repaintHandler(1, 1);
}

// function to update the current page.
function updateCurrentPageHandler() {
    pages[curPageNo].drawnArray = drawnArray;
    pages[curPageNo].redoArray = redoArray;
    pages[curPageNo].backgroundColor = backgroundColor;
    pages[curPageNo].scaleFactor = scaleFactor;
}

// function updateVariablesOnPageChangeHandler() {
//     drawnArray = pages[curPageNo].drawnArray;
//     redoArray = pages[curPageNo].redoArray;
//     backgroundColor = pages[curPageNo].backgroundColor;
//     scaleFactor = pages[curPageNo].scaleFactor;
// }

function clearPageHandler() {
    pages[curPageNo].drawnArray = [];
    pages[curPageNo].redoArray = [];
    drawnArray = [];
    redoArray = [];
    repaintHandler(1, 1);
}

// function to move to the next page and add new page.
function nextAndAddPageHandler() {
    if (curPageNo === pages.length - 2) {
        nextAndAddPageButton.innerHTML = "Add";
    }
    if (curPageNo === 0) {
        prevPageButton.classList.remove("hidden");
    }
    if (pages.length === 1) {
        deletePageButton.classList.remove("hidden");
    }
    // console.log("next", curPageNo, pages.length);

    // update the current page.
    updateCurrentPageHandler();

    // add new page.
    if (curPageNo === pages.length - 1) {
        pages.push({
            drawnArray: [],
            redoArray: [],
            backgroundColor: backgroundColor,
            scaleFactor: 1,
        });
        curPageNo++;

        // update the global variables.
        drawnArray = [];
        redoArray = [];
        scaleFactor = 1;
    }
    // move to the next page.
    else {
        // update the global variables.
        curPageNo++;
        drawnArray = pages[curPageNo].drawnArray;
        redoArray = pages[curPageNo].redoArray;
        backgroundColor = pages[curPageNo].backgroundColor;
        scaleFactor = pages[curPageNo].scaleFactor;

        // update the canvas.
        canvas.style.backgroundColor = backgroundColor;
    }

    // reset the canvas.
    scaleCanvas(scaleFactor);
    repaintHandler(1, 1);
}

// function to move to the previous page.
function prevPageHandler() {
    if (curPageNo === 0) return;
    else if (curPageNo === 1) {
        prevPageButton.classList.add("hidden");
    }
    if (curPageNo === pages.length - 1) {
        nextAndAddPageButton.innerHTML = "Next";
    }

    // console.log("prev", curPageNo, pages.length);

    // update the current page.
    updateCurrentPageHandler();

    // update the global variables.
    curPageNo--;
    drawnArray = pages[curPageNo].drawnArray;
    redoArray = pages[curPageNo].redoArray;
    backgroundColor = pages[curPageNo].backgroundColor;
    scaleFactor = pages[curPageNo].scaleFactor;

    // update the canvas.
    canvas.style.backgroundColor = backgroundColor;
    scaleCanvas(scaleFactor);
    repaintHandler(1, 1);
}

// Function to resize the canvas.
function resizeHandler() {
    const ratioWidth = window.innerWidth / canvas.width;
    const ratioHeight = window.innerHeight / canvas.height;

    console.log("resizeHandler", ratioWidth, ratioHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    repaintHandler(ratioWidth, ratioHeight);
}

// Function to calculate the zoom factor.
function calculateZoom(event) {
    event.preventDefault();

    const zoomIn = (event.deltaY < 0) || (shape === "zoomIn");
    console.log(zoomIn);

    if (zoomIn) {
        scaleFactor = Math.min(scaleFactor + zoomSpeed, 3);
    } else {
        scaleFactor = Math.max(scaleFactor - zoomSpeed, 1);
    }

    return scaleFactor;
}

function makeCursorInCenter(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // horizontal scale factor
    const scaleY = canvas.height / rect.height; // vertical scale factor

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // const cursorX = centerX * scaleX;
    // const cursorY = centerY * scaleY;
    const [curX, curY] = adjustCoordinates(event.clientX, event.clientY);
    console.log(curX, curY);

    const translateX = (startX - curX) * scaleFactor;
    const translateY = (startY - curY) * scaleFactor;

    window.scrollBy(translateX, translateY);
}

// function to scale the canvas.
function scaleCanvas(scaleFactor, event) {
    if (scaleFactor > 1) {
        canvas.style.marginTop = `${canvas.height * (scaleFactor - 1) * 0.5 - 4 * scaleFactor}px`;
        canvas.style.marginLeft = `${canvas.width * (scaleFactor - 1) * 0.5 - 7 * scaleFactor}px`;
    } else if (scaleFactor <= 1) {
        canvas.style.marginTop = `${0}px`;
        canvas.style.marginLeft = `${0}px`;
    }
    canvas.style.transform = `scale(${scaleFactor})`;
    makeCursorInCenter(event);
}

// function to handle the zoom in and zoom out.
function zoomHandler(event) {
    if (shape === "zoomIn" || shape === "zoomOut") {
        const scale = calculateZoom(event);
        scaleCanvas(scale, event);
    }
}


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
// canvas.parentElement.addEventListener('wheel', zoomHandler);



//-------------------------------------------------------------------------------------------------------------------------------------------------------
// new features
// console.log(document.getElementById("notesConatiner"));
// console.log('hello', document.querySelector("[data-notesContainer]"));
const notesContainer = document.querySelector("[data-notesContainer]");

let left = 0, up = 0;
let curNoteNo = '';
const dataNote = document.querySelector('[data-note]');


function deleteNoteHandler(event) {
    const id = event.target.parentElement.parentElement.id;

    // delete the note.
    delete notes[id];
    document.getElementById(id).remove();

    // notes[id].removeEventListener('click', deleteNoteHandler);
    console.log("deleteNoteHandler", event.target.parentElement.parentElement);
}


function minimiseNoteHandler(event) {
    const textArea = event.target.parentElement.parentElement.children[1];
    textArea.classList.toggle('hidden');

    console.log("minimiseNoteHandler", event.target.parentElement.parentElement.children[1]);
}


let zIndex = 0;

function addNoteHandler() {
    console.log("addNoteHandler", notes);

    const id = `data-note${noteNo}`;

    const newNote = dataNote.cloneNode(true);
    newNote.id = id;
    newNote.classList.remove('hidden');

    notes[id] = newNote;
    console.log(newNote.children);

    notesContainer.appendChild(notes[id]);

    // console.log(notesContainer);
    noteNo++;
}

function startNoteDrag(event) {
    let target;
    if (event.target.id === 'notesContainer') {
        console.log("notesContainer");
        return;
    }
    else if (event.target.nodeName === 'TEXTAREA' || (event.target.nodeName === 'DIV' && event.target.id !== 'data-note')) {
        console.log("TEXTAREA");
        target = event.target.parentElement;
    }
    else if (event.target.nodeName === 'INPUT') {
        console.log("INPUT");
        target = event.target.parentElement.parentElement;
    }
    else {
        console.log("ELSE");
        target = event.target;
    }


    target.style.zIndex = `${zIndex++}`;
    console.log("target", target.classList);
    // console.log(target);
    const rect = target.getBoundingClientRect();
    left = event.clientX - rect.left;
    up = event.clientY - rect.top;

    console.log(left, up);

    // get note id
    curNoteNo = target.id;
}


function noteDragHandler(event) {
    // console.log("note", curNoteNo);
    if (curNoteNo === '') return;

    // const id = event.target.id;
    const id = curNoteNo;

    // console.log(note[curNote].classList);

    const x = event.clientX - left;
    const y = event.clientY - up;
    // console.log(x, y);

    notes[id].style.left = `${x}px`;
    notes[id].style.top = `${y}px`;
    // console.log("noteDragHandler", event);
}

function stopNoteDrag() {
    curNoteNo = '';
}

// console.log(notesContainer);
notesContainer.addEventListener('mousedown', startNoteDrag);
notesContainer.addEventListener('mousemove', noteDragHandler);
notesContainer.addEventListener('mouseup', stopNoteDrag);


// var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
// window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
// document.body.addEventListener('wheel', (event) => event.preventDefault())