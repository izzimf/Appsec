const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded (form submit)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ❌ Уязвимость 1: Hardcoded credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456"; // ⚠️ пароль захардкожен

// GET / - страница с формой входа
app.get("/", (req, res) => {
  res.send(`
    <h2>Login App (vulnerable) 🚀</h2>
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

// POST /login - уязвимая обработка (reflected XSS + hardcoded creds)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Вставка username прямо в HTML — reflected XSS риск
    res.send(`<h1>Welcome, ${username}!</h1>`);
  } else {
    // Тоже отражаем username — показывает XSS
    res.send(`<p>Invalid credentials for ${username}</p>`);
  }
});

// GET /error - демонстрация утечки стека
app.get("/error", (req, res) => {
  try {
    throw new Error("Something broke!");
  } catch (err) {
    // Возвращаем stack — это плохо (информационная утечка)
    res.send(`Error details: <pre>${err.stack}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log(`Vulnerable server running on http://localhost:${PORT}`);
});
