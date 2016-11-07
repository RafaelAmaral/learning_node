const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const engines = require('consolidate');
const helpers = require('./helpers');
const bodyParser = require('body-parser');

const app = express();
const users = []

app.engine('hbs', engines.handlebars)

app.set('views', './views');
app.set('view engine', 'hbs');

app.use('/profilepics', express.static('images'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => {
  res.end();
})

app.get('/', (req, res) => {
  const users = [];
  fs.readdir('users', (err, files) => {
    if (err) throw err
    files.forEach((file) => {
      fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, (err, data) => {
        if (err) throw err
        const user = JSON.parse(data);
        user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);
        users.push(user);
        if (users.length === files.length) {
          res.render('index', {users: users});
        }
      })
    })
  })
})

app.get('*.json', (req, res) => {
  res.download(`./users/${req.path}`, 'virus.exe');
})

app.get('/data/:username', helpers.verifyUser, (req, res) => {
  const username = req.params.username;
  const user = helpers.getUser(username);
  res.json(user);
})

app.get('/error/:username', (req, res) => {
  res.status(404).send(`No user named ${req.params.username} found`);
})

const userRouter = require('./username');
app.use('/:username', userRouter);

const server = app.listen(3000, () => {
  console.log(`Server running at http://locahhost:${server.address().port}`);
})