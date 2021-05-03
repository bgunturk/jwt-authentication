require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());

const users = [
  { username: 'Bülent', password: '12345' },
  { username: 'Levent', password: 'xyz' },
  { username: 'Haluk', password: '123abc' },
];

let refreshTokens = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ user });
    res.json({ accessToken: accessToken });
  });
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

let newUsers = [];
// login işlemi
app.get('/users', (req, res) => {
  // password hash oldu
  res.json(users);
});

app.post('/login', async (req, res) => {
  let user = users.find((user) => (user.username = req.body.username));

  if (user == null) {
    return res.status(400).send('Cannot find user');
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken(user.password);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

      refreshTokens.push(refreshToken);
      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.send('Not allowed');
    }
  } catch {
    res.sendStatus(500);
  }
});

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };
    users.push(user);
    res.sendStatus(201);
  } catch {
    res.sendStatus(500);
  }
});
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.listen(4000);
