window.addEventListener('load', 
/**
 * Sets the default times in the rent page
 */
function() {
    var dates = document.querySelectorAll('.datePicker');
    // Loop over dates and change the value to right Now
    for (var i = 0; i < dates.length; i++) {
        dates[i].value = new Date().toISOString().substr(0, 10);
    }
    var times = document.querySelectorAll('.timePicker')
    // Loop over times and change the value to right Now
    for (var i = 0; i < times.length; i++) {
        hour = new Date().toLocaleTimeString().split(':')[0];
        time = new Date().toLocaleTimeString();              
        if(time.split(' ')[1] == 'PM'){
            hour = parseInt(hour) + 12;
        }  
        if(hour < 10){
            hour = '0' + hour;
        }        
        time = hour + ':' + time.split(':')[1]
        times[i].value = time;
    }
});