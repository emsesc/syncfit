var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var s3Zip = require('s3-zip');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
var passport = require('passport')
var app = express();
var router = express.Router();
var functions = require('./helpers.js')
var fs = require('file-system')
require('dotenv').config();

const AWS = require('aws-sdk');
const ID = process.env.S3_ID;
const SECRET = process.env.S3_SECRET;
const BUCKET_NAME = 'syncfit-test-bucket';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

var userInfo = ""

app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
  
var path = __dirname;
  
app.use('/', router);
app.use('/assets', express.static(path + '/assets'))
  
router.get('/',function(req, res){
  res.sendFile(path + '/index.html');
});

router.get('/getstarted', function(req, res){
  console.log("Requesting...")
  res.render('download', {
    welcomeText: userInfo.profile.displayName,
    avatar: userInfo.profile._json.user.avatar640,
    link: "/startdownload",
    btnText: "Start Download"
  })
});

router.get('/checkstatus', function(req, res){
  console.log("Time to download!...")
  res.render('download', {
    welcomeText: userInfo.profile.displayName,
    avatar: "https://i.pinimg.com/originals/6b/67/cb/6b67cb8a166c0571c1290f205c513321.gif",
    link: "/downloadnow",
    btnText: "Check Status and Download!"
  })
});

app.use(passport.initialize());
app.use(passport.session({
  resave: false,
  saveUninitialized: true
}));

const CLIENT_ID = process.env.FITBIT_CLIENT_ID
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET

app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new FitbitStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: "https://syncfitapp.herokuapp.com/auth/fitbit/callback"
},
function(accessToken, refreshToken, profile, done) {
  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });
}
));

app.get('/auth/fitbit',
  passport.authenticate('fitbit', { scope: ['activity', 'location','profile'] }
));

app.get( '/auth/fitbit/callback', passport.authenticate( 'fitbit', { 
    successRedirect: '/auth/fitbit/success',
    failureRedirect: '/auth/fitbit/failure'
}));

app.get('/auth/fitbit/success', function(req, res, next) {
  // res.send(req.user);
  userInfo = req.user
  // console.log(userInfo)
  // console.log(JSON.stringify(userInfo.profile._json))
  res.redirect('/getstarted')
});
  
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/startdownload', async (req, res) => {
  let links = await functions.getFiles(userInfo.accessToken)
  await functions.downAndUp(links, userInfo.accessToken)
  res.redirect('/uploadstatus')
})

app.get('/downloadnow', async (req, res) => {
  let status = await functions.checkDownload()
  if (status == true) {
    // res.render('download', {
    //   welcomeText: `${userInfo.profile.displayName}, download is ready`,
    //   avatar: userInfo.profile._json.user.avatar
    // })

    let filesArray = await functions.listFiles()
    console.log("We got: " + filesArray)

    const output = fs.createWriteStream(__dirname + `/${userInfo.profile.displayName}-tcx-data.zip`)
    await s3Zip
      .archive({ s3: s3, bucket: BUCKET_NAME, debug: true }, '', filesArray)
      .pipe(output)

    output.on('finish', function() {
      res.download(__dirname + `/${userInfo.profile.displayName}-tcx-data.zip`)
    });
    // wait till file is done appending from s3Zip
  } else {
    res.render('download', {
      welcomeText: `${userInfo.profile.displayName}, download is not ready`,
      avatar: "https://i.pinimg.com/originals/6b/67/cb/6b67cb8a166c0571c1290f205c513321.gif",
      link: "/downloadnow",
      btnText: "Check Status and Download!"
    })
  }
})

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));