import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_SECRET_KEY;

const encrypt = (payload) => {
  const derived_key = CryptoJS.enc.Base64.parse(secretKey);
  const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV);
  const encryptionOptions = {
    iv: iv,
    mode: CryptoJS.mode.CBC,
  };

  const encrypted = CryptoJS.AES.encrypt(
    payload,
    derived_key,
    encryptionOptions
  ).toString();

  return encrypted;
};

export default encrypt;
