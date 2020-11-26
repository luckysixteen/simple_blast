$(function() {

    // Submit sequence on submit
    $('#search-form').on('submit', function (event) {
        event.preventDefault();
        var sequence = $('#query-text').val()
        var sequence = sequence.toUpperCase().replace(/\s+/g, '')
        if (sequence.match(/[^GCTA]/)) {
            $('.lead').after('<div class="alert alert-warning" role="alert">please enter only A, G, C, T sequence</div>')
        } else {
            $('.alert').remove()
            $('#searchbtn').prop('disabled', true);
            $('#searchbtn').text(' Searching from Database...')
            $('#searchbtn').prepend("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>")
            const start = Date.now()
            search(sequence, start);
        }
        
    });

    // AJAX for searching
    function search(sequence, start) {
        $.ajax({
            url: "search/",
            type: "POST",
            data: { query: sequence },
            success: function (json) {
                const query_text = sequence
                const group = Math.floor(query_text.length / 60)
                var seconds = (Date.now() - start) / 1000;
                var minutes = Math.floor(seconds / 60);
                seconds = (seconds % 60).toFixed(3)
                
                $('#query-text').val('');
                $('#searchbtn').prop('disabled', false);
                $('.spinner-border').remove()
                $('#searchbtn').text('Search')
                $("#results").prepend("<div class='card my-5'><div class='card-header'><div class='float-left font-weight-bolder'>Result</div><div class='float-right'>Time: " + minutes + "min " + seconds+ "sec</div></div><div class='card-body'></div></div>")
                if (json.length === 0) {
                    $(".card-body").first().prepend('<p>No match found</p>')
                } else {
                    count = 0
                    Object.entries(json).forEach(([key, value]) => {
                        if (key !== 'length') {
                            count = count + 1
                            console.log(value);
                            $(".card-body").first().append('<h5 class="card-title">Match ' + count +'</h5><div class="container-fluid card-result mb-4"></div>')
                            $(".card-body:first .card-result").last().append('<div class="row"><div class="col-4"><span class="badge badge-info">E-Value</span>' + value.evalue + '</div><div class="col-8"><span class="badge badge-info">Identities</span>' + value.pident + '%</div></div>')
                            for (i = 0; i < group; i++) {
                                var newQuery = '<div class="row"><div class="col-2"><p class="font-weight-bold">Query ' + (i * 60 + 1) + '</p></div><div class="col-9"><p>' + query_text.slice(i * 60 + 1, (i+1) * 60 + 1)+'</p></div><div class="col-1"><p class="font-weight-bold">'+ (i+1)*60 + '</p></div></div>'
                                var newSbjct = '<div class="row"><div class="col-2"><p class="font-weight-bold">Sbjct ' + (parseInt(value.sstart) + i * 60) + '</p></div><div class="col-9"><p>' + value.sequence.slice(i * 60 + 1, (i + 1) * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + (parseInt(value.sstart) + (i + 1) * 60 - 1) + '</p></div></div>'
                                console.log(i)
                                $(".card-body:first .card-result").last().append(newQuery, newSbjct)
                            }
                            if (query_text.length % 60 !== 0) {
                                var newQuery = '<div class="row"><div class="col-2"><p class="font-weight-bold">Query ' + (group * 60 + 1) + '</p></div><div class="col-9"><p>' + query_text.slice(i * 60 + 1, (i + 1) * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + query_text.length + '</p></div></div>'
                                var newSbjct = '<div class="row"><div class="col-2"><p class="font-weight-bold">Sbjct ' + (parseInt(value.sstart) + group * 60) + '</p></div><div class="col-9"><p>' + value.sequence.slice(group * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + value.send + '</p></div></div>'
                                console.log(i)
                                $(".card-body:first .card-result").last().append(newQuery, newSbjct)
                            }
                        }
                    });
                }
                
            },
            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $('#searchbtn').prop('disabled', false);
                $('.spinner-border').remove()
                $('#searchbtn').text('Search')
                $('#results').html("<div class='alert alert-warning alert-dismissible fade show' role='alert'>Oops! We have encountered an error:(<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                console.log(xhr.status + ": " + xhr.responseText);
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