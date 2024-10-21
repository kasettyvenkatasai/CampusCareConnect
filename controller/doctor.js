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
const Prescription = require('../model/medication');
const College = require('../model/college')
const rejappointment = require('../model/rejectedappointments')
const canappointments = require('../model/cancelledapp')
class Doctorhandler{
    constructor(){}
    async  renderdocsignup(req,res){
        const clgs = await College.find({})
        return res.render(path.resolve(__dirname,'../views/doctor/signup.ejs'),{clgs})
    }
    async  renderdoctorlogin(req,res){
        const clgs =await College.find({})
        console.log(clgs)
        res.render(path.resolve(__dirname,'../views/doctor/login.ejs'),{clgs});
    }
    async  postdoctorhome(req,res){
        try {
            let createdy,clg
            const { email, password1,college, checkbox } = req.body;
            const specificUser = await Doctor.findOne({ gmail: email, password: password1,college:college });
            if (!specificUser) {
                console.log('No user found');
                const clgs =await College.find({})
        console.log(clgs)
                return res.render(path.resolve(__dirname,'../views/doctor/login.ejs'),{clgs});
            }
            if (checkbox) {
                const token = jwt.sign({
                  gmail: specificUser.gmail,
                    password: specificUser.password,
                    clg:specificUser.college
                }, "druva123");
                createdy=specificUser.gmail
                clg=specificUser.college
                res.cookie("Uid1", token,{maxAge: 24 * 60 * 60 * 1000});
            }
            res.cookie("userdetails", JSON.stringify({
            
                gmail: specificUser.gmail,
                college:specificUser.college
            }));
           createdy=specificUser.gmail
           clg=specificUser.college
           
           const appointments = await accappointment.find({
            date: {
                $gte: new Date(),
            },
        }).sort({ date: 1, time: 1 });
        let gmail1 = createdy
      
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const today_appointments = await accappointment.find({
            date: {
                $gte: new Date(), 
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
            }
        }).sort({ date: 1, time: 1 });
        
return res.redirect('/doctor/home')
           
           
        
        } catch (error) {
            console.error('Error processing doctor login:', error);
            return res.status(500).send('Internal Server Error');
        }
    
    
    }
    async  postdoctorhome1(req,res){
        const {email,password,college,field}=req.body
        console.log(email+password+field+college)
       let college1 = college 
        const curclg = await College.findOne({name:college1})
        const clgdocs= await Doctor.find({college:college1})
        console.log(clgdocs.length)
        console.log(curclg.noOfDoctors)
        if(clgdocs.length<curclg.noOfDoctors){
            await Doctor.create({
                gmail:email,
                password:password,
                college:college,
                fields:field
            })
            console.log('excecuted')
           return res.redirect('/admindoctor')
        }
        else{
            res.send('maximum limit reached try to contact administator')
        }
            
        
        
    }
    async  getdoctorhome(req,res){
        const appointments = await accappointment.find({
            date: {
                $gte: new Date(),
            },
        }).sort({ date: 1, time: 1 });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const token = req.cookies?.Uid1;
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
        
        const today_appointments = await accappointment.find({
            date: {
                $gte: new Date(), 
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
            }
        }).sort({ date: 1, time: 1 });
         return    res.render(path.resolve(__dirname,"../views/doctor/doctor_home.ejs"), { appointments,today_appointments, createdy,clg });
    
        
    }
    async getdoctorhomedetails(req,res){
        const appointments = await accappointment.find({
            date: {
                $gte: new Date(),
            },
        }).sort({ date: 1, time: 1 });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const token = req.cookies?.Uid1;
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
        
        const today_appointments = await accappointment.find({
            date: {
                $gte: new Date(), 
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
            }
        }).sort({ date: 1, time: 1 });
        return res.send( {appointments,today_appointments, createdy,clg})
    }
    
