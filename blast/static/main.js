$(function() {

    // Submit sequence on submit
    $('#search-form').on('submit', function (event) {
        event.preventDefault();
        $('#searchbtn').prop('disabled', true);
        $('#searchbtn').text(' Searching from Database...')
        $('#searchbtn').prepend("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>")
        // $('#results').prepend("<div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div>")
        console.log("form submitted!")  // sanity check
        search();
    });

    // // Delete post on click
    // $("#talk").on('click', 'a[id^=delete-post-]', function () {
    //     var post_primary_key = $(this).attr('id').split('-')[2];
    //     console.log(post_primary_key) // sanity check
    //     delete_post(post_primary_key);
    // });

    // AJAX for searching
    function search() {
        
        $.ajax({
            url: "search/", // the endpoint
            type: "POST", // http method
            data: { query: $('#query-text').val() }, // data sent with the post request
            // handle a successful response
            success: function (json) {
                $('#query-text').val('');
                $('#searchbtn').prop('disabled', false);
                $('.spinner-border').remove()
                $('#searchbtn').text('Search')
                console.log(json); // log the returned json to the console
                
                $("#results").prepend("<li id='post'><strong>" + json.length + "</strong> - <em> " + json[0].sstart + "</em> - <span> " + json[0].send +
                    "</span> - <a href='#' class='close'>&times;</a></li>");
            },
            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $('#searchbtn').prop('disabled', false);
                $('.spinner-border').remove()
                $('#searchbtn').text('Search')
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    };










    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    /*
    The functions below will create a header with csrftoken
    */

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

});