define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/object/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'i18n'
], function(Widget, states, helper, toolbarTpl, inlineHelper, __) {

    var ObjectWidget = Widget.clone();

    ObjectWidget.initCreator = function() {
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
        
        inlineHelper.togglePlaceholder(this);
    };
    
    ObjectWidget.getRequiredOptions = function(){
        return ['baseUrl', 'uri', 'lang', 'mediaManager'];
    };
    
    ObjectWidget.buildContainer = function(){
        
        helper.buildBlockContainer(this);
        
        return this;
    };
    
    ObjectWidget.createToolbar = function() {
        
         helper.createToolbar(this, toolbarTpl);

        return this;
    };
    
    return ObjectWidget;
});
