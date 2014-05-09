define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
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
    _,
    Element,
    preview,
    preparePrint,
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


    var _initUiComponents = function(item, config){

        styleEditor.init(item, config);

        styleSheetToggler.init();

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer();

        preview.init($('.preview-trigger'), item);

        preparePrint();

        editor.initGui();

    };

    var _initFormVisibilityListener = function(){

        var $itemContainer = $('#item-editor-panel');

        var _staticElements = ['img', 'object', 'rubricBlock', 'modalFeedback', 'math'];

        var $formInteractionPanel = $('#item-editor-interaction-property-bar').hide(),
            $formChoicePanel = $('#item-editor-choice-property-bar').hide(),
            $formResponsePanel = $('#item-editor-response-property-bar').hide(),
            $formItemPanel = $('#item-editor-item-property-bar').show(),
            $formBodyElementPanel = $('#item-editor-body-element-property-bar').hide(),
            $formStylePanel = $('#item-style-editor-bar').hide(),
            $appearanceToggler = $('#appearance-trigger');

        var _toggleAppearanceEditor = function(active){

            if(active){

                $appearanceToggler.addClass('active');
                $formStylePanel.show();
                $formItemPanel.hide();
                
                //current widget sleep:
                $itemContainer.trigger('styleedit');

            }else{
                $appearanceToggler.removeClass('active');
                $formStylePanel.hide();
                $formItemPanel.show();
            }
        };

        $appearanceToggler.on('click', function(){
            
            if($appearanceToggler.hasClass('active')){
                _toggleAppearanceEditor(false);
            }else{
                _toggleAppearanceEditor(true);
            }
        });

        $(document).on('afterStateInit.qti-widget', function(e, element, state){

            switch(state.name){
                case 'active':
                    _toggleAppearanceEditor(false);
                    if(!Element.isA(element, 'assessmentItem')){
                        $formItemPanel.hide();
                    }
                    if(_.indexOf(_staticElements, element.qtiClass) >= 0){
                        $formBodyElementPanel.show();
                    }
                    break;
                case 'question':
                    $formInteractionPanel.show();
                    break;
                case 'choice':
                    $formChoicePanel.show();
                    break;
                case 'answer':
                    $formResponsePanel.show();
                    break;
                case 'sleep':
                    if(_.indexOf(_staticElements, element.qtiClass) >= 0){
                        $formBodyElementPanel.hide();
                    }
                    if(!Element.isA(element, 'choice')){
                        $formItemPanel.show();
                    }
                    break;
            }
        });

        $(document).on('beforeStateExit.qti-widget', function(e, element, state){
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
        start : function(config){

            _initFormVisibilityListener();

            //load item from serice REST
            loader.loadItem({uri : config.uri}, function(item){

                var $itemContainer = $('#item-editor-panel');

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', config.baseUrl);
                commonRenderer.setContext($itemContainer);

                //load creator renderer
                creatorRenderer.setOption('baseUrl', config.baseUrl);
                creatorRenderer.get().load(function(){

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $itemContainer.append(item.render());

                    //"post-render it" to initialize the widget
                    item.postRender({uri : config.uri});

                    _initUiComponents(item, config);

                }, item.getUsedClasses());

            });

        }
    };
});