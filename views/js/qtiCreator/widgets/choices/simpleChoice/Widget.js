define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/states/states'
], function(Widget, states){

    var SimpleChoiceWidget = Widget.clone();

    SimpleChoiceWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
        var _this = this;
        //prevent checkbox/radio to be selectionable
        //@todo replace it using css style
        
        this.$container.find('.real-label').on('mousedown.qti-widget, click.qti-widget', function(e){
            var currentState = _this.getCurrentState();
            if(currentState && currentState.name === 'question'){
                e.preventDefault();
            }
        });
    };

    return SimpleChoiceWidget;
});