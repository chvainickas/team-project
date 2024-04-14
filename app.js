const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
// Set EJS as the view engine
app.set("view engine", "ejs");
// Serve static files from the 'public' directory
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note: secure should be set to true when in a production environment and the site is served over HTTPS
  })
);
app.get("/edit-details", (req, res) => {
  if (!req.session.username) {
    // If the user is not logged in, redirect them to the login page
    return res.redirect("/login");
  }
  // Load user details from file
  const userData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "user_data", req.session.username, "user.txt"),
      "utf8"
    )
  );
  // Render the 'edit-details' view, passing in the user details
  res.render("edit-details", userData);
});

app.post("/update-details", (req, res) => {
  // Get the new details from req.body
  const newDetails = req.body;
  // Update the user details file
  fs.writeFileSync(
    path.join(__dirname, "user_data", req.session.username, "user.txt"),
    JSON.stringify(newDetails)
  );
  // Redirect back to the dashboard
  res.redirect("/dashboard");
});

app.post("/register", (req, res) => {
  const { firstName, lastName, username, password, email, courseName } =
    req.body;

  const userDir = path.join(__dirname, "user_data", username);

  fs.access(userDir, (err) => {
    if (err) {
      // Directory does not exist, create it
      fs.mkdir(userDir, { recursive: true }, (err) => {
        if (err) throw err;

        const userData = {
          firstName,
          lastName,
          username,
          password, // Note: You should hash the password before storing it
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
      // Directory exists, user already registered
      res.send("Username already exists");
    }
  });
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const userDir = path.join(__dirname, "user_data", username);

  fs.readFile(path.join(userDir, "user.txt"), (err, data) => {
    if (err) {
      // User does not exist
      res.send("Invalid username or password");
    } else {
      const userData = JSON.parse(data);

      if (userData.password === password) {
        // User exists and password is correct
        res.render("dashboard", { username: username });
      } else {
        // User exists but password is incorrect
        res.send("Invalid username or password");
      }
    }
  });
});
app.listen(3000, () => console.log("Server started on port 3000"));
