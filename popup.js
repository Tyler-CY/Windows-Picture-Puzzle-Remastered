var reshuffled = false;
var interval;
var pauseInterval = 0;
var pauseStartTime = 0;
var pauseEndTime = 0;
var startTime;
var paused = false;

initializeDOM();

addListenerToGridItems()

handleSwapButton();


/*
Helper Functions
 */

// Check if the tiles are in the correct position
function checkIfGameIsWon() {
    // Find all grid-items
    const gridList = document.querySelectorAll(".grid-item");

    const length = gridList.length;

    // if grid33 has a child (image), then the puzzle is not complete, so we can do an early return.
    if (gridList[15].firstChild) {
        return false;
    }

    // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
    for (let i = 0; i < length - 1; i++) {
        if (gridList[i].firstChild) {
            let correct_position = (gridList[i].firstChild.src.toString()).includes("_" + (i + 1));
            if (!correct_position){
                return false;
            }
        } else {
            return false;
        }
    }

    console.log("true");
    return true;
}

// Update timer
function updateTimerText() {

    //console.log(new Date().getTime(), startTime, pauseInterval)
    console.log("Duration from startTime: " + (new Date().getTime() - startTime) + "; pauseInterval: " + pauseInterval);
    let duration = (new Date().getTime() - startTime - pauseInterval) / 1000;


    console.log(duration);
    let sec = Math.floor(duration % 60);
    let min = Math.floor(duration / 60) % 60;
    let hour = Math.floor(duration / 3600);
    document.getElementById("timerText").innerText = ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);

}

// Pause the timer
function handleClockButton(){
    console.log("hi")
    if (!paused){
        clearInterval(interval);
        pauseStartTime = new Date().getTime();
        pauseEndTime = 0;
        console.log("startTime: " + startTime + "; pauseStartTime: " + pauseStartTime + "; pauseEndTime: " + pauseEndTime + "; pauseInterval: " + pauseInterval);


    }
    else{
        pauseEndTime = new Date().getTime();
        pauseInterval += pauseEndTime - pauseStartTime;
        interval = setInterval(updateTimerText, 1000);
        pauseStartTime = 0;
        pauseEndTime = 0;
        console.log("startTime: " + startTime + "; pauseStartTime: " + pauseStartTime + "; pauseEndTime: " + pauseEndTime + "; pauseInterval: " + pauseInterval);
    }

    paused = !paused
}

// Initialize Buttons of the DOM.
function initializeDOM() {
    document.getElementById("hint").addEventListener("click", handleHintButton);
    document.getElementById("swap").addEventListener("click", handleSwapButton);
    document.getElementById("clock").addEventListener("click", handleClockButton);
}

// Shuffle the tiles.
function handleSwapButton() {
    if (checkIfGameIsWon()){
        for (let i = 0; i < 500; i++) {
            makeRandomMove();
        }

        const emptyGrid = findEmptyGrid();
        // Extract grid row and column
        let gridRow = Number(emptyGrid.id.slice(4, 5));
        let gridCol = Number(emptyGrid.id.slice(5));
        console.log(gridRow, gridCol);

        // Moves the empty slot to the bottom right corner.
        while (gridRow !== 3) {
            moveTileById("grid" + (gridRow + 1) + gridCol);
            gridRow += 1;
        }
        while (gridCol !== 3) {
            moveTileById("grid" + gridRow + (gridCol + 1));
            gridCol += 1;
        }
    }
    else{
        // Moves the tiles to the winning positions
        // Find all grid-items
        const gridList = document.querySelectorAll(".grid-item");

        const length = gridList.length;

        // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
        for (let i = 0; i < length; i++) {
            if (gridList[i].firstChild) {
                gridList[i].firstChild.remove();
            }
        }
        // For each grid-item (in gridList), prevent the grid image from being dragged and add moving function to each grid.
        for (let i = 0; i < length - 1; i++) {
            var img = document.createElement("img");
            img.src = "res/numbers/numbers_" + (i + 1) + ".png";
            img.draggable = false;
            gridList[i].appendChild(img);
        }
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
    document.getElementById("testtext").innerText = "";
}

// Makes a random move based on the position of the empty grid.
function makeRandomMove() {
    const emptyGrid = findEmptyGrid();

    // Find out the number of adjacent grids to the empty grid so we can randomly draw on of the grids to move.
    let adjacentGrids = [];

    // Extract grid row and column
    let gridRow = Number(emptyGrid.id.slice(4, 5));
    let gridCol = Number(emptyGrid.id.slice(5));

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

    // Choose a random grid.
    const randomGrid = adjacentGrids[Math.floor(Math.random() * adjacentGrids.length)];
    moveTileById(randomGrid.id);
}

// Returns the grid-item element (div) which is currently empty.
function findEmptyGrid() {
    // Find all grid-items
    const gridList = document.querySelectorAll(".grid-item");

    const length = gridList.length;

    // Check each grid and returns the one which is empty. There should only be one empty grid.
    for (let i = 0; i < length; i++) {
        if (!gridList[i].firstChild) {
            return gridList[i];
        }
    }
}


// Handler for Hint Button. Toggles between the puzzle and the hint image.
function handleHintButton() {
    const gridList = document.querySelectorAll(".grid-item");
    const length = gridList.length;

    // gridList[0].style.display is originally "" (empty string)
    // Determine what the visibility of the 16 grids should be changed to.
    let visibility = "block";
    if (gridList[0].style.display !== "none") {
        visibility = "none";
    }
    for (let i = 0; i < length; i++) {
        // Change the visibility of the 16 grids.
        gridList[i].style.display = visibility;
    }

    // Change the background to the final full image as a hint, and revert it back if the hint button is clicked again.
    if (visibility === "none") {
        document.getElementById("innerWindow").style.backgroundImage = "url('res/numbers/numbers_full.png')";
    } else {
        document.getElementById("innerWindow").style.backgroundImage = "none";
    }
}

// Initialize the grid items to listen to clicking.
function addListenerToGridItems() {
    // Find all grid-items
    const gridList = document.querySelectorAll(".grid-item");

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

function moveSingleTile(parentId) {
    // Extract grid row and column.
    const gridRow = Number(parentId.slice(4, 5));
    const gridCol = Number(parentId.slice(5));


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

    // Check if we can move the tile.
    if (ifCondition) {
        const parentElement = document.getElementById(parentId);
        // Swap images.
        targetGrid.appendChild(parentElement.firstChild);

        // Start the timer when the FIRST tile is moved after reshuffling.
        if (reshuffled) {
            startTime = new Date().getTime();
            interval = setInterval(updateTimerText, 1000);
            reshuffled = false;
        } else {
            // document.getElementById("testtext").innerText = "Currently In Game";
        }

    }


}

// Moves the tile on the current grid to the adjacent available grid.
// This method is called IF AND ONLY IF a tile is moved by a user
function moveTileByButton() {
    const parentId = event.currentTarget.id;
    moveSingleTile(parentId);

    // Check if the move is game-winning
    if (checkIfGameIsWon()){
        clearInterval(interval);
        // TODO: change to overlay
        document.getElementById("testtext").innerText = "You Won!";
    }
}

// Moves the tile on the current grid to the adjacent available grid.
// This method is called IF AND ONLY IF the reshuffle button is clicked.
function moveTileById(parentId) {
    moveSingleTile(parentId);
}