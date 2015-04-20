define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/include/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'taoQtiItem/qtiItem/helper/util'
], function($, Widget, states, helper, toolbarTpl, inlineHelper, itemUtil){

    var IncludeWidget = Widget.clone();

    IncludeWidget.initCreator = function(options){

        var _this = this,
            xinclude = _this.element,
            baseUrl = options.baseUrl;

        this.registerStates(states);

        Widget.initCreator.call(this);

        inlineHelper.togglePlaceholder(this);

        //check file exists:
        inlineHelper.checkFileExists(this, 'href', options.baseUrl);
        $('#item-editor-scope').on('filedelete.resourcemgr.' + this.element.serial, function(e, src){
            if(itemUtil.fullpath(xinclude.attr('href'), baseUrl) === itemUtil.fullpath(src, baseUrl)){
                xinclude.attr('href', '');
                inlineHelper.togglePlaceholder(_this);
            }
        });
    };

    IncludeWidget.destroy = function(){
        $('#item-editor-scope').off('.' + this.element.serial);
    };

    IncludeWidget.getRequiredOptions = function(){
        return ['baseUrl', 'uri', 'lang', 'mediaManager'];
    };

    IncludeWidget.buildContainer = function(){

        helper.buildInlineContainer(this);

//        this.$container.css({
//            width: this.element.attr('width'),
//            height: this.element.attr('height')
//        });
//        this.$original[0].setAttribute('width', '100%');
//        this.$original[0].setAttribute('height', '100%');

        return this;
    };

    IncludeWidget.createToolbar = function(){

        helper.createToolbar(this, toolbarTpl);

        return this;
    };

    return IncludeWidget;
});
