let reshuffled = false;
let interval;
let pauseInterval = 0;
let pauseStartTime = 0;
let pauseEndTime = 0;
let startTime;
let paused = false;

initializeDOM();

addListenerToGridItems()

// handleSwapButton();


/*
Helper Functions
 */

function getAllGridItems() {
    return document.querySelectorAll(".grid-item");
}

// Check if the tiles are in the correct position
function checkIfGameIsWon() {

    // Find all grid-items.
    const gridList = getAllGridItems();
    // Get the number of grid items.
    const length = gridList.length;

    // if grid33 (bottom right corner of the tiles) has a child (i.e. image),
    // then the puzzle is not complete, so we can do an early return.
    if (gridList[15].firstChild) {
        return false;
    }

    // Check correct position of each grid
    for (let i = 0; i < length - 1; i++) {
        if (gridList[i].firstChild) {
            // Check if the correct image is in the right tile by comparing the grid slot number and the image src.
            let correct_position = (gridList[i].firstChild.src.toString()).includes("_" + (i + 1));
            if (!correct_position) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}

// Update timer
function updateTimerText() {

    // console.log("Duration from startTime: " + (new Date().getTime() - startTime) + "; pauseInterval: " + pauseInterval);
    let duration = (new Date().getTime() - startTime - pauseInterval) / 1000;

    // console.log(duration);
    let sec = Math.floor(duration % 60);
    let min = Math.floor(duration / 60) % 60;
    let hour = Math.floor(duration / 3600);
    document.getElementById("timerText").innerText = ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
}

// Pause the timer
function handleClockButton() {
    if (!paused) {
        clearInterval(interval);
        pauseStartTime = new Date().getTime();
        pauseEndTime = 0;
        // console.log("startTime: " + startTime + "; pauseStartTime: " + pauseStartTime + "; pauseEndTime: " + pauseEndTime + "; pauseInterval: " + pauseInterval);

    } else {
        pauseEndTime = new Date().getTime();
        pauseInterval += pauseEndTime - pauseStartTime;
        interval = setInterval(updateTimerText, 1000);
        pauseStartTime = 0;
        pauseEndTime = 0;
        // console.log("startTime: " + startTime + "; pauseStartTime: " + pauseStartTime + "; pauseEndTime: " + pauseEndTime + "; pauseInterval: " + pauseInterval);
    }

    paused = !paused
}

// Initialize Buttons of the DOM.
function initializeDOM() {
    document.getElementById("hint").addEventListener("click", handleHintButton);
    document.getElementById("swap").addEventListener("click", handleSwapButton);
    document.getElementById("clock").addEventListener("click", handleClockButton);
}

function startGridListAnimation(gridList, transition, filter) {
    let length = gridList.length;
    for (let i = 0; i < length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.transition = transition;
        gridList[i].style.filter = filter;
    }
}

// Shuffle the tiles.
const TRANSITION_DURATION = "1s";

const FILTER_BLUR = "blur(6px)";

const FILTER_NONE = "none";

function shuffleTiles() {
    for (let i = 0; i < 500; i++) {
        makeRandomMove();
    }

    const emptyGrid = findEmptyGrid();
    // Extract grid row and column from the id string.
    let {gridRow, gridCol} = getGridRowAndColumn(emptyGrid);

    // Moves the empty slot to the bottom right corner.
    // Moves the empty grid downwards until it reaches the bottom row.
    while (gridRow !== 3) {
        moveTileById("grid" + (gridRow + 1) + gridCol);
        gridRow += 1;
    }
    // Moves the empty grid rightwards until reaches the right boundary.
    while (gridCol !== 3) {
        moveTileById("grid" + gridRow + (gridCol + 1));
        gridCol += 1;
    }
}

function startInnerWindowAnimation(transition, filter) {
    document.getElementById("innerWindow").style.transition = transition;
    document.getElementById("innerWindow").style.filter = filter;
}

const FILTER_NO_BLUR = "blur(0px)";

function clearGridListAndInnerWindowAnimation(gridList) {
    return function () {
        startGridListAnimation(gridList, TRANSITION_DURATION, FILTER_NO_BLUR);
        startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
    };
}

function removeImagesInEachGrid(gridList) {
    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    for (let i = 0; i < gridList.length; i++) {
        if (gridList[i].firstChild) {
            gridList[i].firstChild.remove();
        }
    }
}

function bindSolutionImageToEachGrid(gridList) {
    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    const length = gridList.length;
    for (let i = 0; i < length - 1; i++) {
        const img = document.createElement("img");
        img.src = "res/numbers/numbers_" + (i + 1) + ".png";
        img.draggable = false;
        gridList[i].appendChild(img);
    }
}

function setGridSolution(gridList) {
    removeImagesInEachGrid(gridList);
    bindSolutionImageToEachGrid(gridList);
}

function handleSwapButton() {
    const gridList = getAllGridItems();
    const length = gridList.length;

    // Blur all the grids and the inner windows.
    startGridListAnimation(gridList, TRANSITION_DURATION, FILTER_BLUR);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_BLUR);


    if (checkIfGameIsWon()) {
        setTimeout(function () {
            shuffleTiles();

            setTimeout(function () {
                for (let i = 0; i < length; i++) {
                    // Change the visibility of the 16 grids.
                    gridList[i].style.transition = TRANSITION_DURATION;
                    gridList[i].style.filter = FILTER_NO_BLUR;
                }
                startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);

            }, 100);


        }, 1000);


    } else {
        setTimeout(function () {
            // Moves the tiles to the winning positions
            // Find all grid-items
            const gridList = getAllGridItems();

            setGridSolution(gridList);

            setTimeout(clearGridListAndInnerWindowAnimation(gridList), 100);
        }, 1000);

    }


    /*
    Always do below
     */
    // Timer begins when the tiles are reshuffled AND at least one tile is moved afterwards.
    reshuffled = true;
    // Clear previous timer and reset the time
    clearInterval(interval);
    document.getElementById("timerText").innerText = "00:00:00";
    // Remove the clear winning message
    // TODO: change to overlay

    // document.getElementById("winningText").remove();

    let innerWindow = document.getElementById("innerWindow");
    innerWindow.style.transition = TRANSITION_DURATION;
    innerWindow.style.filter = "none";
    innerWindow.style.pointerEvents = "auto";

    document.getElementById("testtext").innerText = "";
}

