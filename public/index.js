const darkMode = document.querySelector("#dark-mode");
const modeLogo = document.querySelector("#mode-logo");
const modeText = document.querySelector("#mode-text");

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

// FORM emailJs

(function() {
    // https://dashboard.emailjs.com/admin/account
    emailjs.init('erahkk0th3Z3BKcn9');
})();

window.onload = function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('nameCon').value;
        const fromName = document.getElementById('fromNameCon').value;
        const message = document.getElementById('messageCon').value;
        if(name == "" || fromName == "" || message == "" 
        || name == null || fromName == null || message == null)
        {
            alert("Please fill all the fields");
            return false;
        }
        else
        {

        // generate a five digit number for the contact_number variable
        this.contact_number.value = Math.random() * 100000 | 0;
        // these IDs from the previous steps
        emailjs.sendForm('service_mksrijc', 'template_y5kbr8g', this)
            .then(function() {
                console.log('SUCCESS!');
                name.innerHTML = "";
                fromName.innerHTML = "";
                message.innerHTML = "";
            },
            function(error)
            {
                console.log('FAILED...', error);
        });
        }
        
    });
}