let mongoose = require("mongoose");

let usertoken = mongoose.Schema({
    token: {
        type: String, 
        required: true, 
        unique: true
    }
});

let Tokenmodel = mongoose.model("usertoken", usertoken);
module.exports = Tokenmodel;
