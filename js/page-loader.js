(function ($) {

    function isInternal(link) {
        var files = ['flv', 'jpg', 'jpeg', 'gif', 'gifv', 'bmp', 'pdf', 'doc', 'docx', 'ods'],
            maybeExtension = link.pathname.split('/').pop().split('?').shift().split('.').pop();
        return (link.protocol === window.location.protocol && link.host === window.location.host && files.indexOf(maybeExtension) < 0)
    }

    function isAudio(link) {
        var files = ['mp3', 'mp4', 'ogg'],
            maybeExtension = link.pathname.split('/').pop().split('?').shift().split('.').pop();
        return (files.indexOf(maybeExtension) > -1)
    }

    function getHTML(element, selector) {
        var query = element.querySelectorAll(selector),
            el;
        if (query.length === 0) {
            return 'Error loading document';
        }
        el = query[0];
        return el.innerHTML;
    }

    function maybeFade(element, callback) {
        if (element === '#body') {
            $(element).fadeTo(200, 0, function () {
                callback();
            }).delay(200).fadeTo(200,1);            
        } else {
            callback();
        }
    }

    function replaceElements(newDoc) {
        var oldEl,
            newHTML,
            replacers = [
            'title',
            '#navbar',
            '#body'
        ];

        for (var i = 0; i < replacers.length; i++) {
            oldEl = document.querySelectorAll(replacers[i])[0];
            newHTML = getHTML(newDoc, replacers[i]);
            maybeFade(replacers[i], function () {
                oldEl.innerHTML = newHTML;
            });
        }
    }

    function updatePage(url, pushState) {
        var request = new XMLHttpRequest(),
            newDoc = document.implementation.createHTMLDocument('*');
        
        request.open("GET", url, true);
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    newDoc.documentElement.innerHTML = request.responseText;
                    replaceElements(newDoc);
                    if (pushState) {
                        history.pushState({ url: url }, newDoc.querySelectorAll('title')[0].innerText, url);
                    }
                } else {
                    console.log('Error retrieving ' + url);
                }
            }
        }
        request.onerror = function (e) {
            console.error(request.statusText);
        }
        request.send(null);
    }

    function supportsHistoryAPI() {
        return !!(window.history && history.pushState);
    }

    function recalculateBodyMargin() {
        var $player = $('#player'),
            playerHeight = $player.hasClass('active') ? $player.height() + "px" : "0px";
        $('#footer .container').css('padding-bottom', playerHeight);
    }

    $(document).ready(function () {
        $('<div id="player" />').appendTo('#sb-site');

        var player = new Player(document.getElementById('player'));

        $('#player .handle').click(function () {
            var $player = $('#player')
            $player.toggleClass('active');
            if ($player.hasClass('active')) {
                $('body').addClass('player-active');
            } else {
                $('body').removeClass('player-active');
            }
        });

        $('#player').click(recalculateBodyMargin);

        $('body').on('click', 'a', function (e) {
            var url = $(this).attr('href'),
                target = $(this)[0];

            if (!supportsHistoryAPI() || !isInternal(target)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (isAudio(target)) {
                player.add(
                    url,
                    $(this).attr('data-title'),
                    $(this).attr('data-artist'),
                    $(this).attr('data-time')
                );
                $('#player').addClass('active');
                recalculateBodyMargin();
                return;
            }

            updatePage(url, true);
        });

        $(window).on("popstate", function(e) {
            updatePage(document.location, false);
        });

    });
}(jQuery));