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

let demoData = {
  ex1: {
    _id: "ex1",
    Name: "Use Cases Demo",
    Texts: [
      {
        boardID: "ex1",
        id: "text4",
        content: "Example Use Cases of 3D Models in Online Collaborations:",
        top: "53px",
        left: "256px",
        zIndex: "",
        width: "983.513px",
        height: "150px",
      },
      {
        boardID: "ex1",
        id: "text5",
        content:
          "1. Interior Design: \nGet a sense of the room structure with 3D models.",
        top: "134px",
        left: "24px",
        zIndex: "",
        width: "398.815px",
        height: "150px",
      },
      {
        boardID: "ex1",
        id: "text7",
        content:
          "2. Architecture:\n" +
          "Display different structures in 3D and examine their features.",
        top: "137px",
        left: "554px",
        zIndex: "",
        width: "407.404px",
        height: "150px",
      },
      {
        boardID: "ex1",
        zIdx: 0,
        id: "text8",
        content:
          "3. History:\n" +
          "Use Models of cultural heritage sites to display their history.",
        top: "136px",
        left: "1080px",
        zIndex: "0",
        width: "411.457px",
        height: "150px",
      },
      {
        boardID: "ex1",
        zIdx: 0,
        id: "text10",
        content:
          "If 3D models are not enough for you to present your ideas, you may also add image elements (from local storage, links, or web search) to supply your explanation! ",
        top: "588px",
        left: "33px",
        zIndex: "0",
        width: "832px",
        height: "150px",
      },
    ],
    Imgs: [
      {
        boardID: "ex1",
        zIdx: 0,
        id: "img3",
        url: "https://cdn.filestackcontent.com/DAteZBCsReyUrvHamVt8",
        top: "627px",
        left: "85px",
        zIndex: "0",
        width: "608.374px",
        height: "687.771px",
      },
    ],
    Models: [
      {
        boardID: "ex1",
        id: "model1",
        top: "204px",
        left: "0px",
        zIndex: "",
        width: "498.623px",
        height: "350px",
      },
      {
        boardID: "ex1",
        zIdx: 0,
        id: "model2",
        top: "206px",
        left: "532px",
        zIndex: "0",
        width: "",
        height: "",
      },
      {
        boardID: "ex1",
        zIdx: 0,
        id: "model3",
        top: "204px",
        left: "1057px",
        zIndex: "0",
        width: "",
        height: "",
      },
    ],
    txtIdx: 5,
    imgIdx: 1,
    mdlIdx: 3,
    ModelLayers: {
      model1: {
        boardID: "ex1",
        source: "Sketchfab",
        id: "40db661e07f1451b8a3ad0528e079ffc",
        htmlID: "Entertainment-Center",
        author: "erickangel99",
        name: "Entertainment Center",
        thumbnail:
          "https://media.sketchfab.com/models/40db661e07f1451b8a3ad0528e079ffc/thumbnails/9d98d1ca251a42848a31e39b953af848/caa5a08a4b2643d48f80647252740104.jpeg",
        url:
          "https://api.sketchfab.com/v3/models/40db661e07f1451b8a3ad0528e079ffc/download",
        modelLayer: "model1",
      },
      model2: {
        boardID: "ex1",
        source: "Sketchfab",
        id: "c0cf96bf9aed4a8d84733f820eabaae5",
        htmlID: "Ishavskatedralen---The-Arctic-Cathedral",
        author: "Hakvaag",
        name: "Ishavskatedralen - The Arctic Cathedral",
        thumbnail:
          "https://media.sketchfab.com/models/c0cf96bf9aed4a8d84733f820eabaae5/thumbnails/d4a7b0d6f439474c9d4661cfc1f6def2/16410ad466c34752a874173f9be36dff.jpeg",
        url:
          "https://api.sketchfab.com/v3/models/c0cf96bf9aed4a8d84733f820eabaae5/download",
        modelLayer: "model2",
      },
      model3: {
        boardID: "ex1",
        source: "Sketchfab",
        id: "8e1e7ae74b4e4a09bd517aefc2981e0b",
        htmlID: "Belberaud-(31)-France-chapiteaux",
        author: "DominiqueAllios",
        name: "Belberaud (31) France chapiteaux",
        thumbnail:
          "https://media.sketchfab.com/models/8e1e7ae74b4e4a09bd517aefc2981e0b/thumbnails/0a1e61209ef4431f9358581183670d46/df512dc3e788496ba8c37d984bd96861.jpeg",
        url:
          "https://api.sketchfab.com/v3/models/8e1e7ae74b4e4a09bd517aefc2981e0b/download",
        modelLayer: "model3",
      },
    },
    currentModelLayer: "model3",
  },

  ex2: {
    _id: "ex2",
    Name: "Chemistry Lab",
    Texts: [
      {
        boardID: "ex2",
        zIdx: 0,
        id: "text1",
        content: "Glimpse into Molecules",
        top: "101px",
        left: "247px",
        zIndex: "0",
        width: "572.068px",
        height: "150px",
      },
      {
        boardID: "ex2",
        zIdx: 0,
        id: "text2",
        content:
          "Molecule structure of H2O. H2O is the fundamental component of water. It is compounded of 2 O elements and 1 H element, and the H element is linked to each of the 2 O elements by an H-O key.",
        top: "544px",
        left: "241px",
        zIndex: "0",
        width: "449.14px",
        height: "208.994px",
      },
      {
        boardID: "ex2",
        zIdx: 0,
        id: "text3",
        content:
          "This seems like an interesting structure. But I don't actually recognize this molecule. Does anyone have any ideas?",
        top: "547px",
        left: "774px",
        zIndex: "0",
        width: "446.421px",
        height: "215.098px",
      },
    ],
    Imgs: [],
    Models: [
      {
        boardID: "ex2",
        zIdx: 0,
        id: "model1",
        top: "172px",
        left: "220px",
        zIndex: "0",
        width: "",
        height: "",
      },
      {
        boardID: "ex2",
        zIdx: 0,
        id: "model2",
        top: "174px",
        left: "745px",
        zIndex: "0",
        width: "",
        height: "",
      },
    ],
    txtIdx: 3,
    imgIdx: 0,
    mdlIdx: 2,
    ModelLayers: {
      model1: {
        boardID: "ex2",
        source: "Sketchfab",
        id: "10c6e35fb6924c5fb4b5a0cbee43addf",
        htmlID: "Molekul-H2O",
        author: "hendri.kurniadi",
        name: "Molekul H2O",
        thumbnail:
          "https://media.sketchfab.com/models/10c6e35fb6924c5fb4b5a0cbee43addf/thumbnails/3da237cb43094de280984f02c96ee007/288e1c6eb44347ae81fcf2ebfbacb96a.jpeg",
        url:
          "https://api.sketchfab.com/v3/models/10c6e35fb6924c5fb4b5a0cbee43addf/download",
        modelLayer: "model1",
      },
      model2: {
        boardID: "ex2",
        source: "Sketchfab",
        id: "3bb85e05987a474896e768fec99ef7ac",
        htmlID: "R-and-S-config-4th-molecule-w/-label",
        author: "stereoaisier",
        name: "R and S config 4th molecule w/ label",
        thumbnail:
          "https://media.sketchfab.com/models/3bb85e05987a474896e768fec99ef7ac/thumbnails/e9cd45d98ac24b9bbf97ce070ab65645/eeb9084538ec4104989a043cb6384ac4.jpeg",
        url:
          "https://api.sketchfab.com/v3/models/3bb85e05987a474896e768fec99ef7ac/download",
        modelLayer: "model2",
      },
    },
    currentModelLayer: "model2",
  },
};

