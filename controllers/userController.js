const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Chat = require('../models/chatModel');

const registerLoad = async(req, res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
}

const register = async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            image: 'images/'+req.file.filename,
        })

        await user.save();

        res.render('success', { message: 'Successfully added' });
    } catch (err) {
        console.log(err.message)
    }
}

const loadLogin = async(req, res) => {
    try {
        res.render('login')
    } catch (err) {
        console.log(err.message)
    }
}

const login = async(req, res) => {
    try {
        
        let email = req.body.email;
        let password = req.body.password;
        console.log(req.body.email);

        const userData = await User.findOne({email});

        if(userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if(passwordMatch) {
                req.session.user = userData;
                res.redirect('/dashboard');
            } else {
                console.log('password wrong')
                res.render('login', {message: 'Email and Password is incorrect'});
            }
        } else {
            console.log('user not exist')
            res.render('login', {message: 'user not exist'});
        }

    } catch (err) {
        console.log(err.message)
    }
}

const logout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.log(err.message)
    }
}

const loadDashboard = async(req, res) => {
    try {
        
        var users = await User.find({ _id: { $nin:[req.session.user._id] }});
        res.render('dashboard', {user: req.session.user, users: users})

    } catch (err) {
        console.log(err.message)
    }
}

const saveChat = async(req, res) => {
    try {

        var chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });

        var newChat = await chat.save();
        res.status(200).send({success: true, msg: 'Chat inserted!', data:newChat});

    } catch(error) {
        res.status(400).send({success: false, msg: error.message});
    }
}

const deleteChat = async(req, res) {
    try {
        await Chat.deleteOne({_id:req.body.id});
        res.status(400).send({success: true})
    } catch (error) {
        res.status(400).send({success: false, msg: error.message});
    }
}

module.exports = {registerLoad, register, loadLogin, login, logout, loadDashboard, saveChat, deleteChat};