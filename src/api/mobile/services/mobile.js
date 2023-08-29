"use strict";

/**
 * mobile service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::mobile.mobile", ({ strapi }) => ({
  sendSms: async (mobileNumber, otp) => {
    const data = JSON.stringify({
      bodyId: 69431,
      to: mobileNumber,
      args: [otp],
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length.toString(),
      },
      body: data,
    };

    const apiUrl =
      "https://console.melipayamak.com/api/send/shared/4fb06b642a0f4d70bef04d40ff82ddc2";

    try {
      const response = await fetch(apiUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(responseData);
      return parseInt(response.status);
    } catch (error) {
      console.error(error);
    }
  },
}));
