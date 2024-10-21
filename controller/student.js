
const path = require('path')
const mongoose = require('mongoose')
const User = require('../model/user')
const Doctor = require('../model/doctor')
const appointment = require('../model/appointments')
const jwt = require('jsonwebtoken');
const accappointment = require('../model/acceptedappointments');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Leave = require('../model/leave')
const prescription =require('../model/medication')
const reportdb = require('../model/report')
const cookieParser = require('cookie-parser');
const { json } = require('express');
const express = require('express')
const Collage = require('../model/college')
const rejectedappointment = require('../model/rejectedappointments')
const canappointments = require('../model/cancelledapp')
const app = express()
app.use(express.urlencoded({extended:false}))
class StudentController{
    constructor(){
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

     requestotp = async (req, res)=> {
        const { email } = req.body;

        try {
            const user = await User.findOne({ gmail: email });
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Use bind to ensure `this` refers to the class instance
            const otp = await this.generateOTP();
            user.otp = otp;
            await user.save();
            await this.sendOTP(email, otp);
            res.render(path.resolve(__dirname, '../views/student/verfiyotp.ejs'));
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).send('Failed to send OTP');
        }
    }
    async  verifyotp(req,res){
        const { email, otp } = req.body;
        let gmail1 = email
        let carray = gmail1.split('@')[1]
        const user = await User.findOne({ gmail: email });
        console.log(user.otp)
        console.log(otp)
        if (!user || !user.otp || user.otp !== otp) {
            return res.status(401).send('Invalid OTP');
        }
        user.otp = null;
       res.cookie('userdetails',JSON.stringify({"gmail":email}))
       res.redirect('/changepassword')
    }
    async  renderdstudentlogin(req,res){
        const clgs =await Collage.find({}).sort({name:1})
     res.render(path.resolve(__dirname,'../views/student/login1.ejs'),{clgs});
 }
 async rendersignup(req,res){
     const clgs =await Collage.find({}).sort({name:1})
    let providedCollege = null;
    
    
     res.render(path.resolve(__dirname,'../views/student/signup.ejs'),{clgs,providedCollege})
 }
 
// Define the requestotp123 method
async requestotp123(req, res) {
    const { email, college1, password1, password2 } = req.body;
    console.log(college1);
    console.log(email + password1 + password2);
    const clg = await Collage.findOne({name:college1})
     const students = await User.find({college:college1})
    if(students.length>=clg.noOfStudents){
        return res.send('maximum limit of your college reached maximum ')
     }
     let d = email.split('@')[1]
     if (d!=clg.domain){
        return res.send('please use your college mail which has following domain ' + clg.domain)
     }

    if (password1 === password2) {
        // Create a new user
        let newuser = await User.create({
            gmail: email,
            college: college1,
            password: password1,
        });

        // Check role or uid3 cookie
        const isuid = req.cookies.uid3;
        
        let role = null;
        
            try {
                const uid3 = req.cookies.userdetails;
                role = JSON.parse(uid3).role;
            } catch (error) {
                console.error('Error parsing uid3 cookie:', error);
            }
        

        // If role is admin or uid3 exists, redirect to '/adminpatients'
        if (role === 'admin' || isuid) {
            return res.redirect('/adminpatients');
        }

        console.log('User created successfully');

        // Fetch the newly created user
        const user = await User.findOne({ gmail: newuser.gmail });
        const newemail = user.gmail;
        const newcollege = user.college;
        const newpassword = user.password;

        // Generate OTP
        const otp = await this.generateOTP(); // Correct usage of `this`

        // Optionally save the OTP in the user model
        user.otp = otp; // Assuming the User model has an 'otp' field
        await user.save();
        await User.findByIdAndDelete(user._id); // Ensure you really want to delete the user after this
        console.log('OTP generated and user updated');

        // Send OTP via email
        await this.sendOTP(email, otp);
        console.log(otp)
        return res.render(path.resolve(__dirname, '../views/student/verifyotp123.ejs'), {
            newemail, 
            newcollege, 
            newpassword, 
            otp
        });
    } else {
        return res.send('Passwords do not match');
    }
}

