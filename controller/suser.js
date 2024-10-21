const suser = require('../model/suser')
const path = require('path')
const jwt = require('jsonwebtoken');
const college = require('../model/college')
const admin = require('../model/admin')
const doc = require('../model/doctor')
const stu = require('../model/user')
const accappointment = require('../model/acceptedappointments');
const { render } = require('ejs');
const otpGenerator= require('otp-generator')
const nodemailer = require('nodemailer');
class Suserhandler{
    constructor(){}
    async  renderlogin(req,res){
        return res.render(path.resolve(__dirname,'../views/superuser/slogin.ejs'))
    }
    async  checklogin(req,res){
        const {email,password1,checkbox} = req.body
        const user = await suser.findOne({email:email,password:password1})
        if(!user){
            return res.redirect('/suser/login')
        }
        if(checkbox){
            const token = jwt.sign({
                email:email,
                role:"superuser"
            },"druva123")
            res.cookie("Uid4",token,{maxAge:2*24*60*60*1000})
        }
        res.cookie("userdetails",JSON.stringify({email:email,role:"superuser"}))
        return res.redirect('/suser/home')
    }
    async  renderhome(req,res){
        const token = req.cookies.Uid4
        const userdetails = req.cookies.userdetails
        let mail
        if(token){
            const detoken = jwt.verify(token,"druva123")
             mail = detoken.email
        }
        else{
           const  {email,role} = JSON.parse(userdetails)
           mail= email
        }
        const upcominapp = await accappointment.find({date:{$gte:new Date()}})
        const completedapp = await accappointment.find({date:{$lte: new Date()}})
        const clgs =  await college.find({})
        const admins = await admin.find({})
        let amount=0;
        for(let i =0;i<clgs.length;i++){
            amount+=clgs[i].amount
        }
        return res.render(path.resolve(__dirname,'../views/superuser/shome.ejs'),{email:mail,upcominapp,completedapp,clgs,admins,amount:amount})
    }
    async suserhomedet(req,res){
        const token = req.cookies.Uid4
        const userdetails = req.cookies.userdetails
        let mail
        if(token){
            const detoken = jwt.verify(token,"druva123")
             mail = detoken.email
        }
        else{
           const  {email,role} = JSON.parse(userdetails)
           mail= email
        }
        const upcominapp = await accappointment.find({date:{$gte:new Date()}})
        const completedapp = await accappointment.find({date:{$lte: new Date()}})
        const clgs =  await college.find({})
        const admins = await admin.find({})
        return res.send({email:mail,upcominapp,completedapp,clgs,admins})
    }
    async  rendersuserhome(req, res) {
        const token = req.cookies.Uid4;
        const userdetails = req.cookies.userdetails;
        let mail;
    
        if (token) {
            const detoken = jwt.verify(token, "druva123");
            mail = detoken.email;
        } else {
            const { email } = JSON.parse(userdetails);
            mail = email;
        }
    
        const upcominapp = await accappointment.find({ date: { $gte: new Date() } });
        const completedapp = await accappointment.find({ date: { $lte: new Date() } });
        const clgs = await college.find(); 
        const admins = await admin.find(); 
        let amount=0;
        for(let i =0;i<clgs.length;i++){
            amount+=clgs[i].amount
        }
        res.render('superuser/shome', { 
            upcominappLength: upcominapp.length,
            completedappLength: completedapp.length,
            clgsLength: clgs.length,
            adminsLength: admins.length,
            email: mail,
            amount:amount
        });
        
    }
    async  sendhomedata(req,res){
        const token = req.cookies.Uid4;
        const userdetails = req.cookies.userdetails;
        let mail;
    
        if (token) {
            const detoken = jwt.verify(token, "druva123");
            mail = detoken.email;
        } else {
            const { email } = JSON.parse(userdetails);
            mail = email;
        }
    
        const upcominapp = await accappointment.find({ date: { $gte: new Date() } });
        const completedapp = await accappointment.find({ date: { $lte: new Date() } });
        const clgs = await college.find(); 
        const admins = await admin.find(); 
    
        res.json({
            upcominappLength: upcominapp.length,
            completedappLength: completedapp.length,
            clgsLength: clgs.length,
            adminsLength: admins.length,
            email: mail
        });
    }
    async  rendercolleges(req,res){
        const token = req.cookies.Uid4
        const userdetails = req.cookies.userdetails
        let mail
        if(token){
            const detoken = jwt.verify(token,"druva123")
             mail = detoken.email
        }
        else{
           const  {email,role} = JSON.parse(userdetails)
           mail= email
        }
        const clgs =  await college.find({})
        let doctors=[]
        for(let i =0;i<clgs.length;i++){
            let x = await doc.find({college:clgs[i].name})
            doctors.push(x)
        }
            console.log(doctors)
            let students=[]
            for(let i =0;i<clgs.length;i++){
                let x = await stu.find({college:clgs[i].name})
                students.push(x)
            }
            console.log(students)
            let completedapp=[]
            for(let i =0;i<clgs.length;i++){
                console.log(clgs[i])
                let x = await accappointment.find({college:clgs[i].name,date:{$lt: new Date}})
                completedapp.push(x);
            }
            console.log(completedapp)
            let upcominap =[]
            for(let i =0;i<clgs.length;i++){
                let x = await accappointment.find({college:clgs[i].name,date:{$gte: new Date}})
                upcominap.push(x);
            }
            
        return res.render(path.resolve(__dirname,'../views/superuser/scollege.ejs'),{email:mail,clgs,doctors,students,completedapp,upcominap})
    }
    async  renderadmin(req,res){
        const token = req.cookies.Uid4
        const userdetails = req.cookies.userdetails
        let mail
        if(token){
            const detoken = jwt.verify(token,"druva123")
             mail = detoken.email
        }
        else{
           const  {email,role} = JSON.parse(userdetails)
           mail= email
        }
        const admins = await admin.find({})
        return res.render('superuser/sadmin',{email:mail,admins})
    }
    async  logoutsuser(req,res){
        const token = req.cookies.Uid4
        if(token){
            res.clearCookie('Uid4',{httpOnly:true})
        }
        return res.redirect('/')
    }
    async  deletecolleg(req,res){
        const { userId } = req.body;
        try {
            const deletedCollege = await college.findByIdAndDelete(userId);
            if (!deletedCollege) {
                return res.status(404).send('College not found');
            }
           
            console.log(`College with ID ${userId} deleted successfully`);
            return res.redirect('/suser/college'); 
        } catch (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
    }
    async  deleteadmin(req,res){
        const { userId } = req.body;
        try {
            const deletedadmin = await admin.findByIdAndDelete(userId);
            if (!deletedadmin) {
                return res.status(404).send('admin not found');
            }
           
            console.log(`admin with ID ${userId} deleted successfully`);
            return res.redirect('/suser/admin'); 
        } catch (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        } 
    }
    async  addadmin(req,res){
        const clgs =  await college.find({})
        return res.render(path.resolve(__dirname,'../views/superuser/addadmin.ejs'),{clgs})
    }
    async  succesfull(req,res){
        const { email, college1, password1, password2 } = req.body;
        console.log(college1)
        console.log(email + password1 + password2);
        
        if (password1 === password2) {
            await admin.create({
                email: email,
                college: college1,
                password1: password1
            });
            
            res.redirect('/suser/admin');
        } else {
            return res.send('Password does not match');
        }
    }
    async renderforget(req,res){
        return res.render(path.resolve(__dirname,'../views/superuser/suserforget.ejs'))
    }
    generateOTP = () => {
        return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    }

     sendOTP = async (email, otp) =>{
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'campuscarec@gmail.com',
                    pass: 'aifq hosc uyeg expi' // Use environment variables for security
                }
            });
            const mailOptions = {
                from: 'campuscarec@gmail.com',
                to: email,
                subject: 'OTP Verification',
                text: `Your OTP for verification is: ${otp}`
            };
    
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
     requestotp= async (req,res)=>{
        const { email } = req.body;
        console.log(email)
        try {
            const user = await suser.findOne({ email: email });
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Use bind to ensure `this` refers to the class instance
            const otp = await this.generateOTP();
            user.otp = otp;
            await user.save();
            await this.sendOTP(email, otp);
            res.render(path.resolve(__dirname, '../views/superuser/suserverify.ejs'));
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).send('Failed to send OTP');
        }
    }
    async verifyotp4(req,res){
        const { email, otp } = req.body;
        let gmail1 = email
        const user = await suser.findOne({ email: email });
        console.log(user.otp)
        console.log(otp)
        if (!user || !user.otp || user.otp !== otp) {
            return res.status(401).send('Invalid OTP');
        }
        user.otp = null;
       res.cookie('userdetails',JSON.stringify({"gmail":email}))
       return res.render(path.resolve(__dirname,'../views/superuser/cnfrmpassword.ejs'))
    }
    async changepassword(req,res){
        const { password1, password2 } = req.body;
        console.log(password1+password2)
        if (password1 == password2) {
            try {
                  const userDetailsCookie = req.cookies?.userdetails;
                let emailaddress;
                const { gmail } = JSON.parse(userDetailsCookie);
                emailaddress = gmail
                 console.log(emailaddress)
                const user = await suser.findOne({ email: emailaddress });
                if (!user) {
                    return res.status(404).send('User not found');
                }
                console.log(password1)
             user.password = password1;
                await user.save();
                res.clearCookie('Uid1', { httpOnly: true });
                res.clearCookie('Uid2', { httpOnly: true });
                res.clearCookie('uid3', { httpOnly: true });
                res.clearCookie('userdetails', { httpOnly: true });
                return res.redirect("/suser/login");
            } catch (error) {
                console.error('Error updating password:', error);
                return res.status(500).send('Internal Server Error');
            }
        } else {
            return res.status(400).send('Passwords do not match');
        }
        
    }  
    }


module.exports=Suserhandler