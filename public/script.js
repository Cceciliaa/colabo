let socket;
// socket = io.connect("http://localhost:5000");
socket = io.connect(location.origin.replace(/^http/, "ws"));

let sktID;
socket.on("connect", function () {
  sktID = socket.id;
});

let dashboardCtn = document.getElementById("dashBoardCtn");
let curBoard = 0;

socket.on("existingBds", (data) => initBoard(data));

function initBoard(data) {
  for (let i = 0; i < data.length; i++) {
    let checkBoard = document.getElementById("board/" + i);
    if (!checkBoard) {
      let newBoard = document.createElement("div");
      newBoard.className = "dashBoards";
      newBoard.id = "board/" + i.toString();
      newBoard.innerHTML = i;
      newBoard.addEventListener("click", openBoard);
      dashboardCtn.appendChild(newBoard);
    }
  }
  curBoard = dashboardCtn.childNodes.length;
}

function addBoard() {
  let newBoard = document.createElement("div");
  newBoard.className = "dashBoards";
  newBoard.id = "board/" + curBoard.toString();
  newBoard.innerHTML = curBoard;
  newBoard.addEventListener("click", openBoard);
  dashboardCtn.appendChild(newBoard);
  socket.emit("newBoard", curBoard);
  curBoard ++;
}

function openBoard(e) {
  let bd = e.target.id.split("/")[1];
  socket.emit("openBoard", bd);
  window.location.href = "collageBoard.html?boardID=" + bd;
}

window.addEventListener("load", function () {
  curBoard = 0;
  socket.emit("getBoards");
});
