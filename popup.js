addListenerToGridItems()
document.getElementById("hint").addEventListener("click", handleHintButton);


/*
Helper Functions
 */

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
        gridList[i].addEventListener("click", deleteFirstChild);
    }
}

function deleteFirstChild() {
    const parentId = event.currentTarget.id;
    const parentElement = document.getElementById(parentId);

    // Extract the grid number (e.g. extract 15 from "grid15").
    const gridNumber = Number(parentId.toString().slice(4));

    // ifCondition checks if any of the four neighbour grids is empty.
    let ifCondition = false;
    // targetGrid is the grid which is currently empty on the board.
    let targetGrid;

    // Update ifCondition and targetGrid by checking the four adjacent grids.
    const topGridItem = document.getElementById("grid" + (gridNumber - 4));
    // If the adjacent grid is empty, then it has no childNodes.
    if (topGridItem != null && topGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = topGridItem;
    }
    // Logic same as above.
    const bottomGridItem = document.getElementById("grid" + (gridNumber + 4));
    if (bottomGridItem != null && bottomGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = bottomGridItem;
    }
    const leftGridItem = document.getElementById("grid" + (gridNumber - 1));
    if (leftGridItem != null && leftGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = leftGridItem;
    }
    const rightGridItem = document.getElementById("grid" + (gridNumber + 1));
    if (rightGridItem != null && rightGridItem.childNodes.length === 0) {
        ifCondition = true;
        targetGrid = rightGridItem;
    }

    // Check if we can move the tile.
    if (ifCondition) {
        targetGrid.appendChild(parentElement.firstChild);
    }


}