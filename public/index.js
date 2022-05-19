// Cookies
const darkMode = document.querySelector("#dark-mode");
const modeLogo = document.querySelector("#mode-logo");
const modeText = document.querySelector("#mode-text");
const cookieStyle = document.querySelector(".simple-cookie-consent");
const cookieModel = document.querySelector(".cookie-consent-container")
const cancelButton = document.querySelector(".cookie-consent-deny")
const acceptButton = document.querySelector(".cookie-consent-allow");
const model = require("../models/skiEquipmentModelMysql");
var click = 0;


function slide() {
    let menu = document.getElementById("menu");

    if (menu.style.top == "5rem") {
        menu.style.top = "-15rem";
    }
    else {
        menu.style.top = "5rem";
    }
}

function hamburger() {
    let hamburger = document.getElementById("hamburger");

    if (hamburger.className == "open") {
        hamburger.className = "";
    }
    else {
        hamburger.className = "open";
    }
}


function toggleMode() {
    document.body.classList.toggle("light-mode-variables");
    if (modeLogo.innerHTML == "light_mode") {
        modeLogo.innerHTML = "mode_night";
        modeText.innerHTML = "Dark Mode";
        document.cookie = "isDark=true; path=/;";
    }
    else {
        modeLogo.innerHTML = "light_mode";
        modeText.innerHTML = "Light Mode";
        document.cookie = "isDark=false; path=/;";
    }
}

darkMode.addEventListener("click", () => {
    toggleMode();

})

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

if (getCookie("isDark") == "true") {
    toggleMode();
}

// Signup Form

// Symbols
const bad = "❗";
const good = "✅";

//username
const username = document.querySelector(".uInput");
const un = document.querySelector(".un");

username.addEventListener('input', () => {
    checkUsername();
});

// // Names
const firstName = document.querySelector(".fnInput");
const lastName = document.querySelector(".lnInput");

const fn = document.querySelector(".fn");
const ln = document.querySelector(".ln");

// Event Listener first name
firstName.addEventListener("input", () => {
    checkFirstName();
})

// Event Listener last name
lastName.addEventListener("input", () => {
    checkLastName();
})

// Password
const password = document.querySelector(".pInput");
const confirmPassword = document.querySelector(".cpInput");

const eigth = document.querySelector(".min8");
const number = document.querySelector(".num");
const uppercase = document.querySelector(".up");
const lowercase = document.querySelector(".down");
const symbol = document.querySelector(".sym");
const match = document.querySelector(".match");

// Event Listener password
password.addEventListener('input', () => {
    checkPassword();
});

// Event Listener confirm password
confirmPassword.addEventListener('input', () => {
    checkConfirmPassword();
});

/**
 * Checks that a string is alpha
 * @param {*} str The string to check
 * @returns true if the string is alpha, false otherwise
 */
function onlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

/**
 * Checks that the username is alphanumeric
 * Displays the result as the username is being typed
 */
function checkUsername() {
    if (username.value.match(/^[0-9a-zA-Z]+$/)) {
        un.innerHTML = good;
    }
    else {
        un.innerHTML = bad;
    }
}

/**
 * Checks that the first name is alpha
 * Displays the result as the first name is being typed
 */
function checkFirstName() {
    if (onlyLetters(firstName.value)) {
        fn.innerHTML = good;
    }
    else {
        fn.innerHTML = bad;
    }
}

/**
 * Checks that the last name is alpha
 * Displays the result as the last name is being typed
 */
function checkLastName() {
    if (onlyLetters(lastName.value)) {
        ln.innerHTML = good;
    }
    else {
        ln.innerHTML = bad;
    }
}

/**
 * Checks that the password meets the requirements to be strong
 * Displays the result as the password is being typed
 */
