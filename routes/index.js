var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');

const localStratergy = require('passport-local');
passport.use(new localStratergy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
})

router.get('/feed', isLoggedIn, function(req, res, next) {
  res.render('feed');
})

router.post('/upload', isLoggedIn, upload.single('file'), async function(req, res, next) {
  if(!req.file){
    return res.status(404).send('No files were uploaded.' ) ;
  }
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  let post = await postModel.create({
    image: req.file.filename,
    postText: req.body.filecaption,
    user: user._id
  });

  await user.posts.push(post._id);
  user.save();
  res.redirect("/profile");
})

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  console.log(user);
  res.render('profile', {user})
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
  failureRedirect: "/login",
  failureFlash: true
}), (req, res) => {
  res.render('login');
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
