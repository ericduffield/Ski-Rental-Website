
const cookieStyle = document.querySelector(".simple-cookie-consent");
const cookieModel = document.querySelector(".cookie-consent-container")
const cancelButton = document.querySelector(".cookie-consent-deny")
const acceptButton = document.querySelector(".cookie-consent-allow");
var click = 0;

const logger = require('../logger');




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
                    logger.info('SUCCESS!');
                    name.innerHTML = "";
                    fromName.innerHTML = "";
                    message.innerHTML = "";
                },
                    function (error) {
                        logger.error('FAILED...', error);
                    });
        }

    });
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