function getAdjacentGrids(gridRow, gridCol) {
    // Find out the number of adjacent grids to the empty grid so we can randomly draw on of the grids to move.
    let adjacentGrids = [];
    // Update numOfAdjacentGrids by checking the four adjacent grids.
    const topGridItem = document.getElementById("grid" + (gridRow - 1) + gridCol);
    // If the adjacent grid is non null then add one to the number of adjacent grids.
    if (topGridItem) {
        adjacentGrids.push(topGridItem);
    }
    // Logic same as above.
    const bottomGridItem = document.getElementById("grid" + +(gridRow + 1) + gridCol);
    if (bottomGridItem) {
        adjacentGrids.push(bottomGridItem);
    }
    const leftGridItem = document.getElementById("grid" + gridRow + (gridCol - 1));
    if (leftGridItem) {
        adjacentGrids.push(leftGridItem);
    }
    const rightGridItem = document.getElementById("grid" + gridRow + (gridCol + 1));
    if (rightGridItem) {
        adjacentGrids.push(rightGridItem);
    }
    return adjacentGrids;
}

function getGridRowAndColumn(grid) {
    let gridRow = Number(grid.id.slice(4, 5));
    let gridCol = Number(grid.id.slice(5));
    return {gridRow, gridCol};
}

// Makes a random move based on the position of the empty grid.
function makeRandomMove() {
    const emptyGrid = findEmptyGrid();

    // Extract grid row and column from the id string
    let {gridRow, gridCol} = getGridRowAndColumn(emptyGrid);

    let adjacentGrids = getAdjacentGrids(gridRow, gridCol);

    // Choose a random grid.
    const randomGrid = adjacentGrids[Math.floor(Math.random() * adjacentGrids.length)];

    // Make a random move based on the grid chosen.
    moveTileById(randomGrid.id);
}

// Returns the grid-item element (div) which is currently empty.
function findEmptyGrid() {
    // Find all grid-items.
    const gridList = getAllGridItems();
    // Get the number of grid items.
    const length = gridList.length;

    // Check each grid and returns the one which is empty. There should only be one empty grid.
    for (let i = 0; i < length; i++) {
        if (!gridList[i].firstChild) {
            return gridList[i];
        }
    }
}


function hideAllGrids(gridList) {
    let length = gridList.length;
    for (let i = 0; i < length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.display = "none";
    }
}

const GRID_DISPLAY_BLOCK = "block";

function determineGridlistVisibility(gridList) {
    let currentVisibility = GRID_DISPLAY_BLOCK;
    if (gridList[0].style.display === "none") {
        currentVisibility = "none";
    }
    return currentVisibility;
}

const HINT_FULL_IMAGE = "url('res/numbers/numbers_full.png')";

function enableHintImageAndAnimation() {
    document.getElementById("innerWindow").style.backgroundImage = HINT_FULL_IMAGE;
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
}

function resetInnerWindowBackgroundImage() {
    document.getElementById("innerWindow").style.backgroundImage = "none";
}

