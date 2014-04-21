define([], function(){

    var formElementHelper = {
        initShufflePinToggle : function(widget){

            var $container = widget.$container,
                choice = widget.element;
            
            $container.find('[data-role="shuffle-pin"]').on('mousedown', function(e){
                e.stopPropagation();
                var $icon = $(this).children();
                if($icon.length === 0){
                    $icon = $(this);
                }
                if($icon.hasClass('icon-shuffle')){
                    $icon.removeClass('icon-shuffle').addClass('icon-pin');
                    choice.attr('fixed', true);
                }else{
                    $icon.removeClass('icon-pin').addClass('icon-shuffle');
                    choice.attr('fixed', false);
                }
            });
        },
        initDelete : function(widget){

            var $container = widget.$container;

            $container.find('[data-role="delete"]').on('mousedown', function(e){
                e.stopPropagation();
                widget.changeState('deleting');
            });
        }
    };

    return formElementHelper;
});