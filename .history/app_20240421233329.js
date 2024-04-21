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
app.use("/user_data", express.static("user_data"));
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
      "user_data",
      req.user.username,
      "subjects.json"
    );
    fs.readFile(userFilePath, "utf8", function (err, data) {
      if (err) {
        console.log("userFilePath:", userFilePath);
        console.log("Error:", err);
        res.status(500).send("Error reading user file");
      } else {
        const userData = JSON.parse(data);
        const subjects = Array.isArray(req.body.subjects)
          ? req.body.subjects
          : [];
        const updatedData = {
          ...userData,
          subjects: subjects, // Changed this line
        };
        fs.writeFile(userFilePath, JSON.stringify(updatedData), function (err) {
          if (err) {
            res.status(500).send("Error updating user file");
          } else {
            res.redirect("/dashboard");
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
    res.render("edit-details", { user: req.user });
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

app.post("/update-details", async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  let subjects = req.body.subjects;

  // Ensure subjects is always an array and exclude empty strings
  if (!Array.isArray(subjects)) {
    subjects = [subjects];
  } else {
    subjects = subjects.filter((subject) => subject.trim() !== "");
  }

  const subjectsFilePath = path.join(
    __dirname,
    "user_data",
    req.user.username,
    "subjects.json"
  );

  try {
    await fs.promises.writeFile(
      subjectsFilePath,
      JSON.stringify(subjects),
      "utf8"
    );

    // Add a delay before redirect
    setTimeout(() => {
      res.redirect("/dashboard");
    }, 2000); // Delay for 2 seconds
  } catch (err) {
    res.status(500).send("Error updating user file");
  }
});

app.post("/save-subjects", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  let subjects = req.body.subjects;

  // Exclude strings that are empty or only contain spaces from the subjects array
  subjects = subjects.filter((subject) => subject.trim().length > 0);

  const userDirectoryPath = path.join(
    __dirname,
    "user_data",
    req.user.username
  );

  // Set the flash message before writing to the file
  req.flash("success", "Subjects have been saved and added");

  try {
    // Create directories for each subject
    for (const subject of subjects) {
      const subjectDirectoryPath = path.join(userDirectoryPath, subject);
      await fs.promises.mkdir(subjectDirectoryPath, { recursive: true });
    }

    const subjectsFilePath = path.join(userDirectoryPath, "subjects.json");

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
    res
      .status(500)
      .send("Error writing to subjects file or creating subject directories");
  }
});
app.get("/get-subjects/:username", (req, res) => {
  const username = req.params.username;
  const filePath = path.join(__dirname, "user_data", username, "subjects.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send("Server Error");
    } else {
      // Parse the JSON string to an object
      const subjects = JSON.parse(data);

      // Send the subjects array as a JSON response.
      res.json(subjects);
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // Redirect to login page if not authenticated
    res.redirect("/login");
  }
}

app.get("/chat", ensureAuthenticated, (req, res) => {
  // Assuming 'user' is the logged in user and 'username' is a property of 'user'
  const username = req.user.username;
  res.redirect(`/chat/${username}`);
});

app.get("/chat/:username", ensureAuthenticated, (req, res) => {
  const username = req.params.username;
  res.render("chat", { username: username });
});
let chatHistory = [];

app.post("/saveChatHistory/:subject", function (req, res) {
  console.log(req.body); // Log the request body
  console.log(req.user); // Log the request user

  const { user, ai, subject } = req.body;
  const username = req.user.username; // Get the username of the logged in user

  // Define the directory
  const dir = path.join(__dirname, "user_data", username, subject);
  const newChat = {
    user: user,
    ai: ai,
    subject: subject,
  };
  // Define the filename
  let filename = `${user.replace(/[<>:"/\\|?*]+/g, " ")}.json`;

  fs.readFile(path.join(dir, filename), "utf8", (err, data) => {
    // Parse the existing chat history, or initialize an empty array if the file does not exist
    const chatHistory = data ? JSON.parse(data) : [];

    // Append the new chat message
    chatHistory.push(newChat);

    // Write the updated history back to the file
    fs.writeFile(
      path.join(dir, filename),
      JSON.stringify(chatHistory, null, 2),
      (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          return res.status(500).send("Server Error");
        }

        res.status(200).send("Chat history saved successfully");
      }
    );
  });
});

app.post("/getBotResponse", function (req, res) {
  const { message } = req.body;

  // Read the conversation history from the file
  fs.readFile("conversationHistory.json", "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return res.status(500).send("Server Error");
    }

    // Parse the conversation history
    let conversationHistory = JSON.parse(data);

    // Append the user's message to the conversation history
    conversationHistory.push({ role: "user", content: message });

    // Generate the AI's response based on the entire conversation history
    const aiResponse = generateAIResponse(conversationHistory);

    // Append the AI's response to the conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Write the updated conversation history back to the file
    fs.writeFile(
      "conversationHistory.json",
      JSON.stringify(conversationHistory, null, 2),
      (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          return res.status(500).send("Server Error");
        }

        res.status(200).send(aiResponse);
      }
    );
  });
});
app.get("/user_data/:username/", async (req, res) => {
  const username = req.params.username;
  console.log(`Username: ${username}`);
  try {
    const userData = await getUserData(username); // Replace with your function to get user data
    console.log(`User data: ${JSON.stringify(userData)}`);
    res.json(userData);
  } catch (error) {
    console.error(`Error fetching user data: ${error}`);
    res.status(404).send("User not found");
  }
});

app.use("/user_data", function (req, res, next) {
  const filePath = path.join(__dirname, "user_data", req.path);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filePath} does not exist`);
    } else {
      console.log(`File ${filePath} exists`);
    }
    next();
  });
});
app.use("/user_data", express.static("user_data"));
app.get("/user_data/:username", (req, res) => {
  const username = req.params.username;
  const userData = findUserData(username); // Replace this with your function to find the user data

  if (!userData) {
    res
      .status(404)
      .json({ message: `User data not found for username: ${username}` });
  } else {
    res.json(userData);
  }
});
function dataForUsernameExists(username) {
  const dirPath = path.join(__dirname, "user_data", username);
  return fs.existsSync(userDir);
}
async function getUserData(username) {
  const dirPath = path.join(__dirname, "user_data", username);
  try {
    const files = await fs.promises.readdir(dirPath);
    // Read the user data from the files and return it
    const userData = files.map((file) => {
      return { name: file };
    });
    return userData;
  } catch (error) {
    console.error(`Error reading user data directory: ${error}`);
    throw error;
  }
}
app.get("/user_data/:username/:subjectFolder", async (req, res) => {
  const username = req.params.username;
  const subjectFolder = decodeURIComponent(req.params.subjectFolder);
  console.log(`Username: ${username}, Subject Folder: ${subjectFolder}`);
  try {
    const chatFiles = await getChatFiles(username, subjectFolder); // Replace with your function to get chat files
    console.log(`Chat files: ${JSON.stringify(chatFiles)}`);
    res.json(chatFiles);
  } catch (error) {
    console.error(`Error fetching chat files: ${error}`);
    res.status(404).send("Chat files not found");
  }
});
async function getChatFiles(username, subjectFolder, topic) {
  // Decode the subjectFolder and topic parameters
  subjectFolder = decodeURIComponent(subjectFolder);
  topic = topic ? decodeURIComponent(topic) : "";

  const dirPath = path.join(
    __dirname,
    "user_data",
    username,
    subjectFolder,
    topic
  );
  try {
    const files = await fs.promises.readdir(dirPath);
    // Read the chat files from the directory and return them
    const chatFiles = files.map((file) => {
      return { name: file };
    });
    return chatFiles;
  } catch (error) {
    console.error(`Error reading chat files directory: ${error}`);
    throw error;
  }
}
app.post("/create-chat-file", (req, res) => {
  const { subject, question } = req.body;

  // Replace any characters in the question that are not allowed in filenames
  const filename = `${question.replace(/[^a-z0-9]/gi, "_")}.json`;

  // Define the path to the new file
  const filepath = path.join(__dirname, "user_data", subject, filename);

  // Initialize the file with an empty array
  fs.writeFile(filepath, JSON.stringify([], null, 2), (err) => {
    if (err) {
      console.error(`Error creating file: ${err}`);
      return res.status(500).json({ error: "Server error" });
    }

    res.status(200).json({ message: "Chat file created successfully" });
  });
});
app.get("/user_data/:username/:folder/:file", (req, res) => {
  const { username, folder, file } = req.params;
  const filePath = path.join(__dirname, "user_data", username, folder, file);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to read file" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});
app.get("/getChatHistory/:username/:subject", function (req, res) {
  const { username, subject } = req.params;
  const dir = path.join(__dirname, "user_data", username, subject);

  fs.readFile(path.join(dir, `${subject}.json`), "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return res.status(500).send("Server Error");
    }
    res.status(200).json(JSON.parse(data));
  });
});
app.post("/send-message", async (req, res) => {
  const { message, subject } = req.body;

  // Get the bot's response
  const response = await getResponse(message, subject);

  // Append the user's message and the bot's response to the currently loaded file
  const chat = {
    user: message,
    ai: response,
    subject: subject,
  };

  fs.appendFile(currentChatFile, JSON.stringify(chat, null, 2), (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });

  res.json({ ai: response });
});
app.listen(3000, () => console.log("Server started on port 3000"));
