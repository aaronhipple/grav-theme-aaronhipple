(function ($) {
    function isInternal(link) {
        return (link.protocol === window.location.protocol && link.host === window.location.host)
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

    $(document).ready(function () {

        $('body').on('click', 'a', function (e) {
            var url = $(this).attr('href'),
                target = $(this)[0];

            if (!isInternal(target)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            updatePage(url, true);
        });

        $(window).on("popstate", function(e) {
            url = e.originalEvent.originalTarget.location;
            updatePage(url, false);
        });

    });
}(jQuery));