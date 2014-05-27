define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for the preview
    // css editor related
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
    'taoQtiItem/qtiCreator/editor/editor'
], function(
    $,
    _,
    preview,
    preparePrint,
    panel,
    loader,
    creatorRenderer,
    commonRenderer,
    fontSelector,
    colorSelector,
    fontSizeChanger,
    itemResizer,
    styleEditor,
    styleSheetToggler,
    editor
    ){

    // workaround to get ajax loader out of the way
    // item editor has its own loader with the correct background color
    var $loader = $('#ajax-loading');
    var loaderLeft = $loader.css('left');

    var _initUiComponents = function(widget, config){
        
        $loader.css('left', '-10000px');

        styleEditor.init(widget.element, config);

        styleSheetToggler.init(config);

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer(widget.element);
        preview.init($('.preview-trigger'), widget);

        preparePrint();



        editor.initGui();

        $loader.css('left', loaderLeft);

    };

    return {
        /**
         * 
         * @param {object} config (baseUrl, uri, lang)
         */
        start : function(config){

            //load item from REST service
            loader.loadItem({uri : config.uri}, function(item){

                var $itemContainer = $('#item-editor-panel');

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', config.baseUrl);
                commonRenderer.setContext($itemContainer);

                //load creator renderer
                creatorRenderer.setOptions(config);
                creatorRenderer.get().load(function(){

                    var widget;

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $itemContainer.append(item.render());

                    //"post-render it" to initialize the widget
                    widget = item.postRender(_.clone(config));
                    
                    _initUiComponents(widget, config);
                    panel.initFormVisibilityListener();
                    panel.toggleInlineInteractionGroup();
                    
                }, item.getUsedClasses());

            });

        }
    };
});
