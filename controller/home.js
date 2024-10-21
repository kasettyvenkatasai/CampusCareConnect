const path = require('path')
const User = require('../model/user')
const Doctor = require('../model/doctor')
const appointment = require('../model/appointments')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
class Homehandler1{
    constructor(){}
    async  handlehome(req,res){
        try {
            const uid1 = req.cookies.Uid1;
            const uid2 = req.cookies.Uid2;
            const uid3 = req.cookies.uid3;
            const uid4 = req.cookies.Uid4
            if (!uid1 && !uid2 && !uid3 && !uid4) {
                return res.render(path.resolve(__dirname,'../views/index.ejs'));
            }
            try {
                if(uid1){
                    const logineddoctor=jwt.verify(uid1,"druva123");
                    if(logineddoctor){
                        return res.redirect('/doctor/home');
                    }
                }
                if(uid2){
                    const logineduser=jwt.verify(uid2,"druva123");
                    if (logineduser){
                        return res.redirect('/student/home');
                    }
                }
                if(uid3){
                    const admin = jwt.verify(uid3,"druva123");
                    console.log(admin)
                    if(admin){
                        return res.redirect('/admin/home')
                    }
                }
                if(uid4){
                    const admin = jwt.verify(uid4,"druva123");
                    console.log(admin)
                    if(admin){
                        return res.redirect('/suser/home')
                    }
                }
            } catch (error) {
                console.error('Error verifying JWT:', error);
                return res.status(500).send('Internal Server Error');
            }
            return res.render(path.resolve(__dirname,'../views/index.ejs'));
        } catch (error) {
            console.error('Error:',error);
            return res.status(500).send('Internal Server Error');
        }
    }
    async  render_a(req,res){
        res.render(path.resolve(__dirname,'../views/a.ejs'));
    }
    async  aboutus(req,res){
        res.render(path.resolve(__dirname,'../views/aboutus.ejs'))
    }
}

module.exports=Homehandler1