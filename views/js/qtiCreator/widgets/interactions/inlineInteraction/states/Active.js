define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/interactions/states/Active'], function(stateFactory, Active){

    var InteractionStateActive = stateFactory.extend(Active, function(){

        //show toolbar, ok button, event binding performed by parent state

        var _widget = this.widget,
            itemOffset = _widget.$itemContainer.offset(),
            originalOffset = _widget.$original.offset(),
            $interactionContainer = _widget.$itemContainer.find('.qti-inlineInteraction'),
            widgetPaddingTop = parseInt($interactionContainer.css('padding-top')),
            widgetPaddingLeft = parseInt($interactionContainer.css('padding-left'));

        //calculate absolute position:
        _widget.$container.show().css({
            position : 'absolute',
            top : originalOffset.top - itemOffset.top,
            left : originalOffset.left - itemOffset.left
        });
        
        return;
        _widget.$container.css({
            position : 'absolute',
            top : originalOffset.top - itemOffset.top - widgetPaddingTop,
            left : originalOffset.left - itemOffset.left - widgetPaddingLeft
        });

    }, function(){

        //disable/destroy editor, hide mini-toolbar, hide container performed by parent

        //update the renderered inline interaction?

        //hide it:
        this.widget.$container.hide();
    });

    InteractionStateActive.prototype.showWidget = function(){

    };

    return InteractionStateActive;
});