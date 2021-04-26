let socket;
// socket = io.connect('http://localhost:5000');
socket = io.connect(location.origin.replace(/^http/, "ws"));
const client = filestack.init("AV9sVjeWPToiHvAgHFopUz");

let resUrl = "";
let currImgElm = "";
let rotateMdl = false;

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

closeIcon.onclick = function () {
  modal.style.display = "none";
};

const WIDTH = 310;
const HEIGHT = 280;
let curZ = 0;

let modelContainers = {};

const API_KEY = "AIzaSyBWcHRmY5cc3mQJb62eN0JsfioiMvYAGLg";

// modal
function closeInitModal() {
  document.getElementById("initModal").style.display = "none";
}

function openInfo() {
  document.getElementById("initModal").style.zIndex = curZ + 1;
  document.getElementById("initModal").style.display = "block";
}

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

function requestAddText() {
  closeDropdown();
  socket.emit("requestAddText");
}

function requestAddImg() {
  closeDropdown();
  socket.emit("requestAddImg");
}

function requestAddModel() {
  closeDropdown();
  socket.emit("requestAddModel");
}

socket.on("newText", updateTextLayer);
socket.on("textUpdated", updateTextLayer);

socket.on("newImg", updateImgLayer);
socket.on("imgUpdated", updateImgLayer);

socket.on("newModel", updateModelLayer);
socket.on("resetMdlPos", updateModelLayer);

// text
function updateTextLayer(data) {
  for (let txt of data) {
    if (!document.getElementById(txt.id)) {
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
        socket.emit("TextLayerDelete", txt.id);
      };

      newTextArea.className = "newItem";
      newText.className = "newText";
      newText.placeholder = "Input Text Content";

      newTextArea.id = txt["id"];
      newTextArea.style.top = txt["top"];
      newTextArea.style.left = txt["left"];

      newTextArea.onclick = () => newText.focus();
      newTextArea.ondblclick = () => bringToFront(newTextArea);
      newText.oninput = () => updateTextContent(newTextArea);

      body.appendChild(newTextArea);
      dragElement(newTextArea);
    } else {
      let textArea = document.getElementById(txt.id);
      if (txt["content"]) textArea.children[0].value = txt["content"];
      resetPosition(data);
    }
  }
}

function updateTextContent(data) {
  let textData = {
    skt: socket.id,
    id: data.id,
    content: data.children[0].value,
    top: data.style.top,
    left: data.style.left,
  };
  socket.emit("updateText", textData);
}

function deleteTextLayer(data) {
  if (document.getElementById(data)) document.getElementById(data).remove();
}

socket.on("TextLayerDeleted", deleteTextLayer);

// img
function updateImgLayer(data) {
  for (let img of data) {
    if (!document.getElementById(img.id)) {
      let newImgArea = document.createElement("div");
      let newImg = document.createElement("img");
      let divImgBtn = document.createElement("div");
      let divDelBtn = document.createElement("div");

      newImg.alt = img["alt"];
      if (img["url"]) newImg.src = img["url"];

      divImgBtn.textContent = "+";
      divImgBtn.className = "divBtn";
      divImgBtn.id = "add" + img["id"];

      divDelBtn.textContent = "x";
      divDelBtn.className = "divBtn";
      divDelBtn.id = "del" + img["id"];

      newImgArea.appendChild(newImg);
      newImgArea.appendChild(divDelBtn);
      newImgArea.appendChild(divImgBtn);

      divDelBtn.onclick = function () {
        socket.emit("ImgLayerDelete", img["id"]);
      };

      newImgArea.className = "newItem";
      newImg.className = "newImg";

      newImgArea.id = img["id"];
      newImgArea.style.top = img["top"];
      newImgArea.style.left = img["left"];

      divImgBtn.onclick = () => addImgUrl(newImgArea);
      newImgArea.ondblclick = () => bringToFront(newImgArea);

      body.appendChild(newImgArea);
      dragElement(newImgArea);
    } else {
      let imgArea = document.getElementById(img["id"]);
      if (img["url"]) imgArea.children[0].src = img["url"];
      imgArea.children[0].alt = img["alt"];
      resetPosition(data);
    }
  }
}

