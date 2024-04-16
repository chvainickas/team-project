import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { fileURLToPath } from "url";
import { dirname } from "path";
import flash from "connect-flash"; // Import the 'connect-flash' package
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Add this line to import the 'body-parser' module for parsing JSON data
app.use(
  session({
    secret: "your secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash()); // Add this line to use the 'flash' module
passport.use(
  new LocalStrategy(function (username, password, done) {
    const userDir = path.join(__dirname, "user_data", username);

    fs.readFile(path.join(userDir, "user.txt"), (err, data) => {
      if (err) {
        return done(null, false, { message: "Invalid username or password" });
      } else {
        const userData = JSON.parse(data);

        if (userData.password === password) {
          return done(null, userData);
        } else {
          return done(null, false, { message: "Invalid username or password" });
        }
      }
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  const userDir = path.join(__dirname, "user_data", username);

  fs.readFile(path.join(userDir, "user.txt"), (err, data) => {
    if (err) {
      return done(err);
    } else {
      const userData = JSON.parse(data);
      return done(null, userData);
    }
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

app.post("/register", (req, res) => {
  const { firstName, lastName, username, password, email, courseName } =
    req.body;

  const userDir = path.join(__dirname, "user_data", username);

  fs.access(userDir, (err) => {
    if (err) {
      fs.mkdir(userDir, { recursive: true }, (err) => {
        if (err) throw err;

        const userData = {
          firstName,
          lastName,
          username,
          password,
          email,
          courseName,
        };

        fs.writeFile(
          path.join(userDir, "user.txt"),
          JSON.stringify(userData),
          (err) => {
            if (err) throw err;

            res.render("registration-success", { username: username });
          }
        );
      });
    } else {
      res.send("Username already exists");
    }
  });
});

app.post("/update-details", function (req, res) {
  if (req.user) {
    const userFilePath = path.join(
      __dirname,
      "users",
      req.user.username + ".json"
    );
    fs.readFile(userFilePath, "utf8", function (err, data) {
      if (err) {
        res.status(500).send("Error reading user file");
      } else {
        const userData = JSON.parse(data); // Define userData here
        const updatedData = {
          ...userData,
          subjects: req.body.subjects,
        };
        fs.writeFile(userFilePath, JSON.stringify(updatedData), function (err) {
          if (err) {
            res.status(500).send("Error updating user file");
          } else {
            res.redirect("/first-time-dashboard");
          }
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/edit-details", function (req, res) {
  if (req.user) {
    const userFilePath = path.join(
      __dirname,
      "user_data",
      req.user.username,
      "subjects.json"
    );
    fs.readFile(userFilePath, "utf8", function (err, data) {
      if (err) {
        console.error(err); // Log the error
        res.status(500).send("Error reading user file");
      } else {
        const userData = JSON.parse(data);
        res.render("edit-details", { user: userData });
      }
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/dashboard", function (req, res) {
  if (req.user) {
    const subjectsFilePath = path.join(
      __dirname,
      "user_data",
      req.user.username,
      "subjects.json"
    );
    fs.access(subjectsFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.render("first-time-dashboard", {
          messages: req.flash("success"),
          username: req.user.username,
        }); // Add 'username' to the render options
      } else {
        res.render("dashboard", {
          messages: req.flash("success"),
          username: req.user.username,
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/edit-details", function (req, res) {
  if (req.user) {
    const userFilePath = path.join(
      __dirname,
      "user_data",
      req.user.username + ".json"
    );
    const userData = req.body;
    fs.writeFile(
      userFilePath,
      JSON.stringify(userData),
      "utf8",
      function (err) {
        if (err) {
          res.status(500).send("Error writing to user file");
        } else {
          req.flash("success", "Subjects have been saved and added");
          res.redirect("/dashboard");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});
app.post("/save-subjects", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const subjects = req.body.subjects.map((subject) => subject.trim());

  const subjectsFilePath = path.join(
    __dirname,
    "user_data",
    req.user.username,
    "subjects.json"
  );

  // Set the flash message before writing to the file
  req.flash("success", "Subjects have been saved and added");

  try {
    await fs.promises.writeFile(
      subjectsFilePath,
      JSON.stringify(subjects),
      "utf8"
    );

    // Add a delay before the redirect
    setTimeout(() => {
      res.redirect("/dashboard");
    }, 2000); // Delay for 2 seconds
  } catch (err) {
    res.status(500).send("Error writing to subjects file");
  }
});
app.listen(3000, () => console.log("Server started on port 3000"));
