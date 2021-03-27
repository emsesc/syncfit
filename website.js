var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
var passport = require('passport')
var app = express();
var router = express.Router();
require('dotenv').config();

app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
  
var path = __dirname + '/';
  
app.use('/', router);
app.use('/assets', express.static(path + 'assets'))
  
router.get('/',function(req, res){
  res.sendFile(path + 'index.html');
});

router.get('/getstarted', function(req, res){
  res.sendFile(path + 'download.html')
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
  res.redirect('/getstarted')
});
  
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000,function(){
  console.log('Server running at Port 3000');
});