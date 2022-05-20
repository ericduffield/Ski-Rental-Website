window.addEventListener('load', function() {
    var dates = document.querySelectorAll('.datePicker');
    // Loop over dates and change the value to right Now
    for (var i = 0; i < dates.length; i++) {
        dates[i].value = new Date().toISOString().substr(0, 10);
    }
    var times = document.querySelectorAll('.timePicker')
    // Loop over times and change the value to right Now
    for (var i = 0; i < times.length; i++) {
        hour = new Date().toLocaleTimeString().split(':')[0];
        if(hour < 10){
            hour = '0' + hour;
        }
        minute = new Date().toLocaleTimeString().split(':')[1];

        times[i].value = hour + ':' + minute;
    }
});