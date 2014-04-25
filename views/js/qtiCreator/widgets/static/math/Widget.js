define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/math/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media'
], function(Widget, states, helper, toolbarTpl) {

    var MathWidget = Widget.clone();

    MathWidget.initCreator = function() {

        Widget.initCreator.call(this);

        this.registerStates(states);
    };
    
    MathWidget.buildContainer = function(){
        
        if(this.element.attr('display') === 'block'){
            helper.buildBlockContainer(this);
        }else{
            helper.buildInlineContainer(this);
        }
        
        return this;
    };
    
    MathWidget.createToolbar = function() {
        
         helper.createToolbar(this, toolbarTpl);

        return this;
    };

    return MathWidget;
});