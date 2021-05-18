define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active'
], function($, stateFactory, Active){
    'use strict';

    return stateFactory.extend(Active, function(){

        var _widget = this.widget,
            $container = _widget.$container;

        _widget.beforeStateInit(function(e, element, state){
            var serial = element.getSerial(),
                composingElts;

            if((state.name === 'active' && serial !== _widget.serial) || state.name === 'choice'){

                if(_widget.element.qtiClass === 'rubricBlock'){
                    //exclude
                    composingElts = _widget.element.getComposingElements();
                    if(!composingElts[element.serial]){
                        _widget.changeState('sleep');
                    }
                }else{
                    //call sleep whenever other widget is active
                    _widget.changeState('sleep');
                }

            }

        }, 'otherActive');

        $container.on('mouseenter.active', function(e){
            e.stopPropagation();
            $container.parent().trigger('mouseleave.sleep');
        }).on('mouseleave.active', function(e){
            e.stopPropagation();
            $container.parent().trigger('mouseenter.sleep');
        }).on('click.active', function(e){
            e.stopPropagation();
        });

    }, function(){
        var _widget = this.widget,
            areaBroker = _widget.getAreaBroker();

        _widget.$container.off('.active');
        areaBroker.getContentCreatorPanelArea().off('.active.' + _widget.serial);

        _widget.offEvents('otherActive');
    });

});