function checkPassword() {
    // Length
    if (password.value.length >= 8) {
        eigth.innerHTML = good;
    }
    else {
        eigth.innerHTML = bad;
    }

    // Number
    if (password.value.match(/\d/g)) {
        number.innerHTML = good;
    }
    else {
        number.innerHTML = bad;
    }

    // Uppercase
    if (password.value.match(/[A-Z]/g)) {
        uppercase.innerHTML = good;
    }
    else {
        uppercase.innerHTML = bad;
    }

    // Lowercase
    if (password.value.match(/[a-z]/g)) {
        lowercase.innerHTML = good;
    }
    else {
        lowercase.innerHTML = bad;
    }

    // Symbol
    if (password.value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g)) {
        symbol.innerHTML = good;
    }
    else {
        symbol.innerHTML = bad;
    }

    // Matching password
    if (password.value == confirmPassword.value) {
        match.innerHTML = good;
    }
    else {
        match.innerHTML = bad;
    }
}

/**
 * Checks that the confirm password matches the password
 * Displays the result as the confirm password is being typed
 */
function checkConfirmPassword() {
    // Matching password
    if (password.value == confirmPassword.value) {
        match.innerHTML = good;
    }
    else {
        match.innerHTML = bad;
    }
}

// On load, refresh all the checks in case a failed signup was made and fields have information in them
window.onload = function () {
    checkUsername();
    checkFirstName();
    checkLastName();
    checkPassword();
    checkConfirmPassword();
}

    // FORM emailJs


    /***
     * Made to send mails through a server 
     * This makes it easier since it will have template to send mails
     * 
     */
    (function () {
        // https://dashboard.emailjs.com/admin/account
        emailjs.init('erahkk0th3Z3BKcn9');
    })();

/**
 * Listens for the submit, and then sends a server request for it to be sent to the 
 * email address provided
 * 
 */
window.onload = function () {
    document.getElementById('contact-form').addEventListener('submit', function (event) {

        event.preventDefault();
        const name = document.getElementById('nameCon').value;
        const fromName = document.getElementById('fromNameCon').value;
        const message = document.getElementById('messageCon').value;
        if (name == "" || fromName == "" || message == ""
            || name == null || fromName == null || message == null) {
            alert("Please fill all the fields");
            return false;
        }
        else {

            // generate a five digit number for the contact_number variable
            this.contact_number.value = Math.random() * 100000 | 0;
            // these IDs from the previous steps
            emailjs.sendForm('service_mksrijc', 'template_y5kbr8g', this)
                .then(function () {
                    console.log('SUCCESS!');
                    name.innerHTML = "";
                    fromName.innerHTML = "";
                    message.innerHTML = "";
                },
                    function (error) {
                        console.log('FAILED...', error);
                    });
        }

    });
}


window.onload = function () 
{

}
            

/**
 * Set the parameter to the cookie name, the value, the number of days to expire
 * 
 * @param {*} cname 
 * @param {*} cvalue 
 * @param {*} exdays 
 */
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
/**
 * Delete the cookie with the name passed as parameter
 * @param {*} cname 
 */
function deleteCookie(cname) {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=;" + expires + ";path=/";
}

/**
 * Check if the cookie is set or not, if not then show the cookie consent
 * @param {*} cname 
 * @returns nothing
 */
function getCookiePl(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
/**
 * Check if the cookie is set or not, if not then show the cookie consent
 */
function acceptCookieConsent() {
    deleteCookie('user_cookie_consent');
    setCookie('user_cookie_consent', 1, 30);
    document.getElementById("cookieNotice").style.display = "none";
}

let cookie_consent = getCookiePl("user_cookie_consent");
if (cookie_consent != "") {
    document.getElementById("cookieNotice").style.display = "none";
} else {
    document.getElementById("cookieNotice").style.display = "none";
}
/**
 * Made for getting the value of the cookie
 * 
 * @param {*} cookieName 
 */
function gettingTheValue(cookieName) {
    var re = new RegExp(cookieName + "=([^;]+)");
    var value = re.exec(document.cookie);
    if (value != null) {
        return value[1];
    }
    else {
        return null;
    }
}

/**
 * Method is meant to keep track of the item the user bought as a cookie implementation 
 * 
 */
function userTrack() {
    click++;
    let getValue = gettingTheValue('user_track');
    if (getValue != null) {
        let newValue = parseInt(getValue) + click;
        setCookie('user_track', newValue, 30);
    }
    else {
        setCookie('user_track', click, 30);
    }

}

