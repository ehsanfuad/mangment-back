"use strict";

/**
 * mobile controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::mobile.mobile", ({ strapi }) => ({
  getMobile: async (ctx, next) => {
    //1-get mobile number from client
    const mobileNumber = ctx.request.body.data.mobileNumber;
    //make random 4 digits number
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    //2-find mobile number on database
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        // select: ['title', 'description'],
        where: { username: mobileNumber },
        // populate: { category: true },
      });

    //3-if user exist
    if (user) {
      //call sms service and pass otp and mobile number to it
      const statusCode = await strapi
        .service("api::mobile.mobile")
        .sendSms(mobileNumber, otp);
      //if status was bigger or equal to 200 and less than 300
      if (statusCode >= 200 || statusCode < 300) {
        //update user otp filed with otp that has been created
        const updatedUser = await strapi.db
          .query("plugin::users-permissions.user")
          .update({
            where: { username: mobileNumber },
            data: {
              otp: otp,
            },
          });
        return updatedUser;
      }
    } else {
      //user dosent exist
      //call sms servive and pass otp and mobile number to it
      const statusCode = await strapi
        .service("api::mobile.mobile")
        .sendSms(mobileNumber, otp);
      //if status was bigger or equal to 200 and less than 300
      if (statusCode >= 200 || statusCode < 300) {
        //save mobile and otp code to collection
        const entry = await strapi.db.query("api::mobile.mobile").create({
          data: {
            mobile: mobileNumber,
            otp: otp,
          },
        });
        return entry;
      }
    }
  },
  getOtp: async (ctx, next) => {
    //get otp and mobile
    const { otp, mobileNumber } = ctx.request.body.data;
    //check mobile collection mobile and otp
    const mobileIsExist = await strapi.db.query("api::mobile.mobile").findOne({
      where: { mobile: mobileNumber, otp: otp },
    });
    //if mobile is exist in mobile collection
    if (mobileIsExist) {
      //register user with mobile statick password fake email
      const user = await strapi
        .service("api::mobile.mobile")
        .register(mobileNumber);
      //delete all mobile records
      await strapi.db.query("api::mobile.mobile").deleteMany({
        where: { mobile: mobileNumber },
      });
      //send user to client
      // const jwt = user.jwt;
      return user;
    } else {
      //if dosent exist
      //get user with mobile
      const foundUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          // select: ['title', 'description'],
          where: { username: mobileNumber },
          // populate: { category: true },
        });
      //check otp with user otp
      const userOtp = foundUser.otp;
      if (userOtp === otp) {
        //if are the same
        //login user with username(mobile) and static password
        const loginUser = await strapi
          .service("api::mobile.mobile")
          .login(mobileNumber);
        return loginUser;
      }
    }
  },
}));