function showGridList(gridList) {
    for (let i = 0; i < gridList.length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.display = GRID_DISPLAY_BLOCK;
    }
}

function disableHintImageAndAnimation() {
    const gridList = getAllGridItems();
    resetInnerWindowBackgroundImage();
    startGridListAnimation(gridList, TRANSITION_DURATION, FILTER_NONE)
    showGridList(gridList);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
}

// Handler for Hint Button. Toggles between the puzzle and the hint image.
function handleHintButton() {
    // Find all grid-items.
    const gridList = getAllGridItems();

    startGridListAnimation(gridList, TRANSITION_DURATION, FILTER_BLUR);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_BLUR);

    if (determineGridlistVisibility(gridList) === GRID_DISPLAY_BLOCK) {
        setTimeout(function () {
            hideAllGrids(gridList);

            // Change the background to the final full image as a hint, and revert it back if the hint button is clicked again.
            setTimeout(enableHintImageAndAnimation, 100);
        }, 1000);
    } else {
        setTimeout(disableHintImageAndAnimation, 1000);
    }
}

// Initialize the grid items to listen to clicking.
function addListenerToGridItems() {
    // Find all grid-items
    const gridList = getAllGridItems();

    const length = gridList.length;

    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    for (let i = 0; i < length; i++) {
        if (gridList[i].firstChild) {
            gridList[i].firstChild.ondragstart = function () {
                return false;
            };
        }
        gridList[i].addEventListener("click", moveTileByButton);
    }
}

function checkIfNeighbouringGridsAreEmpty(gridRow, gridCol) {
    // ifCondition checks if any of the four neighbour grids is empty.
    let ifCondition = false;
    // targetGrid is the grid which is currently empty on the board.
    let targetGrid;

    // Update ifCondition and targetGrid by checking the four adjacent grids.
    const topGridItem = document.getElementById("grid" + (gridRow - 1) + gridCol);
    // If the adjacent grid is empty, then it has no childNodes.
    if (topGridItem != null && topGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = topGridItem;
    }

    // Logic same as above.

    const bottomGridItem = document.getElementById("grid" + (gridRow + 1) + gridCol);
    if (bottomGridItem != null && bottomGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = bottomGridItem;
    }

    const leftGridItem = document.getElementById("grid" + gridRow + (gridCol - 1));
    if (leftGridItem != null && leftGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = leftGridItem;
    }

    const rightGridItem = document.getElementById("grid" + gridRow + (gridCol + 1));
    if (rightGridItem != null && rightGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = rightGridItem;
    }
    return {ifCondition, targetGrid};
}

function startTimer() {
    // Start the timer when the FIRST tile is moved after reshuffling.
    if (reshuffled) {
        startTime = new Date().getTime();
        interval = setInterval(updateTimerText, 1000);
        reshuffled = false;
    }
}

function moveSingleTile(parentId) {
    // The grid clicked.
    let grid = document.getElementById(parentId);

    // Extract grid row and column from the id string
    let {gridRow, gridCol} = getGridRowAndColumn(grid);
    let {ifCondition, targetGrid} = checkIfNeighbouringGridsAreEmpty(gridRow, gridCol);

    // Check if we can move the tile.
    if (ifCondition) {
        // Swap images between the two grids.
        targetGrid.appendChild(grid.firstChild);

        // Start the Timer and update the timer text.
        startTimer();
    }


}

// Moves the tile on the current grid to the adjacent available grid.
// This method is called IF AND ONLY IF a tile is moved by a user
// parentId is the div (class grid-item)
function moveTileByButton() {
    const parentId = event.currentTarget.id;

    moveSingleTile(parentId);

    // Check if the move is game-winning
    if (checkIfGameIsWon()) {
        clearInterval(interval);
        // TODO: change to overlay


        const winningText = document.createElement("p");
        winningText.id = "winningText";
        winningText.innerText = "You Won!";
        winningText.style.color = "white";
        winningText.style.filter = "brightness(1)";
        winningText.style.position = "absolute";
        winningText.style.left = "72px";
        winningText.style.top = "90px";
        winningText.style.textAlign = "center";
        document.getElementById("outerWindow").appendChild(winningText);

        let innerWindow = document.getElementById("innerWindow");
        innerWindow.style.transition = TRANSITION_DURATION;
        innerWindow.style.filter = "brightness(0.25)";
        innerWindow.style.pointerEvents = "none";
        document.getElementById("testtext").innerText = "You Won!";
    }
}

// Moves the tile on the current grid to the adjacent available grid.
// This method is called IF AND ONLY IF the reshuffle button is clicked.
function moveTileById(parentId) {
    moveSingleTile(parentId);
}