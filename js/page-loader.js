(function ($) {
    function isInternal(e) {
        return (e.target.protocol == window.location.protocol && e.target.host == window.location.host)
    }
    $(document).ready(function () {

        $('a').click(function (e) {
            var url = $(this).attr('href');
            /**
             * @todo Get target info on the link itself, not the clicked thing (may be a child node of the link, doesn't work)
             */
            if (!isInternal(e)) {
                return;
            }

            console.log('Loading: ' + url);
            
            e.preventDefault();
            e.stopPropagation();

            $('#body').load(url + " #body", function (e) {
                $('#navbar').html(
                    $(e).find('#navbar')
                );
                history.pushState({ url: url }, $(e).find('title'), url);
            });

            $(window).on("popstate", function(e) {
                url = e.originalEvent.originalTarget.location;

                $('#body').load(url + " #body", function (e) {
                    $('#navbar').html(
                        $(e).find('#navbar')
                    );
                });
            });
        });

    });
}(jQuery));