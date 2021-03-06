let urlParams = new URLSearchParams(window.location.search);
let boardID = urlParams.get('boardID');

let resUrl = "";
let currImgElm = "";
let rotateMdl = false;

// I use the filestack API for image upload and preview. However, since this is a free account, the upload limitation is only 50.
const client = filestack.init("AV9sVjeWPToiHvAgHFopUz");
// Here is an alternative api I created for image upload in case the limit of 50 uploads have been used up.
// const client = filestack.init("AKBtROQNyQAyQAZ9ThAHIz");

const options = {
  onFileSelected: (file) => {
    // If you throw any error in this function it will reject the file selection.
    // The error message will be displayed to the user as an alert.
    if (file.size > 1000 * 10000) {
      throw new Error("File too big, select something smaller than 10MB");
    }
  },
  onUploadDone: (res) => {
    resUrl = res.filesUploaded[0].url;
    let elmnt = document.getElementById(currImgElm);
    sendImgUrl(resUrl, elmnt);
  },
};

const body = document.getElementsByTagName("body")[0];
const addTextBtn = document.getElementById("addTextBtn");
const addImgBtn = document.getElementById("addImgBtn");
const addModelBtn = document.getElementById("addModelBtn");

const modal = document.getElementById("myModal");
const closeIcon = document.getElementsByClassName("close")[0];
const myLoader = document.getElementById("myLoader");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let curZ = 0;

let modelContainers = {};

// API Key for EchoAR platform where I used for accessing 3D models.
const ECHO_KEY = "billowing-paper-1356";

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
body.onclick = (event) => {
  if (!event.target.matches(".dropbtn")) closeDropdown();
};

function closeDropdown() {
  let dropdowns = document.getElementsByClassName("dropdown-content");
  let i;
  for (i = 0; i < dropdowns.length; i++) {
    let openDropdown = dropdowns[i];
    if (openDropdown.classList.contains("show")) {
      openDropdown.classList.remove("show");
    }
  }
}

function closeMdl(itm) {
  itm.parentNode.parentNode.style.display = "none";
}

function requestAddText() {
  closeDropdown();
  let reqData = {
    boardID,
    zIdx: curZ,
    top: window.scrollY,
    left: window.scrollX,
  }
  socket.emit("requestAddText", reqData);
}

function requestAddImg() {
  closeDropdown();
  let reqData = {
    boardID,
    zIdx: curZ,
    top: window.scrollY,
    left: window.scrollX,
  }
  socket.emit("requestAddImg", reqData);
}

function requestAddModel() {
  closeDropdown();
  let reqData = {
    boardID,
    zIdx: curZ,
    top: window.scrollY,
    left: window.scrollX,
  }
  socket.emit("requestAddModel", reqData);
}

socket.on("newText", updateTextLayer);
socket.on("textUpdated", updateTextLayer);

socket.on("newImg", updateImgLayer);
socket.on("imgUpdated", updateImgLayer);

socket.on("newModel", updateModelFrame);
socket.on("resetMdlPos", updateModelFrame);

// text
function updateTextLayer(data) {
  let textData = data.filter(txt => txt.boardID === boardID);
  for (let txt of textData) {
    if (!document.getElementById(txt["id"])) {
      let newTextArea = document.createElement("div");
      let newText = document.createElement("textarea");
      let divDelBtn = document.createElement("div");

      if (txt["content"]) newText.value = txt["content"];

      divDelBtn.textContent = "x";
      divDelBtn.className = "divBtn";
      divDelBtn.id = "del" + txt["id"];

      newTextArea.appendChild(newText);
      newTextArea.appendChild(divDelBtn);

      divDelBtn.onclick = function () {
        let txtData = {
          boardID,
          id: txt["id"]
        }
        socket.emit("TextLayerDelete", txtData);
      };

      newTextArea.className = "newItem newTextLayer";
      newText.className = "newText";
      newText.placeholder = "Input Text Content";

      newTextArea.id = txt["id"];
      newTextArea.style.top = txt["top"];
      newTextArea.style.left = txt["left"];

      newTextArea.onclick = () => newText.focus();
      newTextArea.ondblclick = () => bringToFront(newTextArea);
      newText.onchange = () => updateTextContent(newTextArea);

      body.appendChild(newTextArea);
    } else {
      let textArea = document.getElementById(txt.id);
      if (txt["content"]) textArea.children[0].value = txt["content"];
    }
  }
  resetPosition(data);
}

