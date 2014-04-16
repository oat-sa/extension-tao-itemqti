define([
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/editor/toggleAppearance',
    'taoQtiItem/qtiCreator/editor/listStyler',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    // css editor related
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'
], function(
        preview,
        preparePrint,
        toggleAppearance,
        listStyler,
        loader,
        creatorRenderer,
        fontSelector,
        colorSelector,
        fontSizeChanger,
        itemResizer,
        styleEditor
        ) {


    var _initUiComponents = function (config) {
        styleEditor.init(config);
        preview.init('#preview-trigger');
        preparePrint();
        toggleAppearance();
        listStyler();

        fontSelector(config);
        colorSelector(config);
        fontSizeChanger(config);
        //itemResizer(config);


        $('.item-editor-sidebar').fadeTo(2000 , 1);
    };
    
    var _initFormVisibilityListener = function (){
        
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
            }
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
            }
        });
    };
    
    return {
        start: function  (config) {

            
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

                    _initUiComponents(config);
                    
                }, item.getUsedClasses());

            });

        }
    };
});