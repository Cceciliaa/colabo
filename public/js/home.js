let asloc = document.getElementById("asloc");
let orgstr = document.getElementById("orgstr");
let ecosys = document.getElementById("ecosys");

let wholeP = document.getElementsByClassName("wholeP")[0];

let drap = window.location.hash.split("#")[1];

wholeP.addEventListener("scroll", () => {
  console.log('scroll', wholeP.scrollTop);
});

if (drap != null) {
  wholeP.scrollTo(0, drap);
}

ecosys.style.opacity = 0.3;

document.getElementById("infocontent").style.top = 380 + "px";

function supressAB() {
  if (wholeP.scrollTop < 420) {
    asloc.style.opacity = 1;
  } else {
    asloc.style.opacity = 0.3;
  }

  if (wholeP.scrollTop >= 420 && wholeP.scrollTop < 1880) {
    orgstr.style.opacity = 1;
  } else if (wholeP.scrollTop >= 1880 || wholeP.scrollTop < 480) {
    orgstr.style.opacity = 0.3;
  }

  if (wholeP.scrollTop >= 1880) {
    ecosys.style.opacity = 1;
  } else {
    ecosys.style.opacity = 0.3;
  }
}

function gotoFtr() {
  wholeP.scrollTo(0, 2300);
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
