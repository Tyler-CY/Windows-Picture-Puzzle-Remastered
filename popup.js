var testingOutput = document.getElementById("testingOutput");


var innerWindow = document.getElementById("innerWindow");

for (i = 0; i < innerWindow.childNodes.length; i++){
    var gridItem = innerWindow.childNodes[i];
    if (typeof(gridItem) == "HTMLDivElement"){

        testingOutput.innerText += gridItem.toString()
    }

}

addListenerToGridItems()

function addListenerToGridItems() {
    const gridList = document.querySelectorAll(".grid-item");
    const length = gridList.length;
    for (let i = 0; i < length; i++) {
        gridList[i].addEventListener("click", deleteFirstChild);
    }
}

function deleteFirstChild(){
    var parentId = event.currentTarget.id
    var parentElement = document.getElementById(parentId);

    var gridNumber = Number(parentId.toString().slice(4));

    // if (document.getElementById("grid" + (gridNumber - 4))

    document.getElementById("testingOutput").innerText = gridNumber;

    var childNodesCount = parentElement.childNodes.length;
    for (let i = 0; i < childNodesCount; i++){
        parentElement.childNodes[i].remove();
    }
}