var express = require('express');
var app = express();
var router = express.Router();
  
var path = __dirname + '/';
  
app.use('/', router);
app.use('/assets', express.static(path + 'assets'))
  
router.get('/',function(req, res){
  res.sendFile(path + 'index.html');
});
  
app.listen(3000,function(){
  console.log('Server running at Port 3000');
});