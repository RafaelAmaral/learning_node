const express = require('express');
const fs = require('fs');
const helpers = require('./helpers');

const router = express.Router({
  mergeParams: true
});

router.all('/', (req, res, next) => {
  console.log(req.method, 'for', req.params.username);
  next();
})

router.get('/', helpers.verifyUser, (req, res) => {
  const username = req.params.username;
  const user = helpers.getUser(username);
  res.render('user', {
    user: user,
    address: user.location
  });
})

router.put('/', (req, res) => {
  const username = req.params.username;
  const user = helpers.getUser(username);
  user.location = req.body;
  helpers.saveUser(username, user);
  res.end();
})

router.delete('/', (req, res) => {
  const fp = helpers.getUserFilePath(req.params.username);
  fs.unlinkSync(fp); // delete the file
  res.sendStatus(200);
})

module.exports = router