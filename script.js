const dataPen = document.querySelector('[data-pen]');
const dataEraser = document.querySelector('[data-eraser]');
const dataEraserSibling = document.querySelector('[data-eraserSibling]');
const dataMultipleShapes = document.querySelector('[data-multipleShapes]');
const dataZoom = document.querySelector('[data-zoom]');
const dataHand = document.querySelector('[data-hand]');
const dataLineWidthContainer = document.querySelector('[data-strokeWidth]');
const dataColorPickerSibling = document.querySelector('[data-colorPickerSibling]');

const lineWidthSlider = document.querySelector('[data-lineWidthSlider]');
const dataLineWidth = document.querySelector('[data-lineWidth]');

const dataListOfShapes = document.querySelector('[data-ListOfShapes]');
const dataColorPicker = document.querySelector('[data-colorPicker]');
const dataZoomInOut = document.querySelector('[data-zoomInOut]');

const toolbarOptionsObject = {
    pen: { name: dataPen },
    eraser: { name: dataEraserSibling, child: dataEraser },
    hand: { name: dataHand },
    zoom: { name: dataZoom, child: dataZoomInOut },
    multipleShapes: { name: dataMultipleShapes, child: dataListOfShapes },
    lineWidth: { name: dataLineWidthContainer, child: dataLineWidth },
    colorPicker: { name: dataColorPickerSibling, child: dataColorPicker },
};


// Get the canvas element
const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = 'high';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const deletePageButton = document.querySelector("[data-deletePageButton]");
const prevPageButton = document.querySelector("[data-prevPageButton]");
const nextAndAddPageButton = document.querySelector("[data-nextAndAddPageButton]");
const container = document.querySelector("[data-container]");
const dataNote = document.querySelector('[data-note]');

// Variables to track the drawing state
let pages = [{
    backgroundColor: '#ffffff',
    drawnArray: [],
    redoArray: [],
}];
let curPageNo = 0;

// note
let notes = {};
let noteNo = 0;
let zIndexPriority = 0;
let curNoteNo = '';
let curNoteOffsetX = 0;
let curNoteOffsetY = 0;

// zoom
const zoomSpeed = 0.2;
let scaleFactor = 1.0;

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

function toolbarOptionColorHandler(option) {
    // bg-gray-200 text-blue-400

    // previous option.
    toolbarOptionsObject[toolbarOption].name.classList.remove('bg-blue-400');
    toolbarOptionsObject[toolbarOption].name.classList.remove('text-white');
    toolbarOptionsObject[toolbarOption].name.classList.add('text-blue-400');
    toolbarOptionsObject[toolbarOption].name.classList.add('bg-gray-200');

    // selected option.
    toolbarOptionsObject[option].name.classList.remove('text-blue-400');
    toolbarOptionsObject[option].name.classList.remove('bg-gray-200');
    toolbarOptionsObject[option].name.classList.add('bg-blue-400');
    toolbarOptionsObject[option].name.classList.add('text-white');
}

function toolbarOptionHandler(option) {
    if (option === "multipleShapes" || option === "zoom" || option === "lineWidth" || option === "colorPicker" || option === "eraser") {
        toggleListHandler(option);
    }
    else {
        toolbarOptionColorHandler(option);
        toolbarOption = option;
    }
}


function toggleListHandler(name) {
    toolbarOptionsObject[toggleList]?.child?.classList?.add("animate-slideUp");
    toolbarOptionsObject[toggleList]?.child?.classList?.remove("animate-slideDown");

    if (name === toggleList) {
        toggleList = null; return;
    }
    toggleList = name;
    if (toolbarOptionsObject[toggleList].child.classList.contains("animate-slideUp")) {
        toolbarOptionsObject[toggleList].child.classList.remove("animate-slideUp");
        toolbarOptionsObject[toggleList].child.classList.add("animate-slideDown");
    }
    else {
        toolbarOptionsObject[toggleList].child.classList.add("animate-slideUp");
        toolbarOptionsObject[toggleList].child.classList.remove("animate-slideDown");
    }
}

