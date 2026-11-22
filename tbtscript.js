// pindah halaman
var waktuMulai = Date.now();

function pindahHalaman(nama, bagian) {
  var semua = document.querySelectorAll(".view");
  for (var i = 0; i < semua.length; i++) {
    semua[i].classList.remove("tampil");
  }
  var halaman = document.getElementById("view-" + nama);
  halaman.classList.add("tampil");
  halaman.querySelector(".header").after(document.getElementById("teks-berjalan"));

  // teks berjalan lanjut dari posisi terakhir, tidak mulai dari awal
  var teksJalan = document.querySelector("#teks-berjalan p");
  var lama = parseFloat(getComputedStyle(teksJalan).animationDuration);
  teksJalan.style.animationDelay = "-" + (((Date.now() - waktuMulai) / 1000) % lama) + "s";

  var menu = document.querySelectorAll(".menu > ul > li > a, .tombol-nav");
  for (var j = 0; j < menu.length; j++) {
    menu[j].classList.toggle("aktif", menu[j].dataset.nav == nama);
  }

  tutupDropdown();
  if (bagian) {
    document.getElementById(bagian).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

// dropdown: muncul saat dipencet, hilang sendiri setelah 4 detik
var timerDropdown = null;

function bukaDropdown(link) {
  tutupDropdown();
  link.parentElement.classList.add("buka");
  timerDropdown = setTimeout(tutupDropdown, 4000);
}

function tutupDropdown() {
  clearTimeout(timerDropdown);
  var semua = document.querySelectorAll(".dropdown");
  for (var i = 0; i < semua.length; i++) {
    semua[i].classList.remove("buka");
  }
}

document.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown")) {
    tutupDropdown();
  }
});

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
var digeser = false;
var semuaSlider = document.querySelectorAll(".slider");
for (var s = 0; s < semuaSlider.length; s++) {
  semuaSlider[s].addEventListener("pointerdown", function (e) {
    awalX = e.clientX;
    digeser = false;
  });
  semuaSlider[s].addEventListener("pointerup", function (e) {
    var selisih = e.clientX - awalX;
    var idTrack = "track-" + konserAktif;
    var jumlah = document.getElementById(idTrack).children.length;
    if (selisih < -40) {
      digeser = true;
      keSlide(idTrack, (slideSekarang + 1) % jumlah);
    } else if (selisih > 40) {
      digeser = true;
      keSlide(idTrack, (slideSekarang - 1 + jumlah) % jumlah);
    }
  });
}

// klik gambar slide untuk zoom
var gambarSlide = document.querySelectorAll(".slider img");
for (var g = 0; g < gambarSlide.length; g++) {
  gambarSlide[g].addEventListener("click", function () {
    if (digeser) return;
    var besar = document.getElementById("gambar-zoom");
    besar.src = this.src;
    besar.alt = this.alt;
    besar.classList.remove("besar");
    bukaModal("modal-zoom");
  });
}
document.getElementById("gambar-zoom").addEventListener("click", function () {
  this.classList.toggle("besar");
});

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
  document.getElementById("status-book").textContent = "";
  bukaModal("modal-book");
}

// form booking
var NOMOR_WA = "628XXXXXXXXXX";                 // nomor WA admin, awali 62
// alamat Apps Script (rekap) untuk tiap konser, nomornya sama dengan bukaBook()
var URL_REKAP = {
  1: "GANTI_URL_ENHYPEN",
  2: "GANTI_URL_NCT_WISH",
  3: "GANTI_URL_EXO",
  4: "GANTI_URL_TXT"
};

// kecilkan foto bukti transfer sebelum dikirim
function kecilkanGambar(file, selesai) {
  var reader = new FileReader();
  reader.onload = function () {
    var img = new Image();
    img.onload = function () {
      var skala = Math.min(1, 1000 / Math.max(img.width, img.height));
      var kanvas = document.createElement("canvas");
      kanvas.width = img.width * skala;
      kanvas.height = img.height * skala;
      kanvas.getContext("2d").drawImage(img, 0, 0, kanvas.width, kanvas.height);
      selesai(kanvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = function () {
      selesai(null);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// tampilkan atau sembunyikan isian sesuai pilihan
function aturForm() {
  var f = document.getElementById("form-book");
  var pakaiAdmin = f.data_tiket.value == "Data Admin";
  document.getElementById("data-pribadi").hidden = pakaiAdmin;
  if (pakaiAdmin) {
    f.identitas.value = "";
    f.lahir.value = "";
    var gender = document.querySelectorAll("[name=gender]");
    for (var i = 0; i < gender.length; i++) {
      gender[i].checked = false;
    }
  }
  document.getElementById("metode-bayar").hidden = f.payment.value != "Self Payment";
}

function kirimBook() {
  var f = document.getElementById("form-book");
  var status = document.getElementById("status-book");
  var tombol = f.querySelector("button[type=submit]");

  var pakaiAdmin = f.data_tiket.value == "Data Admin";
  if (f.nama.value == "" || f.section.value == "" || f.type.value == "" ||
      f.payment.value == "" || f.email.value == "" || f.hp.value == "" ||
      f.bukti.files.length == 0) {
    status.textContent = "Semua kolom wajib diisi ya.";
    return false;
  }
  if (!pakaiAdmin && (f.identitas.value == "" || f.lahir.value == "" || f.gender.value == "")) {
    status.textContent = "Data identitas wajib diisi kalau memakai data customer.";
    return false;
  }
  if (f.payment.value == "Self Payment" && f.metode_bayar.value == "") {
    status.textContent = "Isi metode self payment-nya dulu, misalnya VA BCA.";
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
  var url = URL_REKAP[konserAktif];
  if (!url || url.indexOf("GANTI") == 0) {
    status.textContent = "Data sudah valid, tapi rekapan belum disambungkan ke Google Sheets.";
    return false;
  }

  var nama = f.nama.value;
  var konser = f.konser.value;
  tombol.disabled = true;
  status.textContent = "Mengirim...";

  kecilkanGambar(f.bukti.files[0], function (gambar) {
    if (!gambar) {
      status.textContent = "Bukti transfer harus berupa gambar.";
      tombol.disabled = false;
      return;
    }
    var data = {};
    new FormData(f).forEach(function (nilai, kunci) {
      if (kunci != "bukti") {
        data[kunci] = nilai;
      }
    });
    data.bukti = gambar;
    fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    document.getElementById("link-wa").href = "https://wa.me/" + NOMOR_WA + "?text=" +
      encodeURIComponent("Halo Tikettip by Tyssa, aku sudah isi form booking " + konser + " atas nama " + nama + ".");
    f.reset();
    aturForm();
    f.konser.value = konser;
    status.textContent = "";
    tombol.disabled = false;
    tutupModal("modal-book");
    bukaModal("modal-terima");
  });
  return false;
}
