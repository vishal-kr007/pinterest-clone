var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const localStratergy = require('passport-local');
passport.use(new localStratergy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
})

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.send("profile")
});

router.post('/register', (req, res) => {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });
  // Rest of your code for saving the user, error handling, etc.
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local", {
  successRedirect: './profile',
  failureRedirect: "/"
}), (req, res) => {
  res.render('login');
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
