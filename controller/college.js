const path = require('path')
const admin = require('../model/admin')
const College = require('../model/college')
class Collegehandler{
    constructor(){
       
    }
    async rendersignup(req,res){
        return res.render(path.resolve(__dirname,'../views/clglogin.ejs'))

    }
    async register(req,res){
        
            const { collegename , Students , Doctors ,specialistsArray , email , pswrd,confirm_pswrd,domain} = req.body;
            const specialists = JSON.parse(specialistsArray);
            if(pswrd!=confirm_pswrd)
                return res.send('password mismatch')
            return res.render(path.resolve(__dirname,'../views/plan.ejs'),{collegename , Students , Doctors ,specialists , email , pswrd,domain})
        }
        async subscribe(req,res){
            const{clgname,students,doctors,fields,email,pswrd,plan,domain} = req.body
            let amount,time
            if(plan=="3-months"){
                amount = 200*students + 400*doctors
                time = new Date().setDate(3*30) 
            }

            else if(plan=='6-months'){
                amount = 2*(180*students + 360*doctors)
                time = new Date().setDate(6*30) 
            }
            else{
                amount = 4*(160*students + 320*doctors)
                time = new Date().setDate(12*30) 
            }

            const newcollege =await  College.create({
                name:clgname,
                noOfStudents:students,
                noOfDoctors:doctors,
                fields:fields,
                amount:amount,
                plan:time,
                domain:domain

            })
            const newadmin = await admin.create({
                email:email,
                password1:pswrd,
                college:clgname
            })
            return res.redirect('/suser/college')
        }
    
}

module.exports = Collegehandler