const got = require("got");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const express = require("express");
const mySocket = require("socket.io");
const { MongoClient } = require("mongodb");

// // code for image recognition -- archived --
// const apiKey = "acc_86db40cf7be025d";
// const apiSecret = "3183b0d5f9997cd8cee89b969c340b4d";

// const formData = new FormData();
// const baseUrl = "https://api.imagga.com/v2/categories/personal_photos";

// function recognizePic(imageUrl, method) {
//   if (method == "url") {
//     let url = baseUrl + "?image_url=" + encodeURIComponent(imageUrl);

//     (async () => {
//       try {
//         const response = await got(url, {
//           username: apiKey,
//           password: apiSecret,
//         });
//         console.log(JSON.parse(response.body).result.categories);
//         const result = JSON.parse(response.body).result.categories[0].name.en;
//         console.log(result);
//         io.sockets.emit("imgResult", result);
//       } catch (error) {
//         const err = JSON.parse(error.response.body).status.text;
//         console.log(err);
//         io.sockets.emit("error", err);
//       }
//     })();
//   } else if (method == "path") {
//     formData.append("image", fs.createReadStream(imageUrl));
//     console.log(formData);

//     (async () => {
//       try {
//         const response = await got.post(baseUrl, {
//           body: formData,
//           username: apiKey,
//           password: apiSecret,
//         });
//         console.log(response.body);
//       } catch (error) {
//         console.log(error.response.body);
//       }
//     })();
//   }
// }

//Setup the server ---------------------------------------------
const app = express();
const http = require("http");
const hostname = "0.0.0.0"; //localhost
const port = process.env.PORT || 5000;
const server = http.createServer(app);

let globalData = {};
let boardsListing;

// let Texts = [];
// let Imgs = [];
// let Models = [];
// let txtIdx = 0;
// let imgIdx = 0;
// let mdlIdx = 0;
// let currentModelLayer;
// let ModelLayers = {};

app.use(express.static(path.join(__dirname, "public")));

// the code of connecting to mangodb cloud database is modified from online documentation
// https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database

const uri =
  "mongodb+srv://cecilia_cai:Cecilia.Cai1019@cluster0.ynu48.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function init() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    // await getListing(client);
  } catch (e) {
    console.error(e);
  }
}

init();

