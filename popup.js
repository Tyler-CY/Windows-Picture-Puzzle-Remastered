/********************************************************************
 Global Variables
 ********************************************************************/

let reshuffled = false;
let interval;
let pauseInterval = 0;
let pauseStartTime = 0;
let pauseEndTime = 0;
let startTime;
let paused = false;

/********************************************************************
 Constants
 ********************************************************************/

/* Grid display choices */
const GRID_DISPLAY_BLOCK = "block";
const GRID_DISPLAY_NONE = "none";

/* Transition Duration */
const TRANSITION_DURATION = "1s";

/* Hint Image Path */
const HINT_FULL_IMAGE = "url('res/numbers/numbers_full.png')";

/* Filter Effects */
const FILTER_NO_BLUR = "blur(0px)";
const FILTER_BLUR = "blur(6px)";
const FILTER_NONE = "none";
const FILTER_BRIGHTNESS = "brightness(0.25)";


/* main */
initializeGame();


/******************************************************************************************************
 Helper Functions
 ******************************************************************************************************/

/********************************************************************
 General Helper Functions
 ********************************************************************/

/**
 * Initialize the game. Called when the page first starts.
 */
function initializeGame() {
    initializeDOM();
    addListenerToGridItems()
    handleSwapButton();
}

/********************************************************************
 DOM Button Functions
 ********************************************************************/

/**
 * Initialize the buttons in the HTML.
 */
function initializeDOM() {
    document.getElementById("hint").addEventListener("click", handleHintButton);
    document.getElementById("swap").addEventListener("click", handleSwapButton);
    document.getElementById("clock").addEventListener("click", handleClockButton);
}

/**
 * Handler for the Swap Button.
 * Clicking this button alternates between generating the puzzle solution and shuffling the tiles.
 */
function handleSwapButton() {
    // Blur all the grids and the inner windows.
    startGridListAnimation(TRANSITION_DURATION, FILTER_BLUR);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_BLUR);

    if (checkIfGameIsWon()) {
        setTimeout(function () {
            shuffleTiles();
            startGridListAnimation(TRANSITION_DURATION, FILTER_NO_BLUR);
            startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
        }, 1000);

    } else {
        setTimeout(function () {
            setGridSolution();
            clearGridListAndInnerWindowAnimation();
        }, 1000);
    }


    // Timer begins when the tiles are reshuffled AND at least one tile is moved afterwards.
    reshuffled = true;

    // Reset timer
    resetTimer();

    // Reset Inner Window animation.
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
    document.getElementById("innerWindow").style.pointerEvents = "auto";
    clearWinningText();
}


/**
 * Handler for Hint Button.
 * Clicking this button alternates between showing the puzzle and the hint image.
 */
function handleHintButton() {
    // Find all grid-items.
    getAllGridItems();
    startGridListAnimation(TRANSITION_DURATION, FILTER_BLUR);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_BLUR);

    if (determineGridListVisibility() === GRID_DISPLAY_BLOCK) {
        setTimeout(function () {
            hideAllGrids();
            enableHintImageAndAnimation();
        }, 1000);
    } else {
        setTimeout(disableHintImageAndAnimation, 1000);
    }
}

/**
 * Handler for Clock Button.
 * Clicking this button toggles the timer (pause and unpause).
 */
function handleClockButton() {
    if (!paused) {
        clearInterval(interval);
        pauseStartTime = new Date().getTime();

    } else {
        pauseEndTime = new Date().getTime();
        pauseInterval += pauseEndTime - pauseStartTime;
        interval = setInterval(updateTimerText, 1000);
        pauseStartTime = 0;
    }

    // Reset the end time.
    pauseEndTime = 0;
    // Refresh the paused button.
    paused = !paused
}

/**
 * Add click listener to all grid-items to handling moving puzzles.
 */
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

/********************************************************************
 * Utility Helper Functions
 ********************************************************************/

/**********************************
 * Tile Moving Helper Functions
 **********************************/

/**
 * Moves the tile on the current grid to the adjacent available grid.
 * This method is called IF AND ONLY IF the reshuffle button is clicked.
 * @param parentId the DOM id of the tile clicked.
 */
function moveTileById(parentId) {
    moveSingleTile(parentId);
}

/**
 * Handles moving tiles when user clicks on a tile (grid).
 */
