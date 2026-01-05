const {
  loginWithEmail,
  loginWithMobile,
  forgetPassword,
  register,
  verifyOtp,
  resendOtp
} = require("../controllers/user");

const { registerValidator , verifyValidator, resendValidator} = require("../middleware/validator");

const router = require("express").Router();

router.post("/register", registerValidator, register);
router.post("/login/email", loginWithEmail);
router.post("/login/mobile", loginWithMobile);
router.post("/forgetpassword", forgetPassword);
router.post("/verifyotp",verifyValidator, verifyOtp);
router.post("/resendotp", resendValidator, resendOtp);

module.exports = router;
