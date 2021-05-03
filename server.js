require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// user auth ise göster postu

const posts = [
  {
    username: 'Bülent',
    password: '12345',
    title: 'Bülent title',
  },
  {
    username: 'Levent',
    password: 'xyz',
    title: 'Levent title',
  },
  {
    username: 'Haluk',
    password: '123abc',
    title: 'Haluk s title',
  },
];

app.use(express.json());

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3001);
