define([
    'jquery',
    'lodash',
    //gui components
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    //appearance editor:
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler'
], function(
    $,
    _,
    preview,
    preparePrint,
    fontSelector,
    colorSelector,
    fontSizeChanger,
    itemResizer,
    styleEditor,
    styleSheetToggler
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

        updateHeight();
        $(window).off('resize.qti-editor')
            .on('resize.qti-editor', _.throttle(updateHeight, 50));

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

    /**
     * Update the height of the authoring tool
     * @private 
     */
    var updateHeight = function updateHeight(){
        var $itemEditorPanel = $('#item-editor-panel');
        var $itemSidebars = $('.item-editor-sidebar');
        var $contentPanel = $('#panel-authoring');
        var $searchBar,
            searchBarHeight,
            footerTop,
            contentWrapperTop,
            remainingHeight;

        if (!$contentPanel.length || !$itemEditorPanel.length) {
            return;
        }

        $searchBar = $contentPanel.find('.search-action-bar');
        searchBarHeight = $searchBar.outerHeight() + parseInt($searchBar.css('margin-bottom')) + parseInt($searchBar.css('margin-top'));

        footerTop = (function() {
            var $footer = $('body > footer'),
                footerTop;
            $itemSidebars.hide();
            footerTop = $footer.offset().top;
            $itemSidebars.show();
            return footerTop;
        }());
        contentWrapperTop = $contentPanel.offset().top;
        remainingHeight = footerTop - contentWrapperTop - $('.item-editor-action-bar').outerHeight();


        // in the item editor the action bars are constructed slightly differently
        $itemEditorPanel.find('#item-editor-scroll-outer').css({ minHeight: remainingHeight, maxHeight: remainingHeight, height: remainingHeight });
        $itemSidebars.css({ minHeight: remainingHeight, maxHeight: remainingHeight, height: remainingHeight });
    };

    return {
        initGui : initGui
    };

});


