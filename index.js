const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const engines = require('consolidate');
const bodyParser = require('body-parser');

const app = express();
const users = []

function getUserFilePath (username) {
  return path.join(__dirname, 'users', username) + '.json';
}

function getUser (username) {
  const user = JSON.parse(fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'}));
  user.name.full = _.startCase(`${user.name.first} ${user.name.last}`);
  _.keys(user.location).forEach(function (key) {
    user.location[key] = _.startCase(user.location[key]);
  })
  return user;
}

function saveUser (username, data) {
  const fp = getUserFilePath(username);
  fs.unlinkSync(fp); // delete the file
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'});
}

app.engine('hbs', engines.handlebars)

app.set('views', './views');
app.set('view engine', 'hbs');

app.use('/profilepics', express.static('images'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/favicon.ico', function (req, res) {
  res.end();
})

app.get('/', (req, res) => {
  const users = [];
  fs.readdir('users', (err, files) => {
    files.forEach((file) => {
      fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, (err, data) => {
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

app.get('/:username', (req, res) => {
  const username = req.params.username;
  const user = getUser(username);
  res.render('user', {
    user: user,
    address: user.location
  });
})

app.put('/:username', (req, res) => {
  const username = req.params.username;
  const user = getUser(username);
  user.location = req.body;
  saveUser(username, user);
  res.end();
})

app.delete('/:username', (req, res) => {
  const fp = getUserFilePath(req.params.username);
  fs.unlinkSync(fp); // delete the file
  res.sendStatus(200);
})

const server = app.listen(3000, () => {
  console.log(`Server running at http://locahhost:${server.address().port}`);
})