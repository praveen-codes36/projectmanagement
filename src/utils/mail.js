import Mailgen from "mailgen";

const emailVerificationMailgenContent = (username,verificationUrl) =>{
    return {
        body:{
            name:username,
            intro:"Welcome to our App! we'are excited to have you on board.",
            action:{
                instructions:"TO verifiy your email please click on the following button",
                botton:{
                    color:"rgb(29, 229, 69)",
                    text:"Verify you email",
                    link:verificationUrl,
                },
            },
            outro:"Need help,or have questions? Just reply to this email,we'd love to help.",
        },
    };
};

import Mailgen from "mailgen";

const forgetPasswordMailgenContent = (username,passwordResetUrl) =>{
    return {
        body:{
            name:username,
            intro:"We got a request to reset the passwrd of your account.",
            action:{
                instructions:"To reset your password please click on the following button",
                botton:{
                    color:"rgb(186, 229, 29)",
                    text:"Verify you email",
                    link:passwordResetUrl,
                },
            },
            outro:"Need help,or have questions? Just reply to this email,we'd love to help.",
        },
    };
};

export{
    emailVerificationMailgenContent,
    forgetPasswordMailgenContent
}