let mongoose = require("mongoose");

let userdata=mongoose.Schema({
   username: {
    type: String,
    required: true,
    unique: true,
    match: /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, // at least one number & special char
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
});

let Appmodel = mongoose.model("userinfo",userdata)
module.exports = Appmodel ;