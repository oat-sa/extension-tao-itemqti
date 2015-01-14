define([
    'jquery',
    'lodash',
    'helpers',
    'core/dataattrhandler',
    //gui components
    'taoItems/preview/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    //appearance editor:
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
    // item related
    'taoQtiItem/qtiCreator/helper/itemSerializer'
], function(
    $,
    _,
    helpers,
    dataAttrHandler,
    preview,
    preparePrint,
    fontSelector,
    colorSelector,
    fontSizeChanger,
    itemResizer,
    styleEditor,
    styleSheetToggler,
    itemSerializer
    ){

    'use strict';

    var askForSave = false,
        serializeTimeOut,
        lastItemData,
        serializeItem = function (element) {
            lastItemData = itemSerializer.serialize(element);
        };

    var initStyleEditor = function(widget, config){

        styleEditor.init(widget.element, config);

        styleSheetToggler.init(config);

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer(widget.element);

    };

    var initPopup = function($trigger, options) {

        var defaults = {
            top: null,     // || pixels relative to the top border of the sidebar
            right: 2       // pixels relative to the left border of the sidebar
        };

        options = _.assign(defaults, (options || {}));

        // open the popup
        var open = function($trigger, $popup) {

            var $sidebar = $popup.parents('.item-editor-sidebar-wrapper');
            $trigger.trigger('beforeopen.popup', { popup: $popup, trigger: $trigger });
            $popup.show();

            // positioning
            if(_.isNull(options.top)) {
                options.top = $trigger.offset().top - $sidebar.offset().top - ($popup.height() / 2);
            }
            $popup.css( { top: options.top });
            $popup.css( { right: $sidebar.width() + options.right });

            $trigger.trigger('open.popup', { popup: $popup, trigger: $trigger });
        };

        // close the popup
        var close = function($trigger, $popup) {
            $trigger.trigger('beforeclose.popup', { popup: $popup, trigger: $trigger });
            $popup.hide();
            $trigger.trigger('close.popup', { popup: $popup, trigger: $trigger });
        };

        // find popup, assign basic actions, add it to trigger props
        $trigger.each(function() {
            var _trigger = $(this),
                $popup = options.popup || (function() {
                    return dataAttrHandler.getTarget('popup', _trigger);
                }());

            if(!$popup || !$popup.length) {
                throw new Error('No popup found');
            }

            // close popup by clicking on x button
            $popup.find('.closer').on('click', function() {
                close(_trigger, $popup);
            });

            // drag popup
            $popup.draggable({
                handle : $popup.find('.dragger')
            });

            // assign popup to trigger to avoid future DOM operations
            _trigger.prop('popup', $popup);
        });

        // toggle popup
        $trigger.on('click', function(e) {
            var _trigger = $(e.target),
                $popup   = _trigger.prop('popup');

            // in case the trigger is an <a>
            e.preventDefault();

            // toggle popup
            if($popup.is(':visible')) {
                close(_trigger, $popup);
            }
            else {
                open(_trigger, $popup);
            }
        })
    };

    /**
     * Confirm to save the item
     */
    var _confirmPreview = function (overlay) {

        var confirmBox = $('.preview-modal-feedback'),
            cancel = confirmBox.find('.cancel'),
            save = confirmBox.find('.save'),
            close = confirmBox.find('.modal-close');

        confirmBox.modal({ width: 500 });

        save.on('click', function () {
            overlay.trigger('save.preview');
            confirmBox.modal('close');
        });

        cancel.on('click', function () {
            confirmBox.modal('close');
        });
    };


    var initPreview = function(widget){

        var previewContainer, previewUrl;

        clearTimeout(serializeTimeOut);
        //serialize the item at the initialization level
        //TODO wait for an item ready event
        // itemWidget.$container.on('ready...
        serializeTimeOut = setTimeout(function() {
            serializeItem(widget.element);
        }, 500);

        //get the last value by saving
        $('#save-trigger').on('click.qti-creator', function() {
            serializeItem(widget.element);
        });

        $(document).on('stylechange.qti-creator', function () {
            //we need to save before preview of style has changed (because style content is not part of the item model)
            askForSave = true;
        });

        //compare the current item with the last serialized to see if there is any change
        if (!askForSave) {
            var currentItemData = serializeItem(widget.element);
            if (lastItemData !== currentItemData || currentItemData === '') {
                lastItemData = currentItemData;
                askForSave = true;
            }
        }

        previewUrl = helpers._url('index', 'QtiPreview', 'taoQtiItem') + '?uri=' + encodeURIComponent(widget.itemUri);
        previewContainer = preview.init(previewUrl);

        // wait for confirmation to save the item
        if (askForSave) {
            _confirmPreview(previewContainer);
            previewContainer.on('save.preview', function () {
                previewContainer.off('save.preview');
                askForSave = false;
                $.when(styleEditor.save(), widget.save()).done(function () {
                    preview.show();
                });
            });
        }
        else {
            //or show the preview
            preview.show();
        }

    };

    /**
     * Initialize interface
     */
    var initGui = function(widget, config){

        updateHeight();
        $(window).off('resize.qti-editor')
            .on('resize.qti-editor', _.throttle(updateHeight, 50));

        initStyleEditor(widget, config);

        preparePrint();

        var $itemPanel = $('#item-editor-panel'),
            $label = $('#item-editor-label'),
            $actionGroups = $('.action-group');

        $itemPanel.addClass('has-item');
        $label.text(config.label);
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
        var /*$searchBar,
            searchBarHeight,*/
            footerTop,
            contentWrapperTop,
            remainingHeight;

        if (!$contentPanel.length || !$itemEditorPanel.length) {
            return;
        }

        //$searchBar = $contentPanel.find('.search-action-bar');
        //searchBarHeight = $searchBar.outerHeight() + parseInt($searchBar.css('margin-bottom')) + parseInt($searchBar.css('margin-top'));

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
        initGui : initGui,
        initPreview: initPreview,
        initPopup: initPopup
    };

});


