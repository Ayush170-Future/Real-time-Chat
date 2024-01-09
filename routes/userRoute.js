const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const multer = require('multer');
const {isLogin, isLogout} = require('../middlewares/auth')
const user_route = express();

const session = require('express-session');
const { SESSION_SECRET } = process.env;

user_route.use(
    session({
      secret: SESSION_SECRET, // Providing the secret option
      resave: false,
      saveUninitialized: false
    })
  );
  
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.set('view engine', 'ejs');
user_route.set('views', './views');

user_route.use(express.static('public'))

const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename:function(req, file, cb) {
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage: storage});
const userController = require('../controllers/userController');

user_route.get('/register', isLogout, userController.registerLoad);
user_route.post('/register', upload.single('image'), userController.register);

user_route.get('/', isLogout, userController.loadLogin);
user_route.post('/', userController.login)
user_route.get('/logout', isLogin, userController.logout)

user_route.get('/dashboard', isLogin, userController.loadDashboard);

user_route.post('/save-chat', userController.saveChat);
user_route.post('/delete-chat', userController.deleteChat);

module.exports = user_route;