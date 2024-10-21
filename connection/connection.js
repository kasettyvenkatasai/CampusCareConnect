const mongoose = require('mongoose');
async function connect(url){
    mongoose.connect(url).then(() => {
        console.log('MongoDB connected ');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
}
module.exports=connect