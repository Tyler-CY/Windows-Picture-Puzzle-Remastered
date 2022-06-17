

addListenerToGridItems()
document.getElementById("hint").addEventListener("click", handleHintButton);


function handleHintButton(){
    const gridList = document.querySelectorAll(".grid-item");
    const length = gridList.length;

    // gridList[0].style.display is originally "" (empty string)
    var visibility = "block";
    if (gridList[0].style.display != "none"){
        visibility = "none";
    }

    for (let i = 0; i < length; i++) {
        gridList[i].style.display = visibility;
    }

    if (visibility == "none"){
        document.getElementById("innerWindow").style.backgroundImage="url('res/numbers/numbers_full.png')";
    }
    else {
        document.getElementById("innerWindow").style.backgroundImage="none";
    }
}

function addListenerToGridItems() {
    const gridList = document.querySelectorAll(".grid-item");
    const length = gridList.length;
    for (let i = 0; i < length; i++) {

        if (gridList[i].firstChild){
            gridList[i].firstChild.setAttribute("draggable", false);
        }
        gridList[i].addEventListener("click", deleteFirstChild);
    }
}

function deleteFirstChild(){
    var parentId = event.currentTarget.id
    var parentElement = document.getElementById(parentId);

    var gridNumber = Number(parentId.toString().slice(4));

    var ifCondition = false;
    var targetGrid;

    const topGridItem = document.getElementById("grid" + (gridNumber - 4));
    if (topGridItem != null && topGridItem.childNodes.length == 0){
        ifCondition = true;
        targetGrid = topGridItem;
    }
    const bottomGridItem = document.getElementById("grid" + (gridNumber + 4));
    if (bottomGridItem != null && bottomGridItem.childNodes.length == 0){
        ifCondition = true;
        targetGrid = bottomGridItem;
    }
    const leftGridItem = document.getElementById("grid" + (gridNumber - 1));
    if (leftGridItem != null && leftGridItem.childNodes.length == 0){
        ifCondition = true;
        targetGrid = leftGridItem;
    }
    const rightGridItem = document.getElementById("grid" + (gridNumber + 1));
    if (rightGridItem != null && rightGridItem.childNodes.length == 0){
        ifCondition = true;
        targetGrid = rightGridItem;
    }

    if (ifCondition){
            document.getElementById("testingOutput").innerText = gridNumber;
            targetGrid.appendChild(parentElement.firstChild);
    }


}