 async  renderverfiyotp123(req,res){
     return res.render(path.resolve(__dirname,'../views/student/verifyotp123.ejs'))
 }
 async  verifyotp123(req,res){
 const {emailog,passwordog,otpog,otp,email,collegeog} = req.body
 console.log(emailog+passwordog+otpog+otp+email+collegeog)
 if(emailog == email && otpog == otp){
     let newuser=   await User.create({
         gmail: email,
         college: collegeog,
         password: passwordog,
         otp:otp
        
     });
     console.log('new user created')
 }
 else{
    console.log('some mis matches');
    return res.render(path.resolve(__dirname, '../views/student/verifyotp123.ejs'), {
        emailog, 
        collegeog, 
        passwordog, 
        otpog
    });

 }
 return res.redirect('/student/login')
 }
 async  getstudenthome(req, res) {
     try {
         const date = new Date();
         const twoDaysAgo = new Date();
         twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
 
         let appointments, prescriptions;
         const userDetailsCookie = req.cookies?.userdetails;
         let emailaddress,college1;
 
         if (!userDetailsCookie) {
             console.log('persistent cookie')
             const token = req.cookies?.Uid2;
             const detoken = jwt.verify(token, "druva123");
             const gmail = detoken.gmail;
             college1 = detoken.college;
             emailaddress = gmail;
 
             prescriptions = await prescription.find({
                 createdfor: emailaddress,
                 createdon: { $gte: twoDaysAgo }
             }).sort({createdon:-1});
 
             appointments = await accappointment.find({
                 date: { $gte: new Date() },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
         } else {
             console.log('session')
             const { gmail,college } = JSON.parse(userDetailsCookie);
             emailaddress = gmail;
             college1 = college;
 
             prescriptions = await prescription.find({
                 createdfor: emailaddress,
                 createdon: { $gte: twoDaysAgo }
             }).sort({createdon:-1});
 
             appointments = await accappointment.find({
                 date: { $gte: new Date() },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
         }
 
         console.log(emailaddress);
         console.log(appointments);
         console.log(prescriptions);
       console.log(college1)
         return res.render(path.resolve(__dirname, '../views/student/home.ejs'), { appointments, emailaddress, prescriptions,college1 });
     } catch (error) {
         console.error('Error fetching appointments:', error);
         return res.status(500).send('Internal Server Error');
     }
 }
 async getmedications(req,res){
    const date = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    let appointments, prescriptions;
    const userDetailsCookie = req.cookies?.userdetails;
    let emailaddress,college1;

    if (!userDetailsCookie) {
        console.log('persistent cookie')
        const token = req.cookies?.Uid2;
        const detoken = jwt.verify(token, "druva123");
        const gmail = detoken.gmail;
        college1 = detoken.college;
        emailaddress = gmail;

        prescriptions = await prescription.find({
            createdfor: emailaddress,
            createdon: { $gte: twoDaysAgo }
        }).sort({createdon:-1});
        console.log(prescriptions[0].createdon.toString())
        appointments = await accappointment.find({
            date: { $gte: new Date() },
            createdy: gmail
        }).sort({ date: 1, time: 1 });
    } else {
        console.log('session')
        const { gmail,college } = JSON.parse(userDetailsCookie);
        emailaddress = gmail;
        college1 = college;

        prescriptions = await prescription.find({
            createdfor: emailaddress,
            createdon: { $gt: twoDaysAgo }
        }).sort({createdon:-1});
        
        appointments = await accappointment.find({
            date: { $gte: new Date() },
            createdy: gmail
        }).sort({ date: 1, time: 1 });
    }

    console.log(emailaddress);
    console.log(appointments);
    console.log(prescriptions);
  console.log(college1)
  return res.send( { appointments, emailaddress, prescriptions,college1 })
 }
 async  poststudenthome(req,res){
     try {
         const { email,college, password1, checkbox } = req.body;
        
 
         const specificUser = await User.findOne({ gmail: email,college:college, password: password1 });
         if (!specificUser) {
             console.log('No user found');
             const clgs =await Collage.find({}).sort({name:1})
             return res.render(path.resolve(__dirname,'../views/student/login1.ejs'),{clgs})
         }
         if (checkbox) {
             const token = jwt.sign({
                 gmail: specificUser.gmail,
                 college:specificUser.college
             }, "druva123");
             res.cookie("Uid2", token, { maxAge: 24 * 60 * 60 * 1000 });
             console.log('Token:', token);
         }
         res.cookie("userdetails", JSON.stringify({
             gmail: specificUser.gmail,
             college:specificUser.college
         }));
         const appointments = await appointment.find({
             date: {
                 $gte: new Date(),
             },
             createdy: specificUser.gmail,
         }).sort({ date: 1, time: 1 });
 
         return res.redirect('/student/home')
     } catch (error) {
         console.error('Error processing student login:', error);
         return res.status(500).send('Internal Server Error');
     }
 }
 async  poststudenthome1(req, res) {
     const { email, college1, password1, password2 } = req.body;
     console.log(college1)
     console.log(email + password1 + password2);
     const clg = await Collage.findOne({name:college1})
     const students = await User.find({college:college1})
     if(students.length>=clg.noOfStudents){
        return res.send('maximum limit for your college crossed ')
     }
     if (password1 === password2) {
         await User.create({
             gmail: email,
             college: college1,
             password: password1
         });
         const isuid = req.cookies.uid3
         const  uid3 = req.cookies.userdetails
         const {role } = JSON.parse(uid3);
         if(role=='admin' || isuid)
            return  res.redirect('/adminpatients')
       return  res.redirect('/student/login');
     } else {
         return res.send('Password does not match');
     }
 }
 

 async  getstudentschedule(req, res) {
     let emailaddress = null
     let college1
     const userDetailsCookie = req.cookies?.userdetails;
     if (userDetailsCookie) {
         const { gmail,college } = JSON.parse(userDetailsCookie);
         emailaddress = gmail;
         college1=college
     } else {
         const token = req.cookies?.Uid2;
         if (token) {
             const detoken = jwt.verify(token, "druva123");
             emailaddress = detoken.gmail;
             college1= detoken.college
         }
     }
     try {
         const result = await prescription.aggregate([
             {
                 $match: {
                     createdfor: emailaddress 
                 }
             },
             {
                 $lookup: {
                     from: 'accappointments', 
                     localField: 'bookedon',
                     foreignField: '_id',
                     as: 'appointmentDetails'
                 }
             },
             {
                 $match: {
                     appointmentDetails: { $exists: true, $ne: [] } 
                 }
             }
         ]).exec();
         const rejectedappointments = await  rejectedappointment.find({
             createdy:emailaddress
         })
         console.log(result);
         console.log(rejectedappointments)
         res.render(path.resolve(__dirname, '../views/student/schedule.ejs'), { emailaddress, result,college1,rejectedappointments });
     } catch (error) {
         console.error('Error fetching student schedule:', error);
         res.status(500).send('Internal Server Error');
     }
 }
 
 async  getstudentappoinment(req,res){
     const userDetailsCookie = req.cookies?.userdetails;
         let emailaddress;
         let clg
         if (!userDetailsCookie) {
             const token = req.cookies?.Uid2;
             console.log(token)
             const detoken = jwt.verify(token, "druva123");
             console.log(detoken)
             const gmail = detoken.gmail;
             emailaddress = gmail
             clg=detoken.college
         }
         else {
             const { gmail,college } = JSON.parse(userDetailsCookie);
             emailaddress = gmail
             clg=college
         }
     
         const specific_clg =await Collage.findOne({name:clg})
         console.log(specific_clg)
         const fields = specific_clg.fields
         console.log(fields)
     res.render(path.resolve(__dirname,'../views/student/appointment.ejs'),{emailaddress,clg,fields})
 }
 async  getstudentstudentbookings(req,res){
     try {
         const today = new Date(); 
            let emailaddress
            let clg
            let appointments,appointments1
            const userDetailsCookie = req.cookies?.userdetails;
         if (!userDetailsCookie) {
             const token = req.cookies?.Uid2;
             const detoken = jwt.verify(token, "druva123");
             const gmail = detoken.gmail;
             emailaddress=gmail
             clg=detoken.college
              appointments = await accappointment.find({
                 date: {
                     $gte: today,
                 },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
           appointments1 = await appointment.find({
                 date: {
                     $gte: today,
                 },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
         } else {
             const { gmail,college } = JSON.parse(userDetailsCookie);
             emailaddress=gmail
             clg=college
             appointments = await accappointment.find({
                 date: {
                     $gte: today,
                 },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
             appointments1 = await appointment.find({
                 date: {
                     $gte:today,
                 },
                 createdy: gmail
             }).sort({ date: 1, time: 1 });
         }
         
 
         
         res.render(path.resolve(__dirname,'../views/student/bookings.ejs'),{appointments,appointments1,emailaddress,clg})
     } catch (error) {
         console.error('Error fetching appointments:', error);
         return res.status(500).send('Internal Server Error');
     }
 }
 async  getstudentsettings(req,res){
     const userDetailsCookie = req.cookies?.userdetails;
     let emailaddress,clg;
     if (!userDetailsCookie) {
         const token = req.cookies?.Uid2;
         const detoken = jwt.verify(token, "druva123");
         const gmail = detoken.gmail;
         emailaddress = gmail
         clg=detoken.college
     }
     else {
         const { gmail,college } = JSON.parse(userDetailsCookie);
         emailaddress = gmail
         clg=college
     }
     res.render(path.resolve(__dirname,'../views/student/settings.ejs'),{emailaddress,clg})
 }
 async  poststudentappointment(req,res){
     try {
         const { date, time, field,description } = req.body;
         const token = req.cookies?.Uid2;
         const userdetails = req.cookies?.userdetails;
         
         let createdy,clg;
         if (userdetails) {
             const { gmail,college } = JSON.parse(userdetails);
             createdy = gmail;
             clg = college
         } else {
             const decodedToken = jwt.verify(token, "druva123");
             createdy = decodedToken.gmail;
             clg = decodedToken.college
         }
 
         const currentDateTime = new Date();
         const appointmentDateTime = new Date(`${date} ${time}`);
         
         if (appointmentDateTime > currentDateTime) {
             const createduser = await appointment.create({
                 date: appointmentDateTime,
                 time,
                 description,
                 createdy,
                 created:Date(),
                 field:field,
                 college:clg
 
             });
             console.log('Appointment created:', createduser);
         } else {
             console.log('Error: Appointment date and time must be in the future');
             return res.status(400).send('Appointment date and time must be in the future');
         }
 
         console.log(description);
         res.redirect("/student/appointment");
     } catch (error) {
         console.error('Error creating appointment:', error);
         res.status(500).send('Internal Server Error');
     }
 }
 async  studentcancel(req,res){
     try {
         const appointmentId = req.body.appointmentId;
         const app = await accappointment.findById(appointmentId)
        const newcan= await canappointments.create({
            date:app.date,
            time:app.time,
            description:app.description,
            createdy:app.createdy,
            created:app.created,
            field:app.field,
            college:app.college,
            acceptedby:app.acceptedby
 
         })
         await accappointment.findByIdAndDelete(appointmentId);
         const transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
                 user: 'campuscarec@gmail.com',
                 pass: 'aifq hosc uyeg expi'
             }
         });
         const mailOptions = {
             from: 'campuscarec@gmail.com',
             to: newcan.acceptedby,
             subject: 'appointment cancelled',
             text: `appointment was cancelled by student scheduled on ${newcan.date}`
         };
 
         await transporter.sendMail(mailOptions);
         res.redirect('/student/bookings');
     } catch (error) {
         console.error(error);
         res.status(500).send('Error cancelling appointment');
     }
    
 }
 async  studentcancel1(req,res){
     try {
         const appointmentId = req.body.appointmentId;
         await appointment.findByIdAndDelete(appointmentId);
         res.redirect('/student/bookings');
     } catch (error) {
         console.error(error);
         res.status(500).send('Error cancelling appointment');
     }
 }
 async  createreport(req,res){
 const reportcontent =req.body.content
 const token = req.cookies?.Uid2;
 const userdetails = req.cookies?.userdetails;
 let clg;
 let createdy;
 if (userdetails) {
     const { gmail,college } = JSON.parse(userdetails);
     createdy = gmail;
     clg=college
 } else {
     const decodedToken = jwt.verify(token, "druva123");
     createdy = decodedToken.gmail;
     clg=decodedToken.college
 
 }
 let date = new Date()
 await reportdb.create({
 report:reportcontent,createdby:createdy,createdon:date,college:clg
 })
 res.redirect('/student/settings')
 }
 async  redirectcp(req,res){
     res.render(path.resolve(__dirname,'../views/forgot1.ejs'))
 }
 async  changepassword(req, res) {
     const { password1, password2 } = req.body;
     if (password1 === password2) {
         try {
               const userDetailsCookie = req.cookies?.userdetails;
             let emailaddress;
             const { gmail } = JSON.parse(userDetailsCookie);
             emailaddress = gmail
              console.log(emailaddress)
             const user = await User.findOne({ gmail: emailaddress });
             if (!user) {
                 return res.status(404).send('User not found');
             }
             user.password = password1;
             await user.save();
             res.clearCookie('Uid1', { httpOnly: true });
             res.clearCookie('Uid2', { httpOnly: true });
             res.clearCookie('userdetails', { httpOnly: true });
             return res.redirect("/student/login");
         } catch (error) {
             console.error('Error updating password:', error);
             return res.status(500).send('Internal Server Error');
         }
     } else {
         return res.status(400).send('Passwords do not match');
     }
     
 }
 async  redirctforgetp(req,res){
     res.render(path.resolve(__dirname,'../views/forgot.ejs'))
 }
 

}


module.exports=StudentController
