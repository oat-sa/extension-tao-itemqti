define(['taoQtiItem/qtiCreator/widgets/Widget'], function(Widget){

    var ChoiceWidget = Widget.clone();

    ChoiceWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.interaction = this.element.getInteraction();

        var _this = this;

        /**
         * init event binding
         */
        
        //follow interaction state change
        this.afterStateInit(function(e, element, state){
            
            if(element.is('interaction')
                && element.getSerial() === _this.interaction.getSerial()
                && state.name !== _this.getCurrentState().name){

                switch(state.name){
                    case 'active':
                    case 'answer':
                    case 'sleep':
                    case 'question':
                        _this.changeState(state.name);
                        break;
                    case 'delete':
                        _this.changeState('sleep');
                        break;
                }

            }
        });

    };

    return ChoiceWidget;
});