    async  getdoctorschedulesessions(req,res){
        const token = req.cookies?.Uid1;
    const userdetails = req.cookies?.userdetails;
    
    let createdy,clg;
    if (userdetails) {
        const { gmail,college } = JSON.parse(userdetails);
        createdy = gmail;
        clg=college
    } else {
        const decodedToken = jwt.verify(token, "druva123");
        createdy = decodedToken.gmail;
        clg = decodedToken.college
    }
    const currentdoc = await Doctor.findOne({gmail:createdy})
    const field1 = currentdoc.fields
        const appointments = await appointment.find({
            date: {
                $gte: new Date(),
    
            },
            field:field1,
            college:currentdoc.college
    
        }).sort({ date: 1, time: 1 });
        const canapp = await canappointments.find({acceptedby:currentdoc.gmail})
        console.log(appointments)
        res.render(path.resolve(__dirname,'../views/doctor/Doctor_SS.ejs') ,{appointments,createdy,clg,canapp})
    }
    async  getdoctorschedule(req,res){
        const token = req.cookies?.Uid1;
    const userdetails = req.cookies?.userdetails;
    
    let createdy,clg;
    if (userdetails) {
        const { gmail,college } = JSON.parse(userdetails);
        createdy = gmail;
        clg=college
    } else {
        const decodedToken = jwt.verify(token, "druva123");
        createdy = decodedToken.gmail;
        clg = decodedToken.clg;
    }
    const doc = await Doctor.findOne({gmail:createdy})
    console.log(doc)
    console.log(clg +' '+doc.gmail+' '+doc.fields)
        const appointments = await accappointment.find({
            date: {
                $gte: new Date(),
            },
            college:clg,
            field:doc.fields,
            acceptedby:doc.gmail
    
        }).sort({ date: 1, time: 1 });
        console.log(appointments)
        const canapp = await canappointments.find({acceptedby:doc.gmail})
        console.log(appointments)
        res.render(path.resolve(__dirname,'../views/doctor/doctor_schedule.ejs'),{appointments,createdy,clg,canapp})
    }
    async  getdoctorsettings(req,res){
        const token = req.cookies?.Uid1;
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
        res.render(path.resolve(__dirname,'../views/doctor/doctor_settings.ejs'),{createdy,clg})
    }
    async  getdoctorpatients(req,res){
        const token = req.cookies?.Uid1;
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
        const today = new Date();
    const appointments = await accappointment.aggregate([
        { $match: { date: { $lt: today } ,acceptedby:createdy} },
        { $sort: { created: -1 } },
        {
            $group: {
                _id: "$createdy",
                latestAppointment: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$latestAppointment" } },
        
    ]);
    
        res.render(path.resolve(__dirname,"../views/doctor/patients.ejs"),{appointments,createdy,clg})
    }
    async  postdocotorcancel(req,res){
        try {
           
            const {id,acceptedby }= req.body;
            const person = await accappointment.findById(id);
            
            if (!person) {
                return res.status(404).send('Appointment not found');
            }
    
            const rejappointmentEntry = new rejappointment({
                date: person.date,
                time: person.time,
                description: person.description,
                createdy: person.createdy,
                created: person.created,
                field: person.field,
                college: person.college,
                rejectedby: acceptedby,  
                rejectedat: new Date() 
            });
    
            // Save the new rejected appointment
            await rejappointmentEntry.save();
    
            // Step 3: Delete the original appointment
            await accappointment.findByIdAndDelete(id);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'campuscarec@gmail.com',
                    pass: 'aifq hosc uyeg expi'
                }
            });
            const mailOptions = {
                from: 'campuscarec@gmail.com',
                to: rejappointmentEntry.createdy,
                subject: 'Sorry!! Your appointment cancelled',
                text: `Your appointment was cancelled unfortunately`
            };
    
            await transporter.sendMail(mailOptions);
    
            // Step 4: Redirect after the operation
           return res.redirect('/doctor/schedule');
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
      
        res.redirect('/doctor/schedule')
    }
    async  selectfield(req,res){
        const {email,password1,password2,college}=req.body
        const d = email.split('@')[1]
        console.log(email+password1+password2+college)
       console.log()
        const clg = await College.findOne({name:college})
        if(d!=clg.domain){
            return res.send('please use college main with a domian ' + clg.domain)
        }
        if(password1 == password2){
            const clgs = clg.fields
            console.log(clgs)
            res.render(path.resolve(__dirname,'../views/doctor/fields.ejs'),{clgs,email,password1,college})
        }
        else{
            return res.send('passwords ddoesnot match')
        }
    }
       
    
    async  accpectorreject(req,res){
        const action = req.body.action;
        const id = req.body.hidbut;
        const doc= req.body.hidbut2
        const doctor = await Doctor.findOne({gmail:doc})
        try {
            if (action === "accept") {
                const appointmentToAccept = await appointment.findById(id);
                if (!appointmentToAccept) {
                    return res.status(404).send('Appointment not found');
                }
                const acceptedAppointment = await accappointment.create({
                    date: appointmentToAccept.date,
                    time: appointmentToAccept.time,
                    description: appointmentToAccept.description,
                    createdy: appointmentToAccept.createdy,
                    created: appointmentToAccept.created,
                    college:doctor.college,
                    field:doctor.fields,
                    acceptedby:doc,
                });
                const deletedAppointment = await appointment.findByIdAndDelete(id);
                if (!deletedAppointment) {
                    return res.status(404).send('Appointment not found');
                }
                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'campuscarec@gmail.com',
                        pass: 'aifq hosc uyeg expi'
                    }
                });
                const mailOptions = {
                    from: 'campuscarec@gmail.com',
                    to: acceptedAppointment.createdy,
                    subject: 'Accepeted appointment',
                    text: `Your appointment  which was scheduled on ${acceptedAppointment.date}was accepeted `
                };
        
