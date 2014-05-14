define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/img/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline'
], function(Widget, states, helper, toolbarTpl, inlineHelper) {

    var ImgWidget = Widget.clone();

    ImgWidget.initCreator = function() {
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
        
        inlineHelper.togglePlaceholder(this);
    };
    
    ImgWidget.buildContainer = function(){
        
        helper.buildInlineContainer(this);
        
        return this;
    };
    
    ImgWidget.createToolbar = function() {
        
         helper.createToolbar(this, toolbarTpl);

        return this;
    };

    return ImgWidget;
});