// function to handle the shape and toolbar.
function shapeAndToolHandler(shapeName, event) {
    shape = shapeName;
    if (shape === "straightLine" || shape === "circle" || shape === "rectangle" ||
        shape === "solidCircle" || shape === "solidRectangle") {
        toolbarOptionColorHandler("multipleShapes");
        toolbarOption = "multipleShapes";
    }
    else if (shape === "basicEraser" || shape === "objectEraser") {
        toolbarOptionColorHandler("eraser");
        toolbarOption = "eraser";
    }
    else if (shape === "zoomIn" || shape === "zoomOut") {
        toolbarOptionColorHandler("zoom");
        toolbarOption = "zoom";
    }
    else if (shape === "pen" || shape === "hand") {
        toolbarOptionHandler(shape);
    }
    else {
        toggleListHandler(shape);
    }
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
function redoHandler(event) {
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

// function to delete the current page.
function deletePageHandler() {
    if (curPageNo === pages.length - 2) {
        nextAndAddPageButton?.children[0].classList.add("fa-plus");
        nextAndAddPageButton?.children[0]?.classList.remove("fa-arrow-right");
    }
    if (pages.length === 2) {
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

    // update the canvas.
    canvas.style.backgroundColor = backgroundColor;
    repaintHandler(1, 1);
}

// function to update the current page.
function updateCurrentPageHandler() {
    pages[curPageNo].drawnArray = drawnArray;
    pages[curPageNo].redoArray = redoArray;
    pages[curPageNo].backgroundColor = backgroundColor;
}

// function to clear the current page.
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
        nextAndAddPageButton?.children[0].classList.add("fa-plus");
        nextAndAddPageButton?.children[0]?.classList.remove("fa-arrow-right");
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
        });
        curPageNo++;

        // update the global variables.
        drawnArray = [];
        redoArray = [];
    }
    // move to the next page.
    else {
        // update the global variables.
        curPageNo++;
        drawnArray = pages[curPageNo].drawnArray;
        redoArray = pages[curPageNo].redoArray;
        backgroundColor = pages[curPageNo].backgroundColor;

        // update the canvas.
        canvas.style.backgroundColor = backgroundColor;
    }

    // reset the canvas.
    repaintHandler(1, 1);
}

// function to move to the previous page.
function prevPageHandler() {
    if (curPageNo === 0) return;
    else if (curPageNo === 1) {
        prevPageButton.classList.add("hidden");
    }
    if (curPageNo === pages.length - 1) {
        // nextAndAddPageButton
        console.log(nextAndAddPageButton);
        // console.log(nextAndAddPageButton?.children[0]);
        nextAndAddPageButton?.children[0].classList.remove("fa-plus");
        nextAndAddPageButton?.children[0]?.classList.add("fa-arrow-right");
        // nextAndAddPageButton.innerHTML = "Next";
    }

    // console.log("prev", curPageNo, pages.length);

    // update the current page.
    updateCurrentPageHandler();

    // update the global variables.
    curPageNo--;
    drawnArray = pages[curPageNo].drawnArray;
    redoArray = pages[curPageNo].redoArray;
    backgroundColor = pages[curPageNo].backgroundColor;

    // update the canvas.
    canvas.style.backgroundColor = backgroundColor;
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


    const [curX, curY] = adjustCoordinates(event.clientX, event.clientY);
    const translateX = (startX - curX) * scaleFactor;
    const translateY = (startY - curY) * scaleFactor;

    window.scrollBy(translateX, translateY);
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


function saveImage() {
    const dataURL = canvas.toDataURL('image/png');

    // create a link.
    const link = document.createElement('a');
    link.href = dataURL;

    link.download = 'image.png';
    link.click();
}

function deleteNoteHandler(event) {
    const id = event.target.parentElement.parentElement.id;

    // delete the note.
    delete notes[id];
    document.getElementById(id).remove();

    // console.log("deleteNoteHandler", event.target.parentElement.parentElement);
}


function minimiseNoteHandler(event) {
    const textArea = event.target.parentElement.parentElement.children[1];
    textArea.classList.toggle('hidden');

    // console.log("minimiseNoteHandler", event.target.parentElement.parentElement.children[1]);
}

function addNoteHandler() {
    console.log("addNoteHandler", notes);

    const id = `data-note${noteNo}`;

    const newNote = dataNote.cloneNode(true);
    newNote.id = id;
    newNote.classList.remove('hidden');

    notes[id] = newNote;
    // console.log(newNote.children);

    container.appendChild(notes[id]);

    // console.log(container);
    noteNo++;
}

function startNoteDrag(event) {
    let target;
    // console.log(event.target);

    // find the target element.
    if (event.target.id === 'container' || event.target.nodeName === 'CANVAS') {
        return;
    }
    else if (event.target.nodeName === 'TEXTAREA' || (event.target.nodeName === 'DIV' && event.target.parentElement.id !== 'container')) {
        target = event.target.parentElement;
    }
    else if (event.target.nodeName === 'INPUT') {
        target = event.target.parentElement.parentElement;
    }
    else {
        target = event.target;
    }


    // update the z-index.
    target.style.zIndex = `${zIndexPriority++}`;


    // console.log("target", target.classList);
    const rect = target.getBoundingClientRect();
    curNoteOffsetX = event.clientX - rect.left;
    curNoteOffsetY = event.clientY - rect.top;

    // console.log(curNoteOffsetX, curNoteOffsetY);

    // get note id
    curNoteNo = target.id;
}


function noteDragHandler(event) {
    if (curNoteNo === '') return;

    const id = curNoteNo;
    const x = event.clientX - curNoteOffsetX;
    const y = event.clientY - curNoteOffsetY;

    notes[id].style.left = `${x}px`;
    notes[id].style.top = `${y}px`;
}

function stopNoteDrag() {
    curNoteNo = '';
}

container.addEventListener('mousedown', startNoteDrag);
container.addEventListener('mousemove', noteDragHandler);
container.addEventListener('mouseup', stopNoteDrag);

container.addEventListener('touchstart', startNoteDrag);
container.addEventListener('touchmove', noteDragHandler);
container.addEventListener('touchend', stopNoteDrag);