function moveTileByButton() {
    const parentId = event.currentTarget.id;

    moveSingleTile(parentId);

    // Check if the move is game-winning
    if (checkIfGameIsWon()) {
        clearInterval(interval);
        const winningText = createWinningTextElement();
        document.getElementById("outerWindow").appendChild(winningText);

        let innerWindow = document.getElementById("innerWindow");
        innerWindow.style.transition = TRANSITION_DURATION;
        innerWindow.style.filter = FILTER_BRIGHTNESS;
        innerWindow.style.pointerEvents = "none";
    }
}

/**
 * Helper function for moveTileById and moveTileByButton.
 * Moves a single tile of a particular id.
 * @param parentId the DOM id of the tile clicked.
 */
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

/**
 * Shuffle the tiles 500 times and move the empty grid to the bottom right corner.
 * Called when the shuffle button (swap button) is clicked and the grids are in game-winning condition.
 */
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

/**
 * Makes a random move based on the position of the empty grid.
 */
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

/**********************************
 * General Grid Helper Functions
 **********************************/

/**
 * Returns a NodeList of elements of class "grid-item"
 * @returns {NodeListOf<Element>} a NodeList of elements of class "grid-item". Length of NodeList is 16.
 */
function getAllGridItems() {
    return document.querySelectorAll(".grid-item");
}


/**
 * Show all the grids (elements of class grid-item) in inner window.
 */
function showGridList(gridList) {
    for (let i = 0; i < gridList.length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.display = GRID_DISPLAY_BLOCK;
    }
}


/**
 * Hide all the grids (elements of class grid-item) in inner window.
 */
function hideAllGrids() {
    const gridList = getAllGridItems();
    let length = gridList.length;
    for (let i = 0; i < length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.display = "none";
    }
}


/**
 * Returns the visibility of the grid list.
 * @returns {string} the visibility of the grid list. One of GRID_DISPLAY_BLOCK or GRID_DISPLAY_NONE.
 */
function determineGridListVisibility() {
    const gridList = getAllGridItems();
    let currentVisibility = GRID_DISPLAY_BLOCK;
    if (gridList[0].style.display === GRID_DISPLAY_NONE) {
        currentVisibility = GRID_DISPLAY_NONE;
    }
    return currentVisibility;
}


/**
 * Sets the grid solutions by rearranging the tiles.
 */
function setGridSolution() {
    const gridList = getAllGridItems();
    removeImagesInEachGrid();
    bindSolutionImageToEachGrid(gridList);
}


/**
 * Returns the row and column number of the grid.
 * @param grid - an element of class grid-item and has an id of format of "gridXY", where 0 <= X, Y <= 3.
 * @returns {{gridRow: number, gridCol: number}} - An object containing the row and column number of the grid parameter.
 */
function getGridRowAndColumn(grid) {
    let gridRow = Number(grid.id.slice(4, 5));
    let gridCol = Number(grid.id.slice(5));
    return {gridRow, gridCol};
}


/**
 * Returns the empty grid.
 * There is only one empty grid at any time.
 */
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

/**
 * Returns whether any of the neighbour grids of grid(gridRow, gridCol) is empty, and if true, returns the empty grid.
 * There is only one empty grid in the inner window at any time.
 * @param gridRow - a Number between 0 and 3 inclusive.
 * @param gridCol - a Number between 0 and 3 inclusive.
 * @returns {{ifCondition: boolean, targetGrid: HTMLElement}} - an object containing the boolean and the empty grid.
 *                                                              targetGrid can be null.
 */
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

/**
 * Append the correct image to each of the grid-items in Inner Window.
 */
function bindSolutionImageToEachGrid() {
    const gridList = getAllGridItems();
    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    const length = gridList.length;
    for (let i = 0; i < length - 1; i++) {
        const img = document.createElement("img");
        img.src = "res/numbers/numbers_" + (i + 1) + ".png";
        img.draggable = false;
        gridList[i].appendChild(img);
    }
}

/**
 * Returns an array of grids (HTML element of class inner-grid and tag div) which is adjacent to grid(gridRow, gridCol).
 * @param gridRow - a Number between 0 and 3 inclusive.
 * @param gridCol - a Number between 0 and 3 inclusive.
 * @returns {*[]} An array of grids (HTML element of class inner-grid and tag div).
 */
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

