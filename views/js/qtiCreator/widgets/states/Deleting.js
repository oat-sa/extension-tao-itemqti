define(['taoQtiItem/qtiCreator/widgets/states/factory', 'tpl!taoQtiItem/qtiCreator/tpl/notifications/deletingInfoBox'], function(stateFactory, deletingInfoTpl){

    var DeletingState = stateFactory.create('deleting', function(){

        var _widget = this.widget;

        _widget.$container.hide();
        _widget.$original.hide();

        this.showMessage(_widget.element);

    }, function(){
        
        var _widget = this.widget;
        _widget.$original.show();
        _widget.$container.show();
        
        $('body').off('.deleting');
    });

    DeletingState.prototype.showMessage = function(){

        var _this = this,
            _widget = this.widget,
            serial = _widget.serial;

        $('body').append(deletingInfoTpl({
            serial : serial
        }));

        var $messageBox = $('body>.feedback-info[data-for="' + serial + '"]');
        $messageBox.css({
            'display' : 'block',
            'position' : 'fixed',
            'top' : '50px',
            'left' : '50%',
            'margin-left' : '-200px',
            'width' : '400px'
        });

        var timeout = setTimeout(function(){
            _this.deleteElement();
            $messageBox.fadeOut(1000, function(){
                $(this).remove();
            });
        }, 10000);

        $messageBox.on('click', function(e){
            e.stopPropagation();
        });

        $('body').on('click.deleting', function(){
            _this.deleteElement();
            $messageBox.fadeOut(600, function(){
                $(this).remove();
            });
        });

        $messageBox.find('a.undo').on('click', function(){
            clearTimeout(timeout);
            $messageBox.remove();
            _widget.changeState('question');
        });

        $messageBox.find('.close-trigger').on('click', function(){
            _this.deleteElement();
            $messageBox.remove();
        });

        this.messageBox = $messageBox;
    };

    DeletingState.prototype.deleteElement = function(){
        this.widget.element.remove();
        this.widget.$container.remove();
        this.widget.$original.remove();
        this.widget.destroy();
    };

    return DeletingState;
});