async function listDatabases(clt) {
  let databasesList = await clt.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

async function getListing(clt) {
  clt
    .db("collage-boards")
    .collection("savedCollages")
    .find({}, {})
    .toArray(function (err, result) {
      if (err) throw err;
      boardsListing = result;
      io.sockets.emit('existingBds', boardsListing);
      return result;
    });
}

async function insertListing(clt, listing) {
  console.log(listing);
  if (parseInt(listing._id)) {
    await clt
    .db("collage-boards")
    .collection("savedCollages")
    .insertOne(listing)
    .catch((err) => {
      console.log(err);
    });
  }
}

async function updateListing(clt, listing) {
  let clone = (({ _id, ...o }) => o)(listing);
  await clt
    .db("collage-boards")
    .collection("savedCollages")
    .update({ _id: listing._id }, { ...clone })
    .catch((err) => {
      console.log(err);
    });
}

//--------------------------------------------------------------
// set up socket.io, this block of code is modified from the capstone workshop on socket.io and node.js
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//Allow server to use the socket
const io = mySocket(server);
//Dealing with server events / connection
//...when a new connection is on, run the newConnection function
io.sockets.on("connection", newConnection); //callback

//Function that serves the new connection
function newConnection(socket) {
  console.log("New connection: " + socket.id);

  // if (Texts) io.sockets.emit("newText", Texts);
  // if (Imgs) io.sockets.emit("newImg", Imgs);
  // if (Models) io.sockets.emit("newModel", Models);
  // if (ModelLayers) {
  //   for (let key of Object.keys(ModelLayers)) {
  //     io.sockets.emit("modelData", ModelLayers[key]);
  //   }
  // }
  //--------------------------------------------------------------

  //When a message arrives from the client, run the corresponding function
  socket.on("getBoards", sendBoardsList);

  socket.on("newBoard", createBoard);
  socket.on("openBoard", sendBoard);
  socket.on("pageLoaded", sendBoard);
  socket.on("saveBoard", saveBoard);
  socket.on("clearBoard", clearBoard);

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

  // socket.on("imgURLFromClient", urlEventMessage);
  // socket.on("imgPathFromClient", pathEventMessage);
  socket.on("modelSelected", sendModel);

  socket.on("bringToFront", bringToFront);
  socket.on("pageReload", reloadServer);
  socket.on("itmResized", resizeItem);

  async function sendBoardsList() {
    await init();
    await getListing(client);
  }

  async function createBoard(boardID) {
    await init();
    await getListing(client);
    for (let bd of boardsListing) {
      if (boardID == bd._id) {
        globalData[boardID] = bd;
      }
    }

    if (!globalData[boardID]) {
      globalData[boardID] = {
        _id: parseInt(boardID),
        Texts: [],
        Imgs: [],
        Models: [],
        txtIdx: 0,
        imgIdx: 0,
        mdlIdx: 0,
        ModelLayers: {},
        currentModelLayer: "",
      };
      insertListing(client, globalData[boardID]);
    }
  }

  async function saveBoard(bID) {
    await updateListing(client, globalData[bID]);
  }

  async function clearBoard(bID) {
    globalData[bID] = {
      _id: parseInt(boardID),
      Texts: [],
      Imgs: [],
      Models: [],
      txtIdx: 0,
      imgIdx: 0,
      mdlIdx: 0,
      ModelLayers: {},
      currentModelLayer: "",
    };
    await updateListing(client, globalData[bID]);
    io.sockets.emit("reloaded");
  }

  async function sendBoard(boardID) {
    console.log('sendBoard: before createBoard ' + boardID)
    await createBoard(boardID);
    console.log('sendBoard: after createBoard ' + boardID + ', globalData is: ' + JSON.stringify(globalData));

    if (globalData[boardID].Texts)
      io.sockets.emit("newText", globalData[boardID].Texts);
    if (globalData[boardID].Imgs)
      io.sockets.emit("newImg", globalData[boardID].Imgs);
    if (globalData[boardID].Models)
      io.sockets.emit("newModel", globalData[boardID].Models);
    if (globalData[boardID].ModelLayers) {
      for (let key of Object.keys(globalData[boardID].ModelLayers)) {
        io.sockets.emit("modelData", globalData[boardID].ModelLayers[key]);
      }
    }
  }

  // text
  function addText(boardID) {
    globalData[boardID].txtIdx++;
    let textData = {
      boardID,
      id: "text" + globalData[boardID].txtIdx.toString(),
      content: "",
      top: "80px",
      left: "80px",
    };
    globalData[boardID].Texts.push(textData);
    io.sockets.emit("newText", globalData[boardID].Texts);
    saveBoard(boardID);
  }

  function updateText(data) {
    globalData[data.boardID].Texts.forEach((txt) => {
      if (txt["id"] === data.id) {
        txt["content"] = data["content"];
        txt["top"] = data["top"];
        txt["left"] = data["left"];
        txt["width"] = data["width"];
        txt["height"] = data["height"];
      }
    });
    io.sockets.emit("textUpdated", globalData[data.boardID].Texts);
    saveBoard(data.boardID);
  }

  function deleteTextLayer(data) {
    globalData[data.boardID].Texts = globalData[data.boardID].Texts.filter(
      (i) => i["id"] !== data.id
    );
    io.sockets.emit("TextLayerDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Texts);
    saveBoard(data.boardID);
  }

  // Img
  function addImg(boardID) {
    globalData[boardID].imgIdx++;
    let imgData = {
      boardID,
      id: "img" + globalData[boardID].imgIdx.toString(),
      url: "",
      top: "80px",
      left: "80px",
    };
    globalData[boardID].Imgs.push(imgData);
    io.sockets.emit("newImg", globalData[boardID].Imgs);
    saveBoard(boardID);
  }

  function updateImg(data) {
    globalData[data.boardID].Imgs.forEach((img) => {
      if (img["id"] === data.id) {
        img["url"] = data["url"];
        img["top"] = data["top"];
        img["left"] = data["left"];
        img["width"] = data["width"];
        img["height"] = data["height"];
      }
    });
    io.sockets.emit("imgUpdated", globalData[data.boardID].Imgs);
    saveBoard(data.boardID);
  }

  function deleteImgLayer(data) {
    globalData[data.boardID].Imgs = globalData[data.boardID].Imgs.filter(
      (i) => i["id"] !== data.id
    );
    io.sockets.emit("imgLayerDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Imgs);
    saveBoard(data.boardID);
  }

  // 3D model
  function addModel(boardID) {
    globalData[boardID].mdlIdx++;
    let mdlData = {
      boardID,
      id: "model" + globalData[boardID].mdlIdx.toString(),
      top: "80px",
      left: "80px",
    };
    globalData[boardID].Models.push(mdlData);
    io.sockets.emit("newModel", globalData[boardID].Models);
    saveBoard(boardID);
  }

  function recordModelLayer(data) {
    globalData[data.boardID].currentModelLayer = data.id;
    saveBoard(data.boardID);
  }

  function deleteModelLayer(data) {
    if (globalData[data.boardID].ModelLayers[data.id])
      delete globalData[data.boardID].ModelLayers[data.id];
    globalData[data.boardID].Models = globalData[data.boardID].Models.filter(
      (i) => i["id"] !== data.id
    );
    io.sockets.emit("modelDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Models);
    saveBoard(data.boardID);
  }

  function updateModels(data) {
    globalData[data.boardID].Models.forEach((model) => {
      if (model["id"] === data["id"]) {
        model["top"] = data["top"];
        model["left"] = data["left"];
        model["width"] = data["width"];
        model["height"] = data["height"];
      }
    });
    io.sockets.emit("resetMdlPos", globalData[data.boardID].Models);
    saveBoard(data.boardID);
  }

  function sendModel(data) {
    if (globalData[data.boardID].currentModelLayer) {
      data["modelLayer"] = globalData[data.boardID].currentModelLayer;
      globalData[data.boardID].ModelLayers[
        globalData[data.boardID].currentModelLayer
      ] = data;
      io.sockets.emit("modelData", data);
    } else {
      io.sockets.emit("error", "Error with loading selected model");
    }
  }

  function resizeItem(data) {
    io.sockets.emit("itmResized", [data]);
  }

  function bringToFront(itmData) {
    io.sockets.emit("frontItm", itmData);
  }

  async function reloadServer() {
    await sendBoardsList();
    io.sockets.emit("reloaded");
  }
}
