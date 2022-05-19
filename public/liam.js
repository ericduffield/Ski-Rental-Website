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