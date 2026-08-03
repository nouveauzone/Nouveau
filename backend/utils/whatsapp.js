const axios = require("axios");

const INTERAKT_ENDPOINT = "https://api.interakt.ai/v1/public/message/";

const normalizeIndianPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(-10);
};

const sendOrderConfirmation = async (phone, name, orderId, deliveryDate) => {
  try {
    const apiKey = String(process.env.INTERAKT_API_KEY || "").trim();
    if (!apiKey) {
      console.error("WhatsApp error: INTERAKT_API_KEY is missing");
      return;
    }

    const phoneNumber = normalizeIndianPhone(phone);
    if (!phoneNumber || phoneNumber.length !== 10) {
      console.error("WhatsApp error: invalid phone number", phone);
      return;
    }

    await axios.post(
      INTERAKT_ENDPOINT,
      {
        countryCode: "+91",
        phoneNumber,
        callbackData: "order_confirmation",
        type: "Template",
        template: {
          name: "order_confirmation_nouveau",
          languageCode: "en",
          bodyValues: [
            String(name || "Customer"),
            String(orderId || ""),
            String(deliveryDate || "3-5 working days"),
          ],
        },
      },
      {
        headers: {
          Authorization: `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent to", phoneNumber);
  } catch (error) {
    const apiError = error?.response?.data || error?.response?.statusText || error.message;
    console.error("WhatsApp error:", apiError);
    return { success: false, error: apiError };
  }
};

module.exports = {
  sendOrderConfirmation,
  normalizeIndianPhone,
};
