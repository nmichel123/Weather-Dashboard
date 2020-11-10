$(document).ready(function(){

    // function to run user input through OpenWeather API

    $("#search-city").on("click", function() {
        var searchValue = $("#search-value").val("");

        // Clearing input box
        $("#search-value").val("");

        searchWeather(searchValue)

    });

    // Creates history section based off user input

    $(".history").on("click", "li", function(){
        searchWeather($(this).text());
    });

    // Creates row for history section to be appended to

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item-action").text(text);
        $(".history").append(li);
    }

    //AJAX call for OpenWeather API

    function searchWeather(searchValue){
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=795acf7e1929d29843c4de4d03c8de36&units=imperial",
            dataType: "JSON",
            success: function(data) {

                // Creating history links for current search

                if (history.indexOf(searchValue) === -1) {
                    history.push(searchValue);
                    window.localStorage.setItem("history", JSON.stringify(history));
                    
                    makeRow(searchValue)
                }

                // Clear old content 

                $("#today").empty();

                // Create HTML content for weather results

                var title =  $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                var card = $("<div>").addClass("card");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + "MPH");
                var humid = $("<p>").addClass("card-text").text("Humidity: "+ data.main.humidity + "%");
                var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
                var cardBody = $("<div>").addClass("card-body");
                var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                // Merge and add to page

                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);

                // Call follow-up API enpoints
                getForecast(searchValue);
                getUVIndex(data.coord.lat, data.coord.lon);

            }
        })
    }

    function getForecast (searchValue) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=795acf7e1929d29843c4de4d03c8de36&units=imperial",
            dataType: "JSON",
            success: function(data) {

                // Overwrite existing content with title and empty row

                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

                // Loop over all forecasts in 3 hour increments

                for(var i=0; i < data.list.length; i++) {

                    // Selecting forecasts around 3PM

                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

                        // Create elements for bootstrap card

                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card bg-primary text-white");
                        var body = $("<div>").addClass("card-body p-2");
                        var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                        var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                        // Merge elements and add to page 
                        col.append(card.append(body.append(title, img, p1, p2)));
                        $("#forecast .row").append(col);
                    }
                }
            }
        })
    }

    function getUVIndex(lat, lon) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=795acf7e1929d29843c4de4d03c8de36&lat=" + lat + "&lon=" + lon,
            dataType: "JSON",
            success: function(data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                // Change the color of the button depending on the UV Value
                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        })
    }

    // Get current search history 
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        searchWeather(history[history.length-1]);
    }

    for (var i=0; i < history.length; i++) {
        makeRow(history[i]);
    }
});



