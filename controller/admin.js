const Admin = require('../model/admin')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const path = require('path')
const User = require('../model/user')
const Doctor = require('../model/doctor')
const appointment = require('../model/appointments')
const accappointment = require('../model/acceptedappointments');
const prescription = require('../model/medication')
const Leave = require('../model/leave')
const reportdb = require('../model/report')
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const mongoose = require('mongoose');
const College = require('../model/college')
const Prescription = require('../model/medication');
class Adminhandler{
    constructor(){

    }
    async  admin_login(req, res) {
        res.render(path.resolve(__dirname, '../views/admin/adminlogin.ejs'))
    }
    async  clearc(req,res){
        const uid3 = req.cookies.uid3;
        
        if(uid3){
            res.clearCookie('uid3',{httpOnly:true})
            
        }
        return res.redirect('/')
    }
    
    async  renderforgetpage(req,res){
        return res.render(path.resolve(__dirname,'../views/admin/admin_forget.ejs'))
    }
     generateOTP =()=> {
        return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    }

    // Send OTP via email
     sendOTP = async (email, otp)=> {
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
                text: `Your OTP for verification is: ${otp}` // Use template literals correctly
            };
    
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Request OTP and send it to the user's email
     requestotp2 = async (req, res)=> {
        const { email } = req.body;

        try {
            const user = await Admin.findOne({ email: email });
            if (!user) {
                return res.status(404).send('User not found');
            }
            
            const otp = await this.generateOTP(); // Await the generateOTP method
            user.otp = otp;
            await user.save();
            await this.sendOTP(email, otp);
            res.render(path.resolve(__dirname, '../views/admin/admin_verify.ejs'));
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).send('Failed to send OTP');
        }
    }

    async  adminhome(req,res){
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
        let createdy,clg;
        if (userdetails) {
            const { gmail ,college} = JSON.parse(userdetails);
            createdy = gmail;
            clg=college
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
            clg= decodedToken.college
        }
        console.log(createdy)
        let name = createdy.split('@')[0];
        const students = await User.find({college:clg})
        const doctors = await Doctor.find({college:clg})
        const comapp = await accappointment.find({college:clg,date:{$lt :new Date()}})
        const upcomapp = await accappointment.find({college:clg,date:{$gte :new Date()}})
        console.log(comapp)
        return res.render(path.resolve(__dirname,'../views/admin/Admin_home.ejs'),{email:createdy,college:clg,students,doctors,comapp,upcomapp})
    }
    async getadminhomedetails(req,res){
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
        let createdy,clg;
        if (userdetails) {
            const { gmail ,college} = JSON.parse(userdetails);
            createdy = gmail;
            clg=college
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
            clg= decodedToken.college
        }
        console.log(createdy)
        let name = createdy.split('@')[0];
        const students = await User.find({college:clg})
        const doctors = await Doctor.find({college:clg})
        const comapp = await accappointment.find({college:clg,date:{$lt :new Date()}})
        const upcomapp = await accappointment.find({college:clg,date:{$gte :new Date()}})
        console.log(comapp)
        return res.send({email:createdy,college:clg,students,doctors,comapp,upcomapp})
    }
    async  postadminpatients(req, res) {
        try {
            const { email, password1, checkbox } = req.body;
            console.log(email + password1);
            console.log(await Admin.find({}))
            const user = await Admin.findOne({ email: email, password1: password1 });
            if (!user || user.password1 !== password1) {
                console.log('Invalid email or password');
                return res.render(path.resolve(__dirname, '../views/admin/adminlogin.ejs'));
            }
            const patients = await User.find({});
            if (checkbox) {
                const token = jwt.sign({
                    gmail: user.email,
                    college:user.college
                }, "druva123");
                res.cookie("uid3", token, { maxAge: 24 * 60 * 60 * 1000 });
                console.log('Token:', token);
            }
            res.cookie("userdetails", JSON.stringify({
                gmail: user.email,
                college:user.college,
                role:"admin"
            }));
         let name = email.split('@')[0]
         const college = user.college
          return    res.redirect('/admin/home')
        
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }
     async  deleteadminpatients(req,res){
        try{
         const {userId}=req.body;
         const mm=await User.deleteOne({_id:userId});
        
         const token = req.cookies?.uid3;
         const userdetails = req.cookies?.userdetails;
         let createdy,clg;
         if (userdetails) {
             const { gmail ,college} = JSON.parse(userdetails);
             createdy = gmail;
             clg=college
         } else {
             const decodedToken = jwt.verify(token, "druva123");
             createdy = decodedToken.gmail;
             clg= decodedToken.college
         }
         console.log(createdy)
         let name = createdy.split('@')[0];
         const patients = await User.find({college:clg});
         let accapp=[],upcomiapp=[]
         for(let i=0;i<patients.length;i++){
         let x = await accappointment.find({createdy:patients[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
         console.log(x)
         let y = await accappointment.find({createdy:patients[i].gmail,date:{$gte:new Date()}});
         accapp.push(x)
         upcomiapp.push(y)
         }
         return res.redirect('/adminpatients')
            
        }catch(err){
            console.log(err);
        }
    
     }
     async  deletedoctors(req,res){
        try{
         const {userId}=req.body;
         const mm=await Doctor.deleteOne({_id:userId});
        
         const token = req.cookies?.uid3;
         const userdetails = req.cookies?.userdetails;
         let createdy,clg;
         if (userdetails) {
             const { gmail ,college} = JSON.parse(userdetails);
             createdy = gmail;
             clg=college
         } else {
             const decodedToken = jwt.verify(token, "druva123");
             createdy = decodedToken.gmail;
             clg= decodedToken.college
         }
         const doctors = await Doctor.find({college:clg});
         console.log(createdy)
         let name = createdy.split('@')[0];
            // If credentials are correct, render admin_patients page
            let accapp=[],upcomiapp=[],latestdates=[]
            for(let i=0;i<doctors.length;i++){
            let x = await accappointment.find({acceptedby:doctors[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
            let y = await accappointment.find({acceptedby:doctors[i].gmail,date:{$gte:new Date()}});
            accapp.push(x)
            upcomiapp.push(y)
            latestdates.push(x.length > 0 && x[0].date ? x[0].date : "NA")
            }
            res.render(path.resolve(__dirname, '../views/admin/admin_doctor.ejs'), { doctors: doctors,name,email:createdy,college:clg ,accapp,upcomiapp,latestdates});
        }catch(err){
            console.log(err);
        }
    
     }
     async  addin(req, res) {
        try {
            const clgs = await College.find({});
            const token = req.cookies?.uid3;
            const userdetails = req.cookies?.userdetails;
            let createdy, clg;
            
            if (userdetails) {
                const { gmail, college } = JSON.parse(userdetails);
                createdy = gmail;
                clg = college;
            } else if (token) {
                const decodedToken = jwt.verify(token, "druva123");
                createdy = decodedToken.gmail;
                clg = decodedToken.college;
            }
    
            console.log(createdy);
            let name = createdy.split('@')[0];
            let providedCollege = await College.findOne({name:clg}); 
            console.log('x' + providedCollege);
            
            // Pass clgs and providedCollege to the EJS view
            console.log(providedCollege.name)
            res.render(path.resolve(__dirname, '../views/student/signup.ejs'), { clgs, providedCollege });
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    }
    
     async  addindoctor(req,res){
        try{
            const clgs = await College.find({});
            const token = req.cookies?.uid3;
            const userdetails = req.cookies?.userdetails;
            let createdy, clg;
            
            if (userdetails) {
                const { gmail, college } = JSON.parse(userdetails);
                createdy = gmail;
                clg = college;
            } else if (token) {
                const decodedToken = jwt.verify(token, "druva123");
                createdy = decodedToken.gmail;
                clg = decodedToken.college;
            }
    
            console.log(createdy);
            let name = createdy.split('@')[0];
            let providedCollege = await College.findOne({name:clg}); 
            console.log('x' + providedCollege);
            
            // Pass clgs and providedCollege to the EJS view
            console.log(providedCollege.name)
            console.log(clgs)
            res.render(path.resolve(__dirname, '../views/doctor/signup.ejs'),{clgs,providedCollege});
        }catch(err){
          console.log(err);
        }
     }
    
    async  adminview(req,res){
        try{
            const {email,password1,password2}=req.body
        console.log(email+password1+password2)
        if(password1 == password2){
            const newuser=await User.create({
                gmail:email,
                password:password1
            })
            newuser.save();
    
        }
            const patients = await User.find({});
            
            // If credentials are correct, render admin_patients page
            let name = email.split('@')[0];
            let accapp=[],upcomiapp=[]
            for(let i=0;i<patients.length;i++){
            let x = await accappointment.find({createdy:patients[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
            let y = await accappointment.find({createdy:patients[i].gmail,date:{$gte:new Date()}});
            accapp.push(x)
            upcomiapp.push(y)
            }
            return res.redirect('/adminpatients')
           
        }catch(err){
    
        }
    }
    
    async  admindoctorview(req,res){
        try{
            const {email,password1,password2}=req.body
        console.log(email+password1+password2)
        if(password1 == password2){
            const newdoctor=await Doctor.create({
                gmail:email,
                password:password1
            })
            newdoctor.save();
    
        }
            
            // If credentials are correct, render admin_patients page
            const token = req.cookies?.uid3;
            const userdetails = req.cookies?.userdetails;
            let createdy,clg;
            if (userdetails) {
                const { gmail,college } = JSON.parse(userdetails);
                createdy = gmail;
                clg=college
            } else {
                const decodedToken = jwt.verify(token, "druva123");
                createdy = decodedToken.gmail;
                clg=college
            }
            console.log(createdy)
            const doctors = await Doctor.find({college:clg});
            console.log(doctors)
            console.log('x')
            let name = createdy.split('@')[0];
            let accapp=[],upcomiapp=[],latestdates=[]
            for(let i=0;i<doctors.length;i++){
            let x = await accappointment.find({acceptedby:doctors[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
            let y = await accappointment.find({acceptedby:doctors[i].gmail,date:{$gte:new Date()}});
            accapp.push(x)
            upcomiapp.push(y)
            latestdates.push(x.length > 0 && x[0].date ? x[0].date : "NA")
            }
            

            res.render(path.resolve(__dirname, '../views/admin/admin_doctor.ejs'), { doctors: doctors ,name,email:createdy,college:clg,accapp,upcomiapp,latestdates});
        }catch(err){
    
        }
    }
    async  adminpatients(req,res){
        
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
        let createdy,clg;
        if (userdetails) {
            const { gmail,college } = JSON.parse(userdetails);
            createdy = gmail;
            clg=college
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
            clg= decodedToken.college
        }
        console.log(createdy)
        let name = createdy.split('@')[0];
        const patients = await User.find({college:clg});
        let accapp=[],upcomiapp=[],latestdates=[]
        for(let i=0;i<patients.length;i++){
        let x = await accappointment.find({createdy:patients[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
        let y = await accappointment.find({createdy:patients[i].gmail,date:{$gte:new Date()}});
        latestdates.push(x.length > 0 && x[0].date ? x[0].date : "NA");
      accapp.push(x)
     upcomiapp.push(y);
        }
        
        console.log(accapp)
        console.log(upcomiapp)
        console.log(latestdates)
        return res.render(path.resolve(__dirname, '../views/admin/admin_patients.ejs'), { patients: patients,name,email:createdy,college:clg ,accapp,upcomiapp,latestdates});  
    }
    async  admindoctor(req,res){
        
       
        // If credentials are correct, render admin_patients page
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
        let createdy,clg;
        if (userdetails) {
            const { gmail ,college} = JSON.parse(userdetails);
            createdy = gmail;
            clg=college
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
            clg=decodedToken.college
        }
        console.log(createdy)
        let name = createdy.split('@')[0];
        const doctors = await Doctor.find({college:clg});
        let accapp=[],upcomiapp=[],latestdates=[]
        for(let i=0;i<doctors.length;i++){
        let x = await accappointment.find({acceptedby:doctors[i].gmail,date:{$lt:new Date()}}).sort({date:-1});
        let y = await accappointment.find({acceptedby:doctors[i].gmail,date:{$gte:new Date()}});
        accapp.push(x)
        upcomiapp.push(y)
        latestdates.push(x.length > 0 && x[0].date ? x[0].date : "NA")
        }
        res.render(path.resolve(__dirname, '../views/admin/admin_doctor.ejs'), { doctors: doctors ,name,email:createdy,college:clg,accapp,upcomiapp,latestdates});  
    }
    async  adminreport(req,res){
        
      
        // If credentials are correct, render admin_patients page
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
        let createdy,clg;
        if (userdetails) {
            const { gmail,college } = JSON.parse(userdetails);
            createdy = gmail;
            clg=college
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
            clg=decodedToken.college
        }
        console.log(createdy)
        let name = createdy.split('@')[0];
        const reports = await reportdb.find({college:clg});
        res.render(path.resolve(__dirname, '../views/admin/admin_report.ejs'), { reports: reports ,name,email:createdy,college:clg});  
    }
    
    
    async  getadminpatients(req, res) {
        const appointments = await accappointment.find({
            date: {
                $gte: new Date(),
            },
        }).sort({ date: 1, time: 1 });
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const token = req.cookies?.uid3;
        const userdetails = req.cookies?.userdetails;
    
        let createdy;
    
        if (userdetails) {
            const { gmail } = JSON.parse(userdetails);
            createdy = gmail;
        } else {
            const decodedToken = jwt.verify(token, "druva123");
            createdy = decodedToken.gmail;
        }
    
        const today_appointments = await accappointment.find({
            date: {
                $gte: new Date(),
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).sort({ date: 1, time: 1 });
        let name = createdy.split('@')[0];
        let accapp=[],upcomiapp=[],latestdates=[]
        for(let i=0;i<patients.length;i++){
        let x = await accappointment.find({createdy:patients[i].gmail,date:{$lt:new Date()}}).sort({date:1});
        let y = await accappointment.find({createdy:patients[i].gmail,date:{$gte:new Date()}});
         accapp.push(x);
         upcomiapp.push(y);
         latestdates.push(x.length > 0 && x[0].date ? x[0].date : "NA");
        }
       
        console.log(accapp)
        res.render(path.resolve(__dirname, "../views/admin/admin_patients.ejs"), { appointments, today_appointments, createdy,name,accapp,upcomiapp,latestdates });
    
    }
    async  verifyotp2(req,res){
        const { email, otp } = req.body;
        let gmail1 = email
        console.log(email)
        let carray = gmail1.split('@')[1]
        const user = await Admin.findOne({ email: email });
        console.log(user)
        if(!user)
{
    return res.send('please enter crct otp')
}        console.log(user.otp)
        console.log(otp)
        if (!user || !user.otp || user.otp !== otp) {
            return res.status(401).send('Invalid OTP');
        }
        user.otp = null;
       res.cookie('userdetails',JSON.stringify({"gmail":email}))
       res.redirect('/confirmchange')
    }
    async  confirmc(req,res){
        return res.render(path.resolve(__dirname,'../views/admin/admin_changepassword.ejs'))
    }
    async  changepassword2(req, res) {
        const { password1, password2 } = req.body;
        console.log(password1+password2)
        if (password1 === password2) {
            try {
                  const userDetailsCookie = req.cookies?.userdetails;
                let emailaddress;
                const { gmail } = JSON.parse(userDetailsCookie);
                emailaddress = gmail
                 console.log(emailaddress)
                const user = await Admin.findOne({ email: emailaddress });
                if (!user) {
                    return res.status(404).send('User not found');
                }
                console.log(password1)
             user.password1 = password1;
                await user.save();
                res.clearCookie('Uid1', { httpOnly: true });
                res.clearCookie('Uid2', { httpOnly: true });
                res.clearCookie('uid3', { httpOnly: true });
                res.clearCookie('userdetails', { httpOnly: true });
                return res.redirect("/adminlogin");
            } catch (error) {
                console.error('Error updating password:', error);
                return res.status(500).send('Internal Server Error');
            }
        } else {
            return res.status(400).send('Passwords do not match');
        }
        
    }
    
}


module.exports = Adminhandler