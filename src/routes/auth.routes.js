//Conexion con express y Router

const Router = require("express").Router;

//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken } = require("../middlewares/auth");

//Conexion con Passport

const passport = require("passport");

//Conexion con Estrategias de Passport

const LocalStrategy = require("passport-local").Strategy;

//Conexion con JWT

const jwt = require("jsonwebtoken");

//Conexion con bycrypt

const bcrypt = require("bcrypt");
const salt = 10;

//Models

const { UserModel } = require("../models/user.models");

//Router

const router = Router();

//Serializacion

passport.serializeUser( ( user , done ) => {
    return done( null , user.id)
});

//Deserialializacion

passport.deserializeUser( ( id , done ) => {
    UserModel.findById( id , ( err , userDB) => {
        return done( err , userDB );
    })
});

//Estrategia para registrar usuarios

passport.use( "signupStrategy" , new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField:"email"
    },
    ( req , username , password , done ) => {
        console.log( "body" , req.body );
        //Verifico si el usuario ya existe en la DB
        UserModel.findOne({ username: username} , async ( err , userDB ) => {
            if(err) return done(err , false , { message: `Hubo un error al buscar el usuario ${err}`});
            if(userDB) return done( null , false , { message: "El usuario ya existe" } );
            //Si el usuario no existe lo creo en la DB
            const hashPassword = await bcrypt.hash( password , salt );
            const newUser = {
                name: req.body.name,
                username: username,
                password: hashPassword
            };
            UserModel.create( newUser , ( err , userCreated ) => {
                if(err) return done( err , false , { message: "Hubo un error al crear el usuario" } )
                return done( null , false, { message: "Usuario creado" } );
            })
        })
    } 
));


passport.use("loginStrategy" , new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField: "username"
    },
    ( req ,username , password , done ) => {
        UserModel.findOne( { username: username } , async ( err , userDB ) => {
            if( err ) return done( err , false , { message: `Hubo un error al buscar el usuario ${err}`});
            if( !userDB ) return done( null , false , { message: "El usuario no esta registrado" } );
            const validPassword = await bcrypt.compare( password , userDB.password );
            if ( validPassword === false ) return done( err , false , { message: "El usuario y la contraseña no coinciden con un usuario registrado"} );
            req.session.username = username;
            return done( null , userDB , { message: "El usuario esta ok"})
        })
    }
))

//Endpoints

/*GET*/

router.get("/registro" , userNotLogged , ( req , res ) => {
    const errorMsg = req.session.messages ? req.session.messages[0] : "";
    res.render( "signup" , { error: errorMsg } );
    req.session.messages = [];
});

router.get("/inicio-de-sesion"  , userNotLogged , ( req , res ) => {
    res.render("login");
});

router.get("/login" , userNotLogged , ( req , res ) => {
    const errorMsg = req.session.messages ? req.session.messages[0] : "";
    res.render( "login" , { error: errorMsg } );
    req.session.messages = [];
});


/*POST*/

router.post("/signup" , passport.authenticate("signupStrategy" , {
    failureRedirect: "/registro",
    failureMessage: true
}),( req , res ) => {
    res.redirect("/inicio-de-sesion");
});

router.post("/login" , passport.authenticate("loginStrategy" , {
    failureRedirect: "/login",
    failureMessage: true
}) , ( req , res ) => {
    const { username  } = req.body;
    jwt.sign({ username: username } , "claveToken" , { expiresIn:"7d"} , ( error , token ) => {
        req.session.acces_token = token;
    })
    res.render("home" , { username: username });
})



/*router.post("/login" , async ( req , res ) => {
    try {
        const { username , password } = req.body;
        req.session.username = username;
        const user = await UserModel.findOne( { username: username } );
        console.log(user);
        if ( !user ) {
            return res.status(401).send( { message: "Invalid username" } ); 
        }
        const validPassword = await bcrypt.compare( password , user.password );
        if (!validPassword) {
            return res.status(401).send({ message: "Invalid password"})
        }
        
        jwt.sign({ username: user.username } , "claveToken" , { expiresIn:"30" } , ( error , token ) => {
            console.log(token);
            return res.render("home");
        });
        } catch (error) {
        res.status(500).send( { message: error.message } );
    }
});*/


module.exports = { AuthRouter: router };