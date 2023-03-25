//Conexion a Mongoose para poder armar los esquemas

const mongoose = require("mongoose");

//Coleccion creada dentro de la DB de Mongo Atlas

const userCollection = "usuarios";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const UserModel = mongoose.model( userCollection , userSchema );

module.exports = { UserModel };