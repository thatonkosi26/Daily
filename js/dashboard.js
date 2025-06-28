let menuToggle = document.getElementById('menuToggle');
let sidebar = document.querySelector('.sidebar');
let content = document.querySelector('.content'); // ✅ FIXED: define content

menuToggle.onclick = function () {
  menuToggle.classList.toggle('active');
  sidebar.classList.toggle('active');

  if (sidebar.classList.contains('active')) {
    content.style.marginLeft = '300px';
    content.style.width = "calc(100vw - 300px)";
  } else {
    content.style.marginLeft = '80px';
    content.style.width = "calc(100vw - 80px)";
  }
};

let Menulist = document.querySelectorAll('.Menulist li');

function activeLink() {
  Menulist.forEach((item) => item.classList.remove('active'));
  this.classList.add('active');
}

Menulist.forEach((item) =>
  item.addEventListener('click', activeLink)
);