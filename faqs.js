// Ensure jQuery is included before this script
$(document).ready(function () {
    $('.faq li .question').click(function () {
        $(this).parent().toggleClass('active');
        $(this).find('.plus-minus-toggle').toggleClass('collapsed');
    });
});