function updateTextContent(data) {
  let textData = {
    // skt: sktID,
    boardID,
    id: data.id,
    zIdx: data.style.zIndex,
    content: data.children[0].value,
    top: data.style.top,
    left: data.style.left,
    width: data.style.width,
    height: data.style.height,
  };
  socket.emit("updateText", textData);
}

function deleteTextLayer(data) {
  if (document.getElementById(data)) document.getElementById(data).remove();
}

socket.on("TextLayerDeleted", deleteTextLayer);

// img
function updateImgLayer(data) {
  let imgData = data.filter(img => img.boardID === boardID);
  for (let img of imgData) {
    if (!document.getElementById(img.id)) {
      let newImgArea = document.createElement("div");
      let newImg = document.createElement("img");
      let divImgBtn = document.createElement("div");
      let divDelBtn = document.createElement("div");
      let instruction = document.createElement("p");
      instruction.className = "instruction";
      instruction.textContent =
        "Click the top-left '+' sign to embed an image.";

      divImgBtn.textContent = "+";
      divImgBtn.className = "divBtn";
      divImgBtn.id = "add" + img["id"];

      divDelBtn.textContent = "x";
      divDelBtn.className = "divBtn";
      divDelBtn.id = "del" + img["id"];

      newImgArea.appendChild(newImg);
      newImgArea.appendChild(divDelBtn);
      newImgArea.appendChild(divImgBtn);
      newImgArea.appendChild(instruction);

      if (img["url"]) {
        newImg.src = img["url"];
        instruction.textContent = "";
      }

      divDelBtn.onclick = function () {
        let imgD = {
          boardID,
          id: img.id
        }
        socket.emit("ImgLayerDelete", imgD);
      };

      newImgArea.className = "newItem";
      newImg.className = "newImg";

      newImgArea.id = img["id"];
      newImgArea.style.top = img["top"];
      newImgArea.style.left = img["left"];

      divImgBtn.onclick = () => addImgUrl(newImgArea);
      newImgArea.ondblclick = () => bringToFront(newImgArea);

      body.appendChild(newImgArea);
    } else {
      let imgArea = document.getElementById(img["id"]);
      if (img["url"]) {
        imgArea.children[0].src = img["url"];
        if (
          imgArea.children[3] &&
          imgArea.children[3].className === "Instruction"
        )
          instruction.textContent = "";
      }
    }
  }
  resetPosition(data);
}

function addImgUrl(elmnt) {
  currImgElm = elmnt.id;
  client.picker(options).open();
}

function sendImgUrl(url, elmnt) {
  let imgData = {
    boardID,
    id: elmnt.id,
    zIdx: elmnt.style.zIndex,
    top: elmnt.style.top,
    left: elmnt.style.left,
    width: elmnt.style.width,
    height: elmnt.style.height,
    url: url,
  };
  socket.emit("updateImg", imgData);
  console.log(document.getElementById(elmnt.id));
  document.getElementById(elmnt.id).childNodes[3].textContent = "";
}

function deleteImgLayer(data) {
  if (document.getElementById(data)) document.getElementById(data).remove();
}

socket.on("imgLayerDeleted", deleteImgLayer);

