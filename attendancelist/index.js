var ModalPopup = document.getElementsByClassName("subjects-modal")
var MainContainer = document.getElementsByClassName("container")

function showModal() {
  MainContainer[0].style.display = "none";
  ModalPopup[0].style.display = "flex";
}

function hideModal() {
  ModalPopup[0].style.display = "none";
  MainContainer[0].style.display = "flex";
}

window.onclick = function(event) {
    if (event.target == ModalPopup) {
        ModalPopup.style.display = "none";
    }
  }