
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// 1. Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAN0_rn-dpXNFzBkKOj8eT0SboCZuEA6hU",
    authDomain: "villageconnect-f66a2.firebaseapp.com",
    projectId: "villageconnect-f66a2",
    storageBucket: "villageconnect-f66a2.firebasestorage.app",
    messagingSenderId: "326691335569",
    appId: "1:326691335569:web:66cf4e8dd8b67eff23be30",
    measurementId: "G-KY82ZB8EBR"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 3. Get HTML elements
const phoneForm = document.getElementById("phone-form");
const otpForm = document.getElementById("otp-form");

const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");

const sendOtpButton = document.getElementById("send-otp");
const verifyOtpButton = document.getElementById("verify-otp");
const backButton = document.getElementById("back-button");

const message = document.getElementById("message");

// 4. Store OTP confirmation
let confirmationResult = null;

// 5. Setup reCAPTCHA
const recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
        size: "invisible",

        callback: () => {
            console.log("reCAPTCHA verified");
        }
    }
);

// 6. Send OTP
phoneForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const phoneNumber = phoneInput.value.trim();

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        message.textContent =
            "Please enter a valid 10-digit mobile number.";
        return;
    }

    const fullPhoneNumber = "+91" + phoneNumber;

    try {

        sendOtpButton.disabled = true;
        message.textContent = "Sending OTP...";

        confirmationResult = await signInWithPhoneNumber(
            auth,
            fullPhoneNumber,
            recaptchaVerifier
        );

        message.textContent =
            "OTP sent successfully! Please check your mobile.";

        phoneForm.hidden = true;
        otpForm.hidden = false;

    } catch (error) {

        console.error(error);

        message.textContent = error.message;

    } finally {

        sendOtpButton.disabled = false;

    }

});

// 7. Verify OTP
otpForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const otp = otpInput.value.trim();

    if (!/^\d{6}$/.test(otp)) {
        message.textContent =
            "Please enter a valid 6-digit OTP.";
        return;
    }

    if (!confirmationResult) {
        message.textContent =
            "Please request an OTP first.";
        return;
    }

    try {

        verifyOtpButton.disabled = true;
        message.textContent = "Verifying OTP...";

        const result = await confirmationResult.confirm(otp);

        const user = result.user;

        message.textContent =
            "Login successful! Welcome to VillageConnect.";

        console.log("Logged in user:", user);

        // Next, we will open the attendance dashboard here.
        window.location.href = "attendance.html";

    } catch (error) {

        console.error(error);

        message.textContent =
            "Invalid OTP. Please check the code and try again.";

    } finally {

        verifyOtpButton.disabled = false;

    }

});

// 8. Change mobile number
backButton.addEventListener("click", () => {

    otpForm.hidden = true;
    phoneForm.hidden = false;

    otpInput.value = "";
    message.textContent = "";

    confirmationResult = null;

});
