"use strict";

/**
 * mobile controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::mobile.mobile", ({ strapi }) => ({
  getMobile: async (ctx, next) => {
    //1-get mobile number from client
    const mobileNumber = ctx.request.body.data.mobileNumber;
    //2-find mobile number on database
    //make random 4 digits number
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
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
  getOtp: async (ctx, next) => {},
}));