                await transporter.sendMail(mailOptions);
                console.log('email sent succesfully ' +acceptedAppointment.createdy)
               return res.redirect("/doctor/schedule_sessions")
                res.send('Appointment accepted successfully.');
            } else {
                const appointmentToAccept = await appointment.findById(id);
                
                const rejectedappointment = await rejappointment.create({
                    date: appointmentToAccept.date,
                    time: appointmentToAccept.time,
                    description: appointmentToAccept.description,
                    createdy: appointmentToAccept.createdy,
                    created: appointmentToAccept.created,
                    college:doctor.college,
                    field:doctor.fields,
                    rejectedby:doc,
                    rejectedat:new Date()
                   
                })
                const deletedAppointment = await appointment.findByIdAndDelete(id);
                if (!deletedAppointment) {
                    return res.status(404).send('Appointment not found');
                }
                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'campuscarec@gmail.com',
                        pass: 'aifq hosc uyeg expi'
                    }
                });
                const mailOptions = {
                    from: 'campuscarec@gmail.com',
                    to: rejectedappointment.createdy,
                    subject: 'Rejected appointment',
                    text: `Your Appointment which was scheduled on ${rejectedappointment.date} was rejected`
                };
        
                await transporter.sendMail(mailOptions);
              return   res.redirect("/doctor/schedule_sessions")
            }
            res.redirect("/doctor/schedule_sessions")
        } catch (error) {
            console.error('Error:', error);
            
        }
    
    }
    async  redirectforget(req,res){
        res.render(path.resolve(__dirname,'../views/forgot2.ejs'))
    }
    async  changepassword1(req, res) {
        const { password1, password2 } = req.body;
        if (password1 === password2) {
            let createdy;
            try {
                const userDetailsCookie = req.cookies?.userdetails;
              let emailaddress;
              const { gmail } = JSON.parse(userDetailsCookie);
              emailaddress = gmail
               console.log(emailaddress)
              const user = await Doctor.findOne({ gmail: emailaddress });
              if (!user) {
                  return res.status(404).send('User not found');
              }
              user.password = password1;
              await user.save();
              
              return res.redirect("/doctor/login");
            } catch (error) {
                console.error('Error updating password:', error);
                return res.status(500).send('Internal Server Error');
            }
        } else {
            return res.status(400).send('Passwords do not match');
        }
    }
    async  deletecookies(req,res){
        res.clearCookie('Uid1',{httpOnly:true})
         res.clearCookie('Uid2',{httpOnly:true})
        res.clearCookie('userdetails',{httpOnly:true})
        res.redirect("/")
    }
    async  createreport1(req,res){
        const reportcontent =req.body.content
        const token = req.cookies?.Uid1;
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
        let date = new Date()
        await reportdb.create({
        report:reportcontent,createdby:createdy,createdon:date,college:clg
        })
        res.redirect('/doctor/settings')
        }
    
        async  redirectforgetdocotr(req,res){
            res.render(path.resolve(__dirname,'../views/doctorforget.ejs'))
        }
    
        generateOTP = () => {
            return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        }
    
        // Arrow function to send OTP via email
        sendOTP = async (email, otp) => {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'campuscarec@gmail.com',
                        pass: 'aifq hosc uyeg expi'
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
    
        // Arrow function for OTP request
        requestotp1 = async (req, res) => {
            const { email } = req.body;
            console.log(email);
    
            try {
                const user = await Doctor.findOne({ gmail: email });
                if (!user) {
                    return res.status(404).send('User not found');
                }
    
                // Call the generateOTP method using this
                const otp = this.generateOTP();  // Correct usage of this
    
                user.otp = otp;
                await user.save();
    
                // Call the sendOTP method using this
                await this.sendOTP(email, otp);  // Correct usage of this
                
                res.render(path.resolve(__dirname, '../views/doctor/verfiyotp.ejs'));
            } catch (error) {
                console.error('Error sending OTP:', error);
                res.status(500).send('Failed to send OTP');
            }
        }
    
        async  verifyotpdoctor(req,res){
            const { email, otp } = req.body;
            let gmail1 = email
            const user = await Doctor.findOne({ gmail: email });
            console.log(user.otp)
            console.log(otp)
            if (!user || !user.otp || user.otp !== otp) {
                return res.status(401).send('Invalid OTP');
            }
            user.otp = null;
           res.cookie('userdetails',JSON.stringify({"gmail":email}))
           res.redirect('/changepassword1')
        }
        async  createprescription(req, res) {
            const { startDate, endDate, createdby, sno1, sno2, medicine1, medicine2, timings1, timings2, bookedon } = req.body;
        
            try {
                const trimmedBookedOn = bookedon.trim();
                const today = new Date();
                await Prescription.create({
                    createdfor: createdby,
                    sno1,
                    sno2,
                    medication1: medicine1,
                    medication2: medicine2,
                    timings1,
                    timings2,
                    createdon: today,
                    bookedon: trimmedBookedOn 
                });
        
                res.redirect('/doctor/patients');
            } catch (error) {
                console.error('Error creating prescription:', error);
                res.status(500).send('Internal Server Error');
            }
        }
        
        
        
}

    
    
    
module.exports=Doctorhandler