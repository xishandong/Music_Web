$(document).ready(function () {
    try {
        $("a#pageLink").click(function () {
            $("a#pageLink").removeClass("active");
            $(this).addClass("active");
        });
        $(".menu-button").click(function () {
            $(".left-area").removeClass("hide-on-mobile");
        });
        $(".close-menu").click(function () {
            $(".left-area").addClass("hide-on-mobile");
        });
        $(".more-button").click(function () {
            $(".more-menu-list").toggle("hide");
        });

        update()
    } catch (e) {
        update()
    }
});

function update() {
    var owl = $("#owl-slider-1");
    var owl2 = $("#owl-slider-2");
    var owl3 = $("#owl-slider-3");
    if (owl.length > 0 && owl2.length > 0 && owl3.length > 0) {
        owl.owlCarousel({
            navigation: true,
            slideSpeed: 400,
            paginationSpeed: 400,
            items: 1,
            itemsDesktop: false,
            itemsDesktopSmall: false,
            itemsTablet: false,
            itemsMobile: false,
            autoplay: true,
            autoPlaySpeed: 200,
            autoPlayTimeout: 100,
            autoplayHoverPause: true,
            loop: true,
            onInitialized: function () {
                $(".hero-img-wrapper img").css({
                    height: "320px"
                });
                $('.owl-stage').css({
                    height: "320px"
                })
            }
        });
        $(".owl-next").click(function () {
            owl.trigger("owl.next");
        });
        $(".owl-prev").click(function () {
        });
        $(".play").click(function () {
            owl.trigger("owl.play", 100);
        });
        $(".stop").click(function () {
            owl.trigger("owl.stop");
        });
        owl2.owlCarousel({
            navigation: true,
            slideSpeed: 400,
            paginationSpeed: 400,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 4
                }
            }
        });
        owl3.owlCarousel({
            navigation: true,
            slideSpeed: 400,
            paginationSpeed: 400,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 4
                }
            }
        })
    }
}