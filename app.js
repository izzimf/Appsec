const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "123456";

// GET / - страница с формой входа
app.get("/", (req, res) => {
  res.send(`
    <h2>Login App (vulnerable) </h2>
    <form method="POST" action="/login">
      <label>Username:</label><br>
      <input type="text" name="username" /><br><br>
      <label>Password:</label><br>
      <input type="password" name="password" /><br><br>
      <button type="submit">Login</button>
    </form>
    <p>Try POST /login</p>
  `);
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.send(`<h1>Welcome, ${escapeHtml(username)}!</h1>`);
  } else {
    res.send(`<p>Invalid credentials for ${escapeHtml(username)}</p>`);
  }
});

// GET /error — больше не раскрывает стек
app.get("/error", (req, res) => {
  try {
    throw new Error("Something broke!");
  } catch (err) {
    console.error(err); // логируем на сервер
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Vulnerable server running on http://localhost:${PORT}`);
});
