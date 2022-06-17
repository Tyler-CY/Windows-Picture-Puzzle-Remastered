addListenerToGridItems()
document.getElementById("hint").addEventListener("click", handleHintButton);
document.getElementById("swap").addEventListener("click", handleSwapButton)

/*
Helper Functions
 */

// Shuffle the tiles
function handleSwapButton() {
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

// Makes a random move based on the position of the empty grid
function makeRandomMove() {
    const emptyGrid = findEmptyGrid();

    // Find out the number of adjacent grids to the empty grid so we can randomly draw on of the grids to move
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

    // Choose a random grid
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

// Initialize the grid items to listen to clicking
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
    // Extract grid row and column
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
        targetGrid.appendChild(parentElement.firstChild);
    }
}

// Moves the tile on the current grid to the adjacent available grid.
function moveTileByButton() {
    const parentId = event.currentTarget.id;
    moveSingleTile(parentId);
}

// Moves the tile on the current grid to the adjacent available grid.
function moveTileById(parentId) {
    moveSingleTile(parentId);
}