define([
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/editor/toggleToolDisplay',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/fontSelector',
    'taoQtiItem/qtiCreator/editor/itemResizer',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/editor/toggleAppearance',
    'taoQtiItem/qtiCreator/editor/listStyler',
    'taoQtiItem/qtiCreator/editor/loader',
    'taoQtiItem/qtiCreator/editor/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/gridEditor/draggable',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/devTools',
    'helpers',
    'ckeditor',
    'taoQtiItem/qtiCreator/editor/jquery.gridEditor'
], function(
        Element,
        toggleToolDisplay,
        preview,
        fontSelector,
        itemResizer,
        preparePrint,
        toggleAppearance,
        listStyler,
        loader,
        creatorRenderer,
        draggable,
        xmlRenderer,
        devTools,
        helpers,
        ckeditor
        ) {


    var _renderItem = function _renderItem(item) {

        creatorRenderer.get().load(function() {

            item.setRenderer(this);
            $('.item-editor-drop-area').append(_normalizeItemBody(item.getBody().render()));
            item.postRender();

        }, item.getUsedClasses());
    };

    var _debug = function _debug(item) {

        devTools.listenStateChange();

        var $code = $('<code>', {'class': 'language-markup'}),
        $pre = $('<pre>', {'class': 'line-numbers'}).append($code);

        $('#item-editor-wrapper').append($pre);
        devTools.liveXmlPreview(item, $code);
    };

    var _initEditor = function _initEditor(item, $item, uri) {

        $item.gridEditor();
        $item.gridEditor('addInsertables', $('.tool-list > [data-qti-class]'), {
            helper: function() {
                return $(this).children('img').clone().removeClass('viewport-hidden').css('z-index', 999);
            }
        });
        $item.gridEditor('resizable');

        $item.on('dropped.gridEdit', function(e, $targetContainer, $placeholder) {

//            console.log(e, $targetContainer, $placeholder);
//            debugger;
            //a new qti element has been added: update the model + render
            $placeholder.removeAttr('id');//prevent it from being deleted
            $placeholder.addClass('widget-box');
            $placeholder.attr({
                'data-new': true,
                'data-qti-class': 'choiceInteraction'//$el.data('qti-class')
            });//add data attribute to get the dom ready to be replaced by rendering

            item.createElements($item.gridEditor('getContent'), function(newElts) {

                creatorRenderer.get().load(function() {

                    for (var serial in newElts) {

                        var elt = newElts[serial],
                                $widget,
                                widget;

                        elt.setRenderer(this);
                        elt.render($placeholder);
                        widget = elt.postRender();

                        if (Element.isA(elt, 'blockInteraction')) {
                            $widget = widget.$container;
                        } else {
                            //leave the container in place
                            $widget = widget.$original;
                        }

                        draggable.createMovable($widget, $targetContainer);

                        console.log($item.gridEditor('getContent'));
                    }
                }, this.getUsedClasses());
            });

        });

        $item.on('beforedragoverstop.gridEdit', function() {
            //save item?
        });
        
        console.log(xmlRenderer.render(item));
        
        $('#save-trigger').on('click', function() {
            $.ajax({
                url: helpers._url('saveItem', 'QtiCreator', 'taoQtiItem'),
                type: 'POST',
                dataType:'json',
                data: {
                    uri: uri,
                    xml: xmlRenderer.render(item)
                }
            }).done(function(data) {

                if (data.success) {
                    alert('saved');
                } else {
                    alert('failed');
                }

            });
        });
    };

    var _normalizeItemBody = function _normalizeItemBody(rawItemBody) {
        var $itemBody = $(rawItemBody);
        if (!$itemBody.hasClass('grid-row')) {
            return $('<div>', {'class': 'grid-row'}).append($('<div>', {'class': 'col-12'}).append($itemBody));
        }
        return $itemBody;
    };

    var _initUI = function(config) {

    };

    return {
        start: function(config) {

            ckeditor.disableAutoInline = true;
            toggleToolDisplay();
            preview.init('#preview-trigger');
            fontSelector('#item-editor-font-selector');
            itemResizer();
            preparePrint();
            toggleAppearance();
            listStyler();

            loader.loadItem({uri: config.uri}, function(item) {
                _renderItem(item);
                _initEditor(item, $('#item-editor-panel .item-editor-drop-area'), config.uri);
                _debug(item);
                _initUI(config);
            });

        }
    };

});