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
    avatar: userInfo.profile._json.user.avatar
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
  callbackURL: "http://localhost:3000/auth/fitbit/callback"
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
  res.redirect('/getstarted')
  let links = await functions.getFiles(userInfo.accessToken)
  let status = await functions.downAndUp(links, userInfo.accessToken)
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

    const output = fs.createWriteStream(__dirname + '/tcx-data.zip')
    await s3Zip
      .archive({ s3: s3, bucket: BUCKET_NAME, debug: true }, '', filesArray)
      .pipe(output)

    res.download(__dirname + '/tcx-data.zip')
  } else {
    res.render('download', {
      welcomeText: `${userInfo.profile.displayName}, download is not ready`,
      avatar: userInfo.profile._json.user.avatar
    })
  }
})

app.listen(3000, function(){
  console.log('Server running at Port 3000');
});