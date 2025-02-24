
import ApiResponse from "@/types/ApiResponse";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import React from "react";
import VerificationEmail from "../../emails/verificationEmail";


export const sendVerificationEmail = async(email:string,username:string,verifyCode:string):Promise<ApiResponse>=>{
 

    try {
        
        // console.log(
        //     "verification email credentials ",
        //     process.env.EMAIL_USER,
        //     process.env.EMAIL_PASSWORD
        //   );
          const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
          const emailHtml = await render(
            React.createElement(VerificationEmail, { username, otp: verifyCode })
          );
      
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verification Code | Mystery Message ",
            html: emailHtml,
          };
      
          const info = await transporter.sendMail(mailOptions);
          console.log(
            "Verification code sent successfully, code sent to ",
            info.response
          );
      
          return { success: true, message: "verification code sent successfully" };

    } catch (error) {
        console.error('error occured while sending verification email ',error);
        return{
            success:false,
            message:"status : error occured while sending verification email"
        }
    }

}