// model
function updateModelFrame(data) {
  let mdlData = data.filter(mdl => mdl.boardID === boardID);
  for (let model of mdlData) {
    if (!document.getElementById(model.id)) {
      let newDiv = document.createElement("div");
      newDiv.className = "newItem newModel";
      newDiv.id = model["id"];
      newDiv.style.top = model["top"];
      newDiv.style.left = model["left"];

      let newFrame = document.createElement("iframe");
      newFrame.className = "modelFrame";
      newFrame.allow = "autoplay; fullscreen; vr";
      newFrame.allowvr = "true";
      newFrame.allowfullscreen = "true";
      newFrame.mozallowfullscreen = "true";
      newFrame.webkitallowfullscreen = "true";

      let divModelBtn = document.createElement("div");
      divModelBtn.textContent = "+";
      divModelBtn.className = "divBtn";
      divModelBtn.id = "add" + model["id"];

      let divDelBtn = document.createElement("div");
      divDelBtn.textContent = "x";
      divDelBtn.className = "divBtn";
      divDelBtn.id = "del" + model["id"];

      newDiv.appendChild(newFrame);
      newDiv.appendChild(divDelBtn);
      newDiv.appendChild(divModelBtn);

      newDiv.ondblclick = () => bringToFront(newDiv);
      body.appendChild(newDiv);

      searchEcho("", onResults);
      modal.style.zIndex = curZ + 1;
      modal.style.display = "block";

      let modelData = {
        boardID,
        id: model["id"]
      }
      socket.emit("ModelLayerclicked", modelData);

      addModel(newDiv);
    }
  }
  resetPosition(data);
}

function addModel(elmnt) {
  let addIcon = document.getElementById("add" + elmnt.id);
  let delIcon = document.getElementById("del" + elmnt.id);

  // When the user clicks on the add button, open the modal
  addIcon.onclick = function () {
    searchEcho("", onResults);
    modal.style.zIndex = curZ + 1;
    modal.style.display = "block";
    let modelData = {
      boardID,
      id: elmnt.id
    }
    socket.emit("ModelLayerclicked", modelData);
  };

  // When the user clicks on the delete button, delete current container
  delIcon.onclick = function () {
    let modelData = {
      boardID,
      id: elmnt.id
    }
    socket.emit("ModelLayerDelete", modelData);
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

socket.on("modelDeleted", deleteModel);

function deleteModel(elmnt) {
  delete modelContainers[elmnt];
  if (document.getElementById(elmnt)) document.getElementById(elmnt).remove();
}

let echoDB;

function searchEcho(keywords, onLoad) {
  let echourl = `https://console.echoar.xyz/search?keywords=${keywords}&key=${ECHO_KEY}`;

  let request = new XMLHttpRequest();
  request.open("GET", echourl, true);
  request.addEventListener("load", function (event) {
    onLoad(JSON.parse(event.target.response));
  });
  request.send(null);
}

let image;
function createImage(asset) {
  image = document.createElement("img");
  image.src = asset.thumbnail;
  image.style.width = "100px";
  image.style.height = "75px";
  if (asset !== undefined) {
    image.onclick = function () {
      let modelSelected = {
        boardID,
        ...asset,
      };
      socket.emit("modelSelected", modelSelected);
    };
    return image;
  }
}

socket.on("modelData", function (data) {
  loadModel(data);
});

function loadModel(data) {
  let iframe = document.getElementById(data.modelLayer).childNodes[0];
  let skc = new Sketchfab(iframe);
  let uid = data.id;

  skc.init(uid, {
    success: function onSuccess(api) {
      api.start();
      api.addEventListener("viewerready", function () {
        console.log("Viewer is ready");
      });
    },
    error: function onError() {
      console.log("Viewer error");
    },
  });
  modal.style.display = "none";
}

function onResults(data) {
  while (results.childNodes.length) {
    results.removeChild(results.firstChild);
  }
  let assets = data.filter((item) => item.source === "Sketchfab");

  if (assets) {
    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      image = createImage(asset);
      results.appendChild(image);
    }
  } else {
    results.innerHTML = "<center>NO RESULTS</center>";
  }
  myLoader.style.display = "none";
}

search.addEventListener("submit", function (event) {
  event.preventDefault();
  searchEcho(query.value, onResults);
});

let onResize = false;

// the code for drag element is modified from W3School Tutorial: https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
  let pos1, pos2, pos3, pos4;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    if (!onResize) {
      elmnt.style.top = Math.max(0, elmnt.offsetTop - pos2).toString() + "px";
      elmnt.style.left = Math.max(0, elmnt.offsetLeft - pos1).toString() + "px";
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;

    // set the element's new position:
    let itmData = {
      boardID,
      id: elmnt.id,
      zIdx: elmnt.style.zIndex,
      top: elmnt.style.top,
      left: elmnt.style.left,
      width: elmnt.style.width,
      height: elmnt.style.height,
    };
    if (elmnt.id.slice(0, 5) === "model") {
      socket.emit("mdlDragged", itmData);
    } else if (elmnt.id.slice(0, 4) === "text") {
      itmData["content"] = elmnt.children[0].value;
      socket.emit("txtDragged", itmData);
    } else if (elmnt.id.slice(0, 3) === "img") {
      itmData["url"] = elmnt.children[0].src ? elmnt.children[0].src : "";
      socket.emit("imgDragged", itmData);
    }
  }
}

