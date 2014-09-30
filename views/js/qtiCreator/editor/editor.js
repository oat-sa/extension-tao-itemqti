define([
    'jquery',
    //gui components
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    //appearance editor:
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
    //layout
    'layout/section-height'
], function(
    $,
    preview,
    preparePrint,
    fontSelector,
    colorSelector,
    fontSizeChanger,
    itemResizer,
    styleEditor,
    styleSheetToggler,
    sectionHeight
    ){

    'use strict';

    var initStyleEditor = function(widget, config){

        styleEditor.init(widget.element, config);

        styleSheetToggler.init(config);

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer(widget.element);

    };

    var initPreview = function(widget){
        preview.init($('.preview-trigger'), widget);
    };

    /**
     * Initialize interface
     */
    var initGui = function(widget, config){

        sectionHeight.setHeights();

        initStyleEditor(widget, config);

        initPreview(widget);

        preparePrint();

        var $itemPanel = $('#item-editor-panel'),
            $labelSpan = $('#item-editor-label span'),
            $actionGroups = $('.action-group');

        $itemPanel.addClass('has-item');
        $labelSpan.text(config.$label);
        $actionGroups.show();
    };

    return {
        initGui : initGui
    };

});


