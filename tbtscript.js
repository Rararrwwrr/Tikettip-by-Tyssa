// pindah halaman
function pindahHalaman(nama, bagian) {
  var semua = document.querySelectorAll(".view");
  for (var i = 0; i < semua.length; i++) {
    semua[i].classList.remove("tampil");
  }
  var halaman = document.getElementById("view-" + nama);
  halaman.classList.add("tampil");
  halaman.querySelector(".header").after(document.getElementById("teks-berjalan"));

  var menu = document.querySelectorAll(".menu > ul > li > a, .tombol-nav");
  for (var j = 0; j < menu.length; j++) {
    menu[j].classList.toggle("aktif", menu[j].dataset.nav == nama);
  }

  if (bagian) {
    document.getElementById(bagian).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

// popup
function bukaModal(id) {
  document.getElementById(id).classList.add("buka");
}
function tutupModal(id) {
  document.getElementById(id).classList.remove("buka");
  if (id == "modal-book") {
    clearInterval(timerSlide);
  }
}

// slider poster
var konserAktif = 1;
var slideSekarang = 0;
var timerSlide = null;

function tampilkanSlide(idTrack, nomor) {
  var track = document.getElementById(idTrack);
  track.style.transform = "translateX(-" + (nomor * 100) + "%)";
  slideSekarang = nomor;

  var titik = track.closest(".info").querySelectorAll(".titik button");
  for (var i = 0; i < titik.length; i++) {
    titik[i].classList.toggle("aktif", i == nomor);
  }
}

function keSlide(idTrack, nomor) {
  tampilkanSlide(idTrack, nomor);
  mulaiOtomatis();
}

function mulaiOtomatis() {
  clearInterval(timerSlide);
  timerSlide = setInterval(function () {
    var idTrack = "track-" + konserAktif;
    var jumlah = document.getElementById(idTrack).children.length;
    tampilkanSlide(idTrack, (slideSekarang + 1) % jumlah);
  }, 3000);
}

// geser poster dengan jari atau mouse
var awalX = 0;
var semuaSlider = document.querySelectorAll(".slider");
for (var s = 0; s < semuaSlider.length; s++) {
  semuaSlider[s].addEventListener("pointerdown", function (e) {
    awalX = e.clientX;
  });
  semuaSlider[s].addEventListener("pointerup", function (e) {
    var selisih = e.clientX - awalX;
    var idTrack = "track-" + konserAktif;
    var jumlah = document.getElementById(idTrack).children.length;
    if (selisih < -40) {
      keSlide(idTrack, (slideSekarang + 1) % jumlah);
    } else if (selisih > 40) {
      keSlide(idTrack, (slideSekarang - 1 + jumlah) % jumlah);
    }
  });
}

// klik poster konser
function bukaBook(nomor, namaKonser) {
  var semua = document.querySelectorAll(".info");
  for (var i = 0; i < semua.length; i++) {
    semua[i].classList.remove("tampil");
  }
  document.getElementById("info-" + nomor).classList.add("tampil");

  konserAktif = nomor;
  keSlide("track-" + nomor, 0);
  document.getElementById("book-judul").textContent = namaKonser;
  document.getElementById("konser").value = namaKonser;
  bukaModal("modal-book");
}

// form booking (isi URL_REKAP dengan alamat Google Apps Script)
var URL_REKAP = "GANTI_DENGAN_URL_APPS_SCRIPT";

function kirimBook() {
  var f = document.getElementById("form-book");
  var status = document.getElementById("status-book");

  if (f.nama.value == "" || f.section.value == "" || f.type.value == "" ||
      f.email.value == "" || f.hp.value == "" || f.identitas.value == "" ||
      f.lahir.value == "" || f.gender.value == "") {
    status.textContent = "Semua kolom wajib diisi ya.";
    return false;
  }
  if (f.email.value.indexOf("@") == -1) {
    status.textContent = "Format email belum benar.";
    return false;
  }
  if (!f.setuju.checked) {
    status.textContent = "Centang dulu persetujuan syarat dan ketentuan.";
    return false;
  }
  if (URL_REKAP.indexOf("GANTI") == 0) {
    status.textContent = "Data sudah valid, tapi rekapan belum disambungkan ke Google Sheets.";
    return false;
  }

  fetch(URL_REKAP, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams(new FormData(f))
  });
  status.textContent = "Terima kasih! Pesananmu sudah kami terima.";
  f.reset();
  setTimeout(function () {
    tutupModal("modal-book");
    status.textContent = "";
  }, 2500);
  return false;
}