// I used the interact.js api for the resizing feature
function resizeElement(item) {
  let curItm = "#" + item.id;
  // the "interact" part is modified from interact.js api
  interact(curItm).resizable({
    // resize from bottom and right
    edges: { left: false, right: true, bottom: true, top: false },
    listeners: {
      move(event) {
        onResize = true;
        let target = event.target;
        target.style.width = event.rect.width.toString() + "px";
        target.style.height = event.rect.height.toString() + "px";
      },
      end(event) {
        let rszData = {
          boardID,
          id: item.id,
          zIdx: item.style.zIndex,
          top: item.style.top,
          left: item.style.left,
          width: item.style.width,
          height: item.style.height,
        };
        if (item.id.slice(0, 5) === "model") {
          socket.emit("mdlDragged", rszData);
        } else if (item.id.slice(0, 4) === "text") {
          rszData["content"] = item.children[0].value;
          socket.emit("txtDragged", rszData);
        } else if (item.id.slice(0, 3) === "img") {
          rszData["url"] = item.children[0].src ? item.children[0].src : "";
          socket.emit("imgDragged", rszData);
        }
        onResize = false;
      },
    },
    inertia: true,
  });
}

function resetPosition(data) {
  let curData = data.filter(obj => obj.boardID === boardID);
  for (let itm of curData) {
    document.getElementById(itm["id"]).style.zIndex = itm["zIdx"];
    document.getElementById(itm["id"]).style.top = itm["top"];
    document.getElementById(itm["id"]).style.left = itm["left"];
    document.getElementById(itm["id"]).style.width = itm["width"];
    document.getElementById(itm["id"]).style.height = itm["height"];
    dragElement(document.getElementById(itm["id"]));
    resizeElement(document.getElementById(itm["id"]));
  }
}

function bringToFront(itm) {
  let frontItm = {
    boardID,
    id: itm.id,
  }
  socket.emit("bringToFront", frontItm);
}

function frontItem(itm) {
  if (itm.boardID === boardID) {
    curZ++;
    document.getElementById(itm.id).style.zIndex = curZ;
  }
}

socket.on("frontItm", frontItem);

window.addEventListener("load", function(e) {
  e.preventDefault();
  modelContainers = {};
  resUrl = "";
  curZ = 0;
  urlParams = new URLSearchParams(window.location.search);
  boardID = urlParams.get('boardID');
  socket.emit("pageLoaded", boardID);
});

window.addEventListener("unload", function (e) {
  e.preventDefault();
  saveBoard();
  modelContainers = {};
  resUrl = "";
  curZ = 0;
});

function saveBoard() {
  socket.emit("saveBoard", boardID);
  reloadPage();
}

function returnHome() {
  saveBoard();
  window.location.href = 'landing.html';
}

function reloadPage() {
  location.reload();
}

socket.on("reloaded", reloadPage);