let globalData = JSON.parse(JSON.stringify(demoData));
let boardsListing;

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
      boardsListing = result || [];
      io.sockets.emit("existingBds", boardsListing);
      return result;
    });
}

async function insertListing(clt, listing) {
  if (parseInt(listing._id)) {
    console.log("start insert");
    await clt
      .db("collage-boards")
      .collection("savedCollages")
      .insertOne(listing)
      .then(() => console.log("inserted"))
      .catch((err) => {
        console.log("insertion error: ", err);
      });
  }
}

async function updateListing(clt, listing) {
  let clone = (({ _id, ...o }) => o)(listing);
  if (parseInt(listing._id)) {
    console.log("start update");
    await clt
      .db("collage-boards")
      .collection("savedCollages")
      .update({ _id: listing._id }, { ...clone })
      .then(() => {
        console.log("updated");
      })
      .catch((err) => {
        console.log(err);
      });
  }
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
  socket.on("boardTtlChanged", changeName);

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

  socket.on("modelSelected", sendModel);

  socket.on("bringToFront", bringToFront);
  socket.on("pageReload", reloadServer);

  async function sendBoardsList() {
    await getListing(client);
  }

  async function createBoard(boardID) {
    let exist = false;

    globalData[boardID] = {
      _id: parseInt(boardID),
      Name: "Untitle" + boardID,
      Texts: [],
      Imgs: [],
      Models: [],
      txtIdx: 0,
      imgIdx: 0,
      mdlIdx: 0,
      ModelLayers: {},
      currentModelLayer: "",
    };

    if (!boardsListing) await getListing(client);
    if (boardsListing) {
      for (let i = 0; i < boardsListing.length; i++) {
        if (boardsListing[i] && boardID === boardsListing[i]._id) {
          globalData[boardID] = boardsListing[i];
          exist = true;
        }
      }
    }

    if (!exist) {
      insertListing(client, globalData[boardID]);
    }
  }

  function changeName(data) {
    globalData[data.boardID].Name = data.name;
    saveBoard(data.boardID);
  }

  async function saveBoard(bID) {
    if (parseInt(bID)) {
      await updateListing(client, globalData[bID]);
    }
  }

  async function sendBoard(boardID) {
    if (!parseInt(boardID))
      globalData[boardID] = JSON.parse(JSON.stringify(demoData[boardID]));
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
  function addText(data) {
    globalData[data.boardID].txtIdx++;
    let textData = {
      boardID: data.boardID,
      zIdx: data.zIdx,
      id: "text" + globalData[data.boardID].txtIdx.toString(),
      content: "",
      top: data.top + 100 + "px",
      left: data.left + 80 + "px",
    };
    globalData[data.boardID].Texts.push(textData);
    io.sockets.emit("newText", globalData[data.boardID].Texts);
    saveBoard(data.boardID);
  }

  function updateText(data) {
    globalData[data.boardID].Texts.forEach((txt) => {
      if (txt["id"] === data.id) {
        txt["content"] = data["content"];
        txt["zIndex"] = data["zIdx"];
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
    globalData[data.boardID].txtIdx--;
    io.sockets.emit("TextLayerDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Texts);
    saveBoard(data.boardID);
  }

  // Img
  function addImg(data) {
    globalData[data.boardID].imgIdx++;
    let imgData = {
      boardID: data.boardID,
      zIdx: data.zIdx,
      id: "img" + globalData[data.boardID].imgIdx.toString(),
      url: "",
      top: data.top + 100 + "px",
      left: data.left + 80 + "px",
    };
    globalData[data.boardID].Imgs.push(imgData);
    io.sockets.emit("newImg", globalData[data.boardID].Imgs);
    saveBoard(data.boardID);
  }

  function updateImg(data) {
    globalData[data.boardID].Imgs.forEach((img) => {
      if (img["id"] === data.id) {
        img["url"] = data["url"];
        img["zIndex"] = data["zIdx"];
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
    globalData[data.boardID].imgIdx--;
    io.sockets.emit("imgLayerDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Imgs);
    saveBoard(data.boardID);
  }

  // 3D model
  function addModel(data) {
    globalData[data.boardID].mdlIdx++;
    let mdlData = {
      boardID: data.boardID,
      zIdx: data.zIdx,
      id: "model" + globalData[data.boardID].mdlIdx.toString(),
      top: data.top + 100 + "px",
      left: data.left + 80 + "px",
    };
    globalData[data.boardID].Models.push(mdlData);
    io.sockets.emit("newModel", globalData[data.boardID].Models);
    saveBoard(data.boardID);
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
    globalData[data.boardID].mdlIdx--;
    io.sockets.emit("modelDeleted", data.id);
    io.sockets.emit("resetPos", globalData[data.boardID].Models);
    saveBoard(data.boardID);
  }

  function updateModels(data) {
    globalData[data.boardID].Models.forEach((model) => {
      if (model["id"] === data["id"]) {
        model["zIndex"] = data["zIdx"];
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

  function bringToFront(itmData) {
    io.sockets.emit("frontItm", itmData);
  }

  async function reloadServer() {
    await sendBoardsList();
    globalData = JSON.parse(JSON.stringify(demoData));
    io.sockets.emit("reloaded");
  }
}
