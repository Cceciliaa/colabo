let socket;
// socket = io.connect("http://localhost:5000");
socket = io.connect(location.origin.replace(/^http/, "ws"));

let sktID;
socket.on("connect", function () {
  sktID = socket.id;
});

let dashboardCtn = document.getElementById("dashBoardCtn");
let curBoard = 1;
let bdColors = ['#f5f5dc', '#8a2be2', '#8fbc8f', '#e9967a', '#ff69b4'];
let editting = false;

socket.on("existingBds", (data) => initBoard(data));

function initBoard(data) {
  if (dashboardCtn) {
    let placeholder = document.getElementById("placeholder");
    placeholder.style.display = data.length === 0 ? "block" : "none";
    for (let i = 0; i < data.length; i++) {
      let checkBoard = document.getElementById("board/" + (i+1));
      if (!checkBoard) {
        let newBoard = document.createElement("div");
        newBoard.className = "dashBoards";
        newBoard.id = "board/" + (i+1).toString();
        newBoard.style.backgroundColor = bdColors[i % 5];

        let newBoardTtl = document.createElement("textarea");
        newBoardTtl.className = "dashBoardTtl"
        newBoardTtl.innerHTML = data[i].Name || 'Untitle' + (i+1).toString();

        newBoardTtl.addEventListener("mouseover", () => editting = true);
        newBoardTtl.addEventListener("mouseout", () => editting = false);
        newBoardTtl.addEventListener("click", editTtl);
        newBoardTtl.addEventListener("change", submitTtl);
        newBoard.addEventListener("click", openBoard);
        newBoard.appendChild(newBoardTtl);
        dashboardCtn.appendChild(newBoard);

        socket.emit("newBoard", i+1);
      }
    }
    curBoard = dashboardCtn.childNodes.length + 1;
  }
}

function editTtl(e) {
  e.target.focus();
}

function submitTtl(e) {
  let boardData = {
    boardID: e.target.parentNode.id.split('/')[1],
    name: e.target.value,
  }
  socket.emit("boardTtlChanged", boardData)
}

function addBoard() {
  placeholder.style.display = "none";
  let newBoard = document.createElement("div");
  newBoard.className = "dashBoards";
  newBoard.id = "board/" + curBoard.toString();
  newBoard.style.backgroundColor = bdColors[(curBoard-1) % 5];

  let newBoardTtl = document.createElement("textarea");
  newBoardTtl.className = "dashBoardTtl"
  newBoardTtl.innerHTML = 'Untitle' + curBoard;

  newBoardTtl.addEventListener("mouseover", () => editting = true);
  newBoardTtl.addEventListener("mouseout", () => editting = false);
  newBoardTtl.addEventListener("click", editTtl);
  newBoardTtl.addEventListener("change", submitTtl);
  newBoard.addEventListener("click", openBoard);
  newBoard.appendChild(newBoardTtl);
  dashboardCtn.appendChild(newBoard);

  socket.emit("newBoard", curBoard);
  curBoard ++;
}

function openBoard(e) {
  if (!editting) {
    e = e || window.event;
    let bd = e.target.id.split("/")[1];
    if (!bd) bd = e.target.parentNode.id.split("/")[1];
    socket.emit("openBoard", bd);
    window.location.href = "collageBoard.html?boardID=" + bd;
  }
}

function openInfo() {
  document.getElementById("initModal").style.display = "block";
}

// modal
function closeInitModal() {
  document.getElementById("initModal").style.display = "none";
}

window.addEventListener("load", function () {
  curBoard = 1;
  socket.emit("getBoards");
});