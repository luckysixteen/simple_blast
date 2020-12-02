$(function() {

    // Submit sequence on submit
    $('#search-form').on('submit', function (event) {
        event.preventDefault();
        var sequence = $('#query-text').val()
        var sequence = sequence.toUpperCase().replace(/\s+/g, '')
        if (sequence == "") {
            // check if input string is empty
            $('.lead').after('<div class="alert alert-warning" role="alert">please enter A, G, C, T sequence</div>')
        } else if (sequence.match(/[^GCTA]/)) {
            // check if input string only conatin ACGT
            $('.lead').after('<div class="alert alert-warning" role="alert">please enter only A, G, C, T sequence</div>')
        } else {
            $('.alert').remove()
            $('#searchbtn').prop('disabled', true);
            $('#searchbtn').text(' Sending the request...')
            $('#searchbtn').prepend("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>")
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ query: sequence }),
            };
            searchResult(options)
        }
    });

    async function searchResult(options) {
        try {
            await submitResquest(options)
        } catch(e) {
            console.log(e)
        }        
    }

    const submitResquest = (options) => {
        fetch('search/', options).then(response => response.json())
            .then(json => {
                renderCard(json.data)
                changingButtonStatus()
                getResult(json.data)
            })
            .catch(error => {
                console.log(error)
                changingButtonStatus()
                $('#results').prepend("<div class='alert alert-warning alert-dismissible fade show' role='alert'>Oops! We have encountered an error:(<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
            });
    };

    const renderCard = number => {
        d = new Date()
        let sequence = $('#query-text').val().toUpperCase().replace(/\s+/g, '')
        if (sequence.length > 5) {
            sequence = sequence.slice(0, 5) + '...'
        }
        $("#results").prepend("<div class='card my-5'><div class='card-header'><div class='float-left font-weight-bolder'>Result</div><div class='float-right'>Created at: " + d + "</div></div><div class='card-body' id='" + number + "'></div></div>")
        $(".card-body").first().append('<h5 class="card-title">Match for \'' + sequence + '\' </h5><div class="container-fluid card-result mb-4"></div>')
        // $(".card-body").first().append('<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>')
        $(".card-body").first().append('<p>Waiting for the result...</p>')
    };

    const changingButtonStatus = () => {
        $('#query-text').val('');
        $('#searchbtn').prop('disabled', false);
        $('.spinner-border').remove()
        $('#searchbtn').text('Search')
    };

    const getResult = id => {
        let path = id + '/result/'
        console.log(new Date(), id)
        interval = setInterval(function () {
            fetch(path).then(response => response.json())
                .then(json => {
                    console.log(json)
                    if (json.status === 'done') {
                        console.log('starting presenting data!!!')
                        clearInterval(interval)
                        showResult(id, json)
                    }
                })
                .catch(error => {
                    console.log(error)
                });
        }, 2000)
    }

    const showResult = (id, value) => {
        console.log(id)
        $(".card-body#" + id + " p").remove()
        if (value.sstrand == '') {
            $(".card-body#" + id).append('<p>No hits found</p>')
        } else {

            $(".card-body#" + id + " .card-result").last().append('<div class="row"><div class="col-4"><span class="badge badge-info">E-Value</span>' + value.evalue + '</div><div class="col-8"><span class="badge badge-info">Identities</span>' + value.pident + '%</div></div>')
            const group = Math.floor(value.query.length / 60)
            for (i = 0; i < group; i++) {
                var newQuery = '<div class="row"><div class="col-2"><p class="font-weight-bold">Query ' + (i * 60 + 1) + '</p></div><div class="col-9"><p>' + value.query.slice(i * 60 + 1, (i + 1) * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + (i + 1) * 60 + '</p></div></div>'
                var newSbjct = '<div class="row"><div class="col-2"><p class="font-weight-bold">Sbjct ' + (parseInt(value.sstart) + i * 60) + '</p></div><div class="col-9"><p>' + value.sequence.slice(i * 60 + 1, (i + 1) * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + (parseInt(value.sstart) + (i + 1) * 60 - 1) + '</p></div></div>'
                $(".card-body#" + id + " .card-result").last().append(newQuery, newSbjct)
            }
            if (value.query.length % 60 !== 0) {
                var newQuery = '<div class="row"><div class="col-2"><p class="font-weight-bold">Query ' + (group * 60 + 1) + '</p></div><div class="col-9"><p>' + value.query.slice(i * 60 + 1, (i + 1) * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + value.query.length + '</p></div></div>'
                var newSbjct = '<div class="row"><div class="col-2"><p class="font-weight-bold">Sbjct ' + (parseInt(value.sstart) + group * 60) + '</p></div><div class="col-9"><p>' + value.sequence.slice(group * 60 + 1) + '</p></div><div class="col-1"><p class="font-weight-bold">' + value.send + '</p></div></div>'
                $(".card-body#" + id + " .card-result").last().append(newQuery, newSbjct)
            }
        }
    }
    
    

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