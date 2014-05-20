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


    // workaround to get ajax loader out of the way
    // item editor has its own loader with the correct background color
    var $loader = $('#ajax-loading');
    var loaderLeft = $loader.css('left');

    var _initUiComponents = function(item, config){


        styleEditor.init(item, config);

        styleSheetToggler.init(config);

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer();
        preview.init($('.preview-trigger'), item);

        preparePrint();

        editor.initGui();

        $loader.css('left', loaderLeft);
    };

    var _showPanel = function($panel, $fold){
        
        $panel.show();
        editor.openSections($panel.children('section'));
        
        if($fold && $fold.length){
            editor.closeSections($fold.children('section'));
        }
    };

    var _initFormVisibilityListener = function(){

        $loader.css('left', '-10000px');

        // needs to be done twice, before and after the item is loaded
        // to avoid incorrect display. 2nd call is done internally
        editor.adaptHeight();


        var $itemContainer = $('#item-editor-panel');

        var _staticElements = {
            'img' : 'Image',
            'object' : 'Media',
            'rubricBlock' : 'Rubric Block',
            'modalFeedback' : 'Modal Feedback',
            'math' : 'Math'
        };

        // all sections on the right sidebar are invisible by default
        var $formInteractionPanel = $('#item-editor-interaction-property-bar'),
            $formChoicePanel = $('#item-editor-choice-property-bar'),
            $formResponsePanel = $('#item-editor-response-property-bar'),
            $formItemPanel = $('#item-editor-item-property-bar').show(),
            $formBodyElementPanel = $('#item-editor-body-element-property-bar'),
            $formTextBlockPanel = $('#item-editor-text-property-bar'),
            $formStylePanel = $('#item-style-editor-bar'),
            $appearanceToggler = $('#appearance-trigger');

        var _toggleAppearanceEditor = function(active){

            if(active){

                $appearanceToggler.addClass('active');
                $formStylePanel.show();
                $formItemPanel.hide();

                //current widget sleep:
                $itemContainer.trigger('styleedit');

                /* At the time of writing this the following sections are available:
                 *
                 * #sidebar-left-section-text
                 * #sidebar-left-section-block-interactions
                 * #sidebar-left-section-inline-interactions
                 * #sidebar-left-section-graphic-interactions
                 * #sidebar-left-section-media
                 * #sidebar-right-css-manager
                 * #sidebar-right-style-editor
                 * #sidebar-right-item-properties
                 * #sidebar-right-body-element-properties
                 * #sidebar-right-text-block-properties
                 * #sidebar-right-interaction-properties
                 * #sidebar-right-choice-properties
                 * #sidebar-right-response-properties
                 */
                _showPanel($formStylePanel);
            }else{
                $appearanceToggler.removeClass('active');
                $formStylePanel.hide();
                _showPanel($formItemPanel);
            }
        };

        $appearanceToggler.on('click', function(){

            if($appearanceToggler.hasClass('active')){
                _toggleAppearanceEditor(false);
            }
            else{
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

                    var label = _staticElements[element.qtiClass];
                    if(label){
                        $formBodyElementPanel.find('h2').html(label + ' Properties');
                        _showPanel($formBodyElementPanel);
                    }else if(element.qtiClass === '_container'){
                        _showPanel($formTextBlockPanel);
                    }

                    break;
                case 'question':
                    _showPanel($formInteractionPanel);
                    break;
                case 'choice':
                    _showPanel($formChoicePanel, $formInteractionPanel);
                    break;
                case 'answer':
                    _showPanel($formResponsePanel);
                    break;
                case 'sleep':

                    if(_staticElements[element.qtiClass]){
                        $formBodyElementPanel.hide();
                    }else if(element.qtiClass === '_container'){
                        $formTextBlockPanel.hide();
                    }

                    if(!Element.isA(element, 'choice')){
                        if(!$itemContainer.find('.widget-box.edit-active').length){
                            _showPanel($formItemPanel);
                        }
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
        /**
         * 
         * @param {object} config (baseUrl, uri, lang)
         */
        start : function(config){

            _initFormVisibilityListener();

            //load item from REST service
            loader.loadItem({uri : config.uri}, function(item){

                var $itemContainer = $('#item-editor-panel');

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', config.baseUrl);
                commonRenderer.setContext($itemContainer);

                //load creator renderer
                creatorRenderer.setOptions(config);
                creatorRenderer.get().load(function(){

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $itemContainer.append(item.render());

                    //"post-render it" to initialize the widget
                    item.postRender(_.clone(config));

                    _initUiComponents(item, config);

                }, item.getUsedClasses());

            });

        }
    };
});