function addImgUrl(elmnt) {
  currImgElm = elmnt.id;
  client.picker(options).open();
}

function sendImgUrl(url, elmnt) {
  let imgData = {
    skt: socket.id,
    id: elmnt.id,
    top: elmnt.style.top,
    left: elmnt.style.left,
    url: url,
  };
  socket.emit("updateImg", imgData);
}

function deleteImgLayer(data) {
  if (document.getElementById(data)) document.getElementById(data).remove();
}

socket.on("imgLayerDeleted", deleteImgLayer);

// model
function updateModelLayer(data) {
  for (let model of data) {
    if (!document.getElementById(model.id)) {
      let newDiv = document.createElement("div");
      newDiv.className = "newItem";
      newDiv.id = model["id"];
      newDiv.style.top = model["top"];
      newDiv.style.left = model["left"];

      let divModelBtn = document.createElement("div");
      divModelBtn.textContent = "+";
      divModelBtn.className = "divBtn";
      divModelBtn.id = "add" + model["id"];

      let divDelBtn = document.createElement("div");
      divDelBtn.textContent = "x";
      divDelBtn.className = "divBtn";
      divDelBtn.id = "del" + model["id"];

      newDiv.ondblclick = () => bringToFront(newDiv);
      body.appendChild(newDiv);

      let camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.01, 100);
      camera.position.set(5, 3, 5);
      camera.lookAt(0, 1.5, 0);

      let scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      scene.add(new THREE.GridHelper(10, 10));

      let ambient = new THREE.HemisphereLight(0xbbbbff, 0x886666, 0.75);
      ambient.position.set(-0.5, 0.75, -1);
      scene.add(ambient);

      let light = new THREE.DirectionalLight(0xffffff, 0.75);
      light.position.set(1, 0.75, 0.5);
      scene.add(light);

      let container = new THREE.Group();
      scene.add(container);
      modelContainers[newDiv.id] = container;

      let renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(WIDTH, HEIGHT);

      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.marginLeft = "60px";
      renderer.domElement.style.marginTop = "25px";

      newDiv.appendChild(renderer.domElement);
      newDiv.appendChild(divDelBtn);
      newDiv.appendChild(divModelBtn);

      newDiv.addEventListener("click", () => (rotateMdl = !rotateMdl));

      function animate() {
        let time = performance.now() / 5000;

        if (rotateMdl) {
          camera.position.x = Math.sin(time) * 5;
          camera.position.z = Math.cos(time) * 5;
        }

        camera.lookAt(0, 1.5, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
      addModel(newDiv);
      dragElement(newDiv);
    } else {
      resetPosition(data);
    }
  }
}

function addModel(elmnt) {
  let addIcon = document.getElementById("add" + elmnt.id);
  let delIcon = document.getElementById("del" + elmnt.id);
  //   let moveIcon = document.getElementById("move" + elmnt.id);

  // When the user clicks on the add button, open the modal
  addIcon.onclick = function () {
    searchPoly("", onResults);
    modal.style.zIndex = curZ + 1;
    modal.style.display = "block";
    socket.emit("ModelLayerclicked", elmnt.id);
  };

  // When the user clicks on the delete button, delete current container
  delIcon.onclick = function () {
    socket.emit("ModelLayerDelete", elmnt.id);
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

socket.on("modelDeleted", deleteModel);

function deleteModel(elmnt) {
  delete modelContainers[elmnt];
  if (document.getElementById(elmnt)) document.getElementById(elmnt).remove();
}

function searchPoly(keywords, onLoad) {
  if (keywords) myLoader.style.display = "block";
  let url = `https://poly.googleapis.com/v1/assets?keywords=${keywords}&format=OBJ&key=${API_KEY}`;

  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.addEventListener("load", function (event) {
    onLoad(JSON.parse(event.target.response));
  });
  request.send(null);
}

let image;
function createImage(asset) {
  image = document.createElement("img");
  image.src = asset.thumbnail.url;
  image.style.width = "100px";
  image.style.height = "75px";

  let format = asset.formats.find((fmt) => {
    return fmt.formatType === "OBJ";
  });

  if (format !== undefined) {
    image.onclick = function () {
      let modelSelected = {
        skt: socket.id,
        ...format,
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
  let modelLayer = modelContainers[data["modelLayer"]];
  let obj = data.root;
  let mtl = data.resources.find((resource) => {
    return resource.url.endsWith("mtl");
  });
  let path = obj.url.slice(0, obj.url.indexOf(obj.relativePath));

  let loader = new THREE.MTLLoader();
  loader.setCrossOrigin(true);
  loader.setMaterialOptions({ ignoreZeroRGBs: true });
  loader.setTexturePath(path);
  loader.load(mtl.url, function (materials) {
    loader = new THREE.OBJLoader();
    loader.setMaterials(materials);
    loader.load(obj.url, function (object) {
      let box = new THREE.Box3();
      box.setFromObject(object);

      // re-center

      let center = box.getCenter();
      center.y = box.min.y;
      object.position.sub(center);

      // scale

      let scaler = new THREE.Group();
      scaler.add(object);
      scaler.scale.setScalar(6 / box.getSize().length());
      if (modelLayer) modelLayer.add(scaler);
    });
  });
  modal.style.display = "none";
}

function onResults(data) {
  while (results.childNodes.length) {
    results.removeChild(results.firstChild);
  }
  //   console.log(data);
  let assets = data.assets;

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
  searchPoly(query.value, onResults);
});

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

    elmnt.style.top = (elmnt.offsetTop - pos2).toString() + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1).toString() + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    
    // set the element's new position:
    let itmData = {
      skt: socket.id,
      id: elmnt.id,
      top: (elmnt.offsetTop - pos2).toString() + "px",
      left: (elmnt.offsetLeft - pos1).toString() + "px",
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

function resetPosition(data) {
  for (let itm of data) {
    document.getElementById(itm["id"]).style.top = itm["top"];
    document.getElementById(itm["id"]).style.left = itm["left"];
  }
}

function bringToFront(itm) {
  socket.emit("bringToFront", itm.id);
}

function frontItem(itmID) {
  curZ++;
  document.getElementById(itmID).style.zIndex = curZ;
}

socket.on("frontItm", frontItem);

window.addEventListener("unload", function (e) {
  e.preventDefault();
  modelContainers = {};
  resUrl = "";
  curZ = 0;
  socket.emit("pageReload", socket.id);
});

function reloadPage() {
  modelContainers = {};
  rotateMdl = false;
  resUrl = "";
  curZ = 0;
  location.reload();
}

socket.on("reloaded", reloadPage);

// draw board
// let isDrawing = false;
// let paths = [];
// let x = 0;
// let y = 0;

// const myPics = document.getElementById('drawBoard');
// const context = myPics.getContext('2d');

// initialize();

// function initialize() {
//     window.addEventListener('resize', resizeCanvas, false);
//     resizeCanvas();
//  }

// // event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas
// // Add the event listeners for mousedown, mousemove, and mouseup
// myPics.addEventListener('mousedown', e => {
//   x = e.offsetX;
//   y = e.offsetY;
//   isDrawing = true;
// });

// myPics.addEventListener('mousemove', e => {
//   if (isDrawing === true) {
//     drawLine(context, x, y, e.offsetX, e.offsetY);
//     x = e.offsetX;
//     y = e.offsetY;
//   }
// });

// window.addEventListener('mouseup', e => {
//   if (isDrawing === true) {
//     drawLine(context, x, y, e.offsetX, e.offsetY);
//     x = 0;
//     y = 0;
//     isDrawing = false;
//   }
// });

// function drawLine(ctx, x1, y1, x2, y2) {
//   ctx.beginPath();
//   ctx.strokeStyle = 'black';
//   ctx.lineWidth = 1;
//   ctx.moveTo(x1, y1);
//   ctx.lineTo(x2, y2);
//   ctx.stroke();
//   ctx.closePath();
//   paths.push([x1, y1, x2, y2]);
// }

// function resizeCanvas() {
//   console.log(paths)
//   myPics.width = window.innerWidth;
//   myPics.height = window.innerHeight;
//   // for (let line of paths) {
//   //   console.log(...line)
//   //   drawLine(context, ...line);
//   // }
// }
