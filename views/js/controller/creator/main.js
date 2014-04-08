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
    
    var _initFormVisibilityListener = function(){
        
        var $formInteractionPanel = $('#item-editor-interaction-property-bar').hide(),
            $formChoicePanel = $('#item-editor-choice-property-bar').hide(),
            $formResponsePanel = $('#item-editor-response-property-bar').hide(),
            $formItemPanel = $('#item-editor-body-element-property-bar').hide();
        
        $(document).on('afterStateInit.qti-widget', function(e, element, state) {
            switch(state.name){
                case 'question':
                    $formInteractionPanel.show();
                    break;
                case 'choice':
                    $formChoicePanel.show();
                    break;
                case 'answer':
                    $formResponsePanel.show();
                    break;
            };
        });
        
        $(document).on('beforeStateExit.qti-widget', function(e, element, state) {
            switch(state.name){
                case 'question':
                    $formInteractionPanel.hide();
                    break;
                case 'choice':
                    $formChoicePanel.hide();
                    break;
                case 'answer':
                    $formResponsePanel.hide();
                    break;
            };
        });
    };
    
    return {
        start: function(config) {
            
            _initUiComponents();
            
            _initFormVisibilityListener();
            
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