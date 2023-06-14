function showNotification() {
    document.getElementById("notification-dropdown").classList.toggle("showNotification");
  }

window.onclick = function(event) {
  if (!event.target.matches('.notification-btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('showNotification')) {
        openDropdown.classList.remove('showNotification');
      }
    }
  }
}