const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = process.env.PORT || 3000;

// gunakan ejs
app.set("view engine", "ejs");

// Third-party Middleware
app.use(expressLayouts);

// Built-in middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Ahmad Maulana",
      email: "maulana@gmail.com",
    },
    {
      nama: "Muhammad Rizwani",
      email: "uwang@gmail.com",
    },
    {
      nama: "Ahmad Sasar",
      email: "ansar@gmail.com",
    },
  ];

  res.render("index", {
    nama: "Ahmad Maulana",
    title: "Halaman Home",
    mahasiswa: mahasiswa,
    layout: "layouts/main-layout",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts: contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form tambah data contact",
    layout: "layouts/main-layout",
  });
});

app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }

      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // kirimkan req flash messages
      req.flash("msg", "Data contact berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  if (!contact) {
    res.status(404);
    res.send(`<h1>404</h1>`);
  } else {
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
    deleteContact(req.params.nama);
  }
});

app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("edit-contact", {
    title: "Form ubah data contact",
    layout: "layouts/main-layout",
    contact: contact,
  });
});

app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }

      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      // kirimkan req flash messages
      req.flash("msg", "Data contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail Contact",
    contact: contact,
  });
});

app.use((req, res) => {
  res.status(404);
  res.send(`<h1>404</h1>`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
