define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    return stateFactory.create('sleep', function(){

        var $container = this.widget.$container;
        
        //add listener to display proper hover style
        $container.on('mouseenter.sleep', function(e){
            $container.addClass('hover');
            $container.parent().trigger('mouseleave.sleep');
        }).on('mouseleave.sleep', function(){
            $container.removeClass('hover');
            $container.parent().trigger('mouseenter.sleep');
        });
        
    }, function(){

        this.widget.$container.removeClass('hover').off('.sleep');

    });
});