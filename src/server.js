//Conexion de Servidor

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen( PORT , () => {
    console.log( `Server listening on port ${ server.address().port }` );
});
server.on( "error" , error => console.log(`Error en el servidor: ${error}` ) );

//Conexion con routers

const { viewsRouter } = require("./routes/viewsRouter");
const { AuthRouter } = require("./routes/auth.routes");

//Conexion de Sessions

const session = require("express-session");
const cookieParser = require("cookie-parser");

//Motor de plantilla

const handlebars = require("express-handlebars");
app.engine("handlebars" , handlebars.engine() );
app.set( "views" , __dirname+"/views" );
app.set("view engine" , "handlebars" );

//Interpretacion de formatos

app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

//Servicio estaticos

app.use( express.static( __dirname+"/public" ) );

//Conexion con Middleware de Autenticacion Passport

const passport = require("passport");

//Conexion con Base de datos 

const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const { options } = require("./config/options");


//Conexion con mongoose

mongoose.connect( options.mongoDB.url , {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then( () => {
    console.log("Base de datos conectada exitosamente!!");
});

//Configuracion de la session

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: options.mongoDB.url,
        ttl:600
    }),
    secret: "claveSecretaParaEntregaDeLogIn",
    resave: true,
    saveUninitialized: true
}));

//Configuracion de Passport

app.use( passport.initialize() );
app.use( passport.session() );

//Routes

app.use( viewsRouter );
app.use( AuthRouter );

