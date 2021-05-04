const got = require("got");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const express = require("express");
const mySocket = require("socket.io");

const apiKey = "acc_86db40cf7be025d";
const apiSecret = "3183b0d5f9997cd8cee89b969c340b4d";

const formData = new FormData();
const baseUrl = "https://api.imagga.com/v2/categories/personal_photos";

function recognizePic(imageUrl, method) {
  if (method == "url") {
    let url = baseUrl + "?image_url=" + encodeURIComponent(imageUrl);

    (async () => {
      try {
        const response = await got(url, {
          username: apiKey,
          password: apiSecret,
        });
        console.log(JSON.parse(response.body).result.categories);
        const result = JSON.parse(response.body).result.categories[0].name.en;
        console.log(result);
        io.sockets.emit("imgResult", result);
      } catch (error) {
        const err = JSON.parse(error.response.body).status.text;
        console.log(err);
        io.sockets.emit("error", err);
      }
    })();
  } else if (method == "path") {
    formData.append("image", fs.createReadStream(imageUrl));
    console.log(formData);

    (async () => {
      try {
        const response = await got.post(baseUrl, {
          body: formData,
          username: apiKey,
          password: apiSecret,
        });
        console.log(response.body);
      } catch (error) {
        console.log(error.response.body);
      }
    })();
  }
}

//Setup the server ---------------------------------------------
const app = express();
const http = require("http");
const hostname = "0.0.0.0"; //localhost
const port = process.env.PORT || 5000;
const server = http.createServer(app);

let globalData = {};
let serverIdx = 0;

let Texts = [];
let Imgs = [];
let Models = [];
let txtIdx = 0;
let imgIdx = 0;
let mdlIdx = 0;
let currentModelLayer;
let ModelLayers = {};

app.use(express.static(path.join(__dirname, "public")));

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
//--------------------------------------------------------------

//Allow server to use the socket
const io = mySocket(server);
//Dealing with server events / connection
//...when a new connection is on, run the newConnection function
io.sockets.on("connection", newConnection); //callback

//Function that serves the new connection
function newConnection(socket) {
  console.log("New connection: " + socket.id);
  io.sockets.emit("serverIdx", serverIdx);
  if (Texts) io.sockets.emit("newText", Texts);
  if (Imgs) io.sockets.emit("newImg", Imgs);
  if (Models) io.sockets.emit("newModel", Models);
  if (ModelLayers) {
    for (let key of Object.keys(ModelLayers)) {
      io.sockets.emit("modelData", ModelLayers[key]);
    }
  }

  //When a message arrives from the client, run the eventMessage function
  socket.on("requestAddText", addText);
  socket.on("txtDragged", updateText);
  socket.on("updateText", updateText);
  socket.on("TextLayerDelete", deleteTextLayer);

  socket.on("requestAddImg", addImg);
  socket.on("imgDragged", updateImg);
  socket.on("updateImg", updateImg);
  socket.on("ImgLayerDelete", deleteImgLayer);

  socket.on("requestAddModel", addModel);
  socket.on("mdlDragged", updateModels);
  socket.on("ModelLayerclicked", recordModelLayer);
  socket.on("ModelLayerDelete", deleteModelLayer);

  socket.on("imgURLFromClient", urlEventMessage);
  socket.on("imgPathFromClient", pathEventMessage);
  socket.on("modelSelected", sendModel);

  socket.on("bringToFront", bringToFront);
  socket.on("pageReload", reloadServer);
  socket.on("itmResized", resizeItem);

  // text
  function addText(sktID) {
    txtIdx++;
    let textData = {
      skt: sktID,
      id: "text" + txtIdx.toString(),
      content: "",
      top: "80px",
      left: "80px",
    };
    Texts.push(textData);
    io.sockets.emit("newText", Texts);
  }

  function updateText(data) {
    Texts.forEach((txt) => {
      if (txt["id"] === data.id) {
        txt["content"] = data["content"];
        txt["top"] = data["top"];
        txt["left"] = data["left"];
        txt["width"] = data["width"];
        txt["height"] = data["height"];
      }
    });
    io.sockets.emit("textUpdated", Texts);
  }

  function deleteTextLayer(data) {
    Texts = Texts.filter((i) => i["id"] !== data);
    io.sockets.emit("TextLayerDeleted", data);
    io.sockets.emit("resetPos", Texts);
  }

  // Img
  function addImg(sktID) {
    imgIdx++;
    let imgData = {
      skt: sktID,
      id: "img" + imgIdx.toString(),
      url: "",
      top: "80px",
      left: "80px",
    };
    Imgs.push(imgData);
    io.sockets.emit("newImg", Imgs);
  }

  function updateImg(data) {
    Imgs.forEach((img) => {
      if (img["id"] === data.id) {
        img["url"] = data["url"];
        img["top"] = data["top"];
        img["left"] = data["left"];
        img["width"] = data["width"];
        img["height"] = data["height"];
      }
    });
    io.sockets.emit("imgUpdated", Imgs);
  }

  function deleteImgLayer(data) {
    Imgs = Imgs.filter((i) => i["id"] !== data);
    io.sockets.emit("imgLayerDeleted", data);
    io.sockets.emit("resetPos", Imgs);
  }

  // 3D model
  function addModel(sktID) {
    mdlIdx++;
    let mdlData = {
      skt: sktID,
      id: "model" + mdlIdx.toString(),
      top: "80px",
      left: "80px",
    };
    Models.push(mdlData);
    io.sockets.emit("newModel", Models);
  }

  function recordModelLayer(data) {
    currentModelLayer = data;
  }

  function deleteModelLayer(data) {
    if (ModelLayers[data]) delete ModelLayers[data];
    Models = Models.filter((i) => i["id"] !== data);
    io.sockets.emit("modelDeleted", data);
    io.sockets.emit("resetPos", Models);
  }
}

function updateModels(data) {
  Models.forEach((model) => {
    if (model["id"] === data["id"]) {
      model["top"] = data["top"];
      model["left"] = data["left"];
      model["width"] = data["width"];
      model["height"] = data["height"];
    }
  });
  io.sockets.emit("resetMdlPos", Models);
}

function pathEventMessage(data) {
  recognizePic(data, "path");
}

function urlEventMessage(data) {
  // socket.broadcast.emit('eventFromServer', data);
  //Following line refers to sending data to all clients
  //io.sockets.emit('mouse', data);
  recognizePic(data, "url");
}

function sendModel(data) {
  console.log(data);
  if (currentModelLayer) {
    data["modelLayer"] = currentModelLayer;
    ModelLayers[currentModelLayer] = data;
    io.sockets.emit("modelData", data);
  } else {
    io.sockets.emit("error", "Error with loading selected model");
  }
}

function resizeItem(data) {
  io.sockets.emit("itmResized", [data]);
}

function bringToFront(itmID) {
  io.sockets.emit("frontItm", itmID);
}

function reloadServer(data) {
  globalData[serverIdx] = {
    Texts,
    Imgs,
    Models,
    txtIdx,
    imgIdx,
    mdlIdx,
    ModelLayers,
    currentModelLayer
  }
  // Texts = [];
  // Imgs = [];
  // Models = [];
  // txtIdx = 0;
  // imgIdx = 0;
  // mdlIdx = 0;
  // ModelLayers = {};
  // currentModelLayer = "";
  for (let sk in io.sockets) {
    if (sk.id !== data) {
      io.sockets.emit("reloaded", data);
    }
  }
}
