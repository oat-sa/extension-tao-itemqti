define(['jquery', 'tpl!taoQtiItem/qtiCreator/tpl/notifications/deletingInfoBox'], function($, deletingInfoTpl){

    var _timeout = 10000;
    
    var _bindEvents = function($messageBox){

        var timeout = setTimeout(function(){
            $messageBox.trigger('confirm.deleting');
            $messageBox.fadeOut(1000, function(){
                $(this).remove();
            });
        }, _timeout);

        $messageBox.on('click', function(e){
            e.stopPropagation();
        });

        $('body').on('click.deleting', function(){
            $messageBox.trigger('confirm.deleting');
            $messageBox.fadeOut(600, function(){
                $(this).remove();
            });
        });

        $messageBox.find('a.undo').on('click', function(){
            $messageBox.trigger('undo.deleting');
            clearTimeout(timeout);
            $messageBox.remove();
        });
        
        $messageBox.find('.close-trigger').on('click', function(){
            $messageBox.trigger('confirm.deleting');
            $messageBox.remove();
        });
    };


    var deletingHelper = {
        createInfoBox : function(widgets){

            var $messageBox = $(deletingInfoTpl({
                serial : 'widgets',
                count : widgets.length
            }));

            $('body').append($messageBox);

            $messageBox.css({
                'display' : 'block',
                'position' : 'fixed',
                'top' : '50px',
                'left' : '50%',
                'margin-left' : '-200px',
                'width' : '400px',
                zIndex : 999999
            });
            
            _bindEvents($messageBox);
            
            return $messageBox;
        }
    };

    return deletingHelper;
});