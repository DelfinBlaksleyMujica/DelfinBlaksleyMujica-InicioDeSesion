//Conexion al servidor

const express = require("express");

//Router

const router = express.Router();

//Conexion con MiddleWares Locales

const { checkUserLogged, userNotLogged , isValidToken } = require("../middlewares/auth");


router.get("/" , checkUserLogged , ( req , res ) => {
    res.render("home" , { username: req.session.username });
} );

router.get("/perfil" , isValidToken ,  ( req , res ) => {
        res.render("profile" , { username: req.user.username })
});


router.get("/logout" , ( req , res ) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            res.redirect("/")
        } else {
            console.log("Se cerro la sesion correctamente");
            res.render("logout")
        }
    })
})

module.exports = { viewsRouter: router };