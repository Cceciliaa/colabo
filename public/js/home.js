let infoContent = document.getElementById("infoContent");
let demoContent = document.getElementById("demoContent");
let ftrContent = document.getElementById("ftrContent");

let wholeP = document.getElementsByClassName("wholeP")[0];

let drap = window.location.hash.split("#")[1];

if (drap != null) {
  wholeP.scrollTo(0, drap);
}

function supressAB() {
  if (wholeP.scrollTop < 400) {
    infoContent.style.opacity = 1;
  } else {
    infoContent.style.opacity = 0.3;
  }

  if (wholeP.scrollTop >= 400 && wholeP.scrollTop < 1100) {
    demoContent.style.opacity = 1;
  } else if (wholeP.scrollTop >= 1000 || wholeP.scrollTop < 400) {
    demoContent.style.opacity = 0.3;
  }

  if (wholeP.scrollTop >= 1100) {
    ftrContent.style.opacity = 1;
  } else {
    ftrContent.style.opacity = 0.3;
  }
}

function gotoFtr() {
  wholeP.scrollTo(0, 1185);
}

function gotoUcs() {
  window.location.href = "collageBoard.html?boardID=ex1";
}

function gotoExp() {
  window.location.href = "collageBoard.html?boardID=ex2";
}

function gotoDash() {
  window.location.href = "landing.html";
}

function gotoDoc() {
  window.location.href = "https://www.notion.so/Colabo-Documentation-35609b3a657e495d9fa1638b082e09be";
}