/**********************************
 * Effects Helper Functions
 **********************************/

/**
 * Start animation for all grid slots
 * @param transition - The duration of the transition animation
 * @param filter - the filter effect
 */
function startGridListAnimation(transition, filter) {
    let gridList = getAllGridItems();
    let length = gridList.length;
    for (let i = 0; i < length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.transition = transition;
        gridList[i].style.filter = filter;
    }
}

/**
 * Enable the hint image and its animation.
 * Called when the hint button is clicked and the hint is not shown yet.
 */
function enableHintImageAndAnimation() {
    document.getElementById("innerWindow").style.backgroundImage = HINT_FULL_IMAGE;
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
}

/**
 * Disable the hint image and its animation.
 * Called when the hint button is clicked and the hint is shown already.
 */
function disableHintImageAndAnimation() {
    const gridList = getAllGridItems();
    resetInnerWindowBackgroundImage();
    startGridListAnimation(TRANSITION_DURATION, FILTER_NONE)
    showGridList(gridList);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
}

/**
 * Clears the background image (hint image) of the inner window class.
 */
function resetInnerWindowBackgroundImage() {
    document.getElementById("innerWindow").style.backgroundImage = "none";
}

/**
 * Updates the timer text on the top of the screen.
 */
function updateTimerText() {

    // console.log("Duration from startTime: " + (new Date().getTime() - startTime) + "; pauseInterval: " + pauseInterval);
    let duration = (new Date().getTime() - startTime - pauseInterval) / 1000;

    // console.log(duration);
    let sec = Math.floor(duration % 60);
    let min = Math.floor(duration / 60) % 60;
    let hour = Math.floor(duration / 3600);
    document.getElementById("timerText").innerText = ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
}

/**
 * Starts animation specified by caller on Inner Window
 * @param transition - A string of the effect duration, e.g. "1s" or "500ms"
 * @param filter - A string of the effect filter wanted, e.g. "blur(1px)"
 */
function startInnerWindowAnimation(transition, filter) {
    document.getElementById("innerWindow").style.transition = transition;
    document.getElementById("innerWindow").style.filter = filter;
}


/**
 * Clear the animation of grid list and inner window.
 */
function clearGridListAndInnerWindowAnimation() {
    startGridListAnimation(TRANSITION_DURATION, FILTER_NO_BLUR);
    startInnerWindowAnimation(TRANSITION_DURATION, FILTER_NONE);
}

/**
 * Removes the img elements in each grid-item.
 */
function removeImagesInEachGrid() {
    const gridList = getAllGridItems();
    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    for (let i = 0; i < gridList.length; i++) {
        if (gridList[i].firstChild) {
            gridList[i].firstChild.remove();
        }
    }
}

/**********************************
 * Winning Text Helper Functions
 **********************************/

/**
 * Removes the winningText HTML element from the DOM.
 */
function clearWinningText() {
    const winningText = document.getElementById("winningText");
    if (winningText) {
        winningText.remove();
    }
}

/**
 * Creates a HTML element of tag p and is the winning text of the game.
 * @returns {HTMLParagraphElement} - a winning text element.
 */
function createWinningTextElement() {
    const winningText = document.createElement("p");
    winningText.id = "winningText";
    winningText.innerText = "You Won!";
    winningText.style.color = "white";
    winningText.style.filter = "brightness(1)";
    winningText.style.position = "absolute";
    winningText.style.left = "72px";
    winningText.style.top = "90px";
    winningText.style.textAlign = "center";
    return winningText;
}


/**********************************
 * Game Mechanism Helper Functions
 **********************************/


/**
 * Returns true if and only if the game is won by checking if the tiles are in the correct position.
 *
 */
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

/**********************************
 * Timer Helper Functions
 **********************************/

/**
 * Starts the timer and keep track of the time interval between timer starts and current time.
 * Also updates timerText.
 */
function startTimer() {
    // Start the timer when the FIRST tile is moved after reshuffling.
    if (reshuffled) {
        startTime = new Date().getTime();
        interval = setInterval(updateTimerText, 1000);
        reshuffled = false;
    }
}


/**
 * Clear timer intervals and reset timerText.
 */
function resetTimer() {
    // Clear previous timer and reset the time
    clearInterval(interval);
    document.getElementById("timerText").innerText = "00:00:00";
}

/**********************************
 * END
 **********************************/
























