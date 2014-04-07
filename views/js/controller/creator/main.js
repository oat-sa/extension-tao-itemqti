define([
    'taoQtiItem/qtiCreator/editor/toggleToolDisplay',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/fontSelector',
    'taoQtiItem/qtiCreator/editor/itemResizer',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/editor/toggleAppearance',
    'taoQtiItem/qtiCreator/editor/listStyler',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer'
], function(
        toggleToolDisplay,
        preview,
        fontSelector,
        itemResizer,
        preparePrint,
        toggleAppearance,
        listStyler,
        loader,
        creatorRenderer
        ) {

    var _initUiComponents = function() {

        toggleToolDisplay();
        preview.init('#preview-trigger');
        fontSelector('#item-editor-font-selector');
        itemResizer();
        preparePrint();
        toggleAppearance();
        listStyler();
    };

    return {
        start: function(config) {
            
            _initUiComponents();
            
            //load item from serice REST
            loader.loadItem({uri: config.uri}, function(item) {

                //load renderer
                creatorRenderer.get().load(function() {

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $('#item-editor-panel').append(item.render());

                    //"post-render it" to initialize the widget
                    item.postRender({uri: config.uri});
                    
                }, item.getUsedClasses());

            });

        }
    };
});