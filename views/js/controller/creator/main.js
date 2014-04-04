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
    'taoQtiItem/qtiCreator/helper/devTools',
    'ckeditor',
    'taoQtiItem/qtiCreator/core/gridEditor'
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
    devTools,
    ckeditor
    ){


    var _renderItem = function _renderItem(item){

        creatorRenderer.get().load(function(){

            item.setRenderer(this);
            $('.item-editor-drop-area').append(_normalizeItemBody(item.getBody().render()));
            item.postRender();

        }, item.getUsedClasses());
    };

    var _debug = function _debug(item){

        devTools.listenStateChange();

        var $code = $('<code>', {'class' : 'language-markup'}),
        $pre = $('<pre>', {'class' : 'line-numbers'}).append($code);

        $('#item-editor-wrapper').append($pre);
        devTools.liveXmlPreview(item, $code);
    };

    var _initEditor = function _initEditor(item, $item){

        $item.gridEditor();
        $item.gridEditor('addInsertables', $('.tool-list > [data-qti-class]'), {
            helper : function(){
                return $(this).children('img').clone().removeClass('viewport-hidden').css('z-index', 999999);
            }
        });
        $item.gridEditor('resizable');

        $item.on('dropped.gridEdit', function($to, $dropped){

            //a new qti element has been added: update the model + render
            $dropped.removeAttr('id');//prevent it from being deleted
            $dropped.attr({
                'data-new' : true,
                'data-qti-class' : 'choiceInteraction',//$el.data('qti-class')
            });//add data attribute to get the dom ready to be replaced by rendering

            item.createElements(getBody($to), function(newElts){

                creatorRenderer.get().load(function(){

                    for(var serial in newElts){

                        var elt = newElts[serial],
                            $container,
                            widget;

                        elt.setRenderer(this);
                        elt.render($dropped);
                        widget = elt.postRender();

                        if(Element.isA(elt, 'blockInteraction')){
                            $container = widget.$container;
                        }else{
                            //leave the container in place
                            $container = widget.$original;
                        }

                        createMovable($container, $to);
                    }
                }, this.getUsedClasses());
            });

        });
    };
    var getBody = function getBody($el){
        var html = $el.html();
        var _replace = function(original, qtiClass){
            var ret = original;
            if(qtiClass){
                ret = '{{' + qtiClass + ':new}}';
            }
            return ret;
        };

        html = html.replace(new RegExp('<div[^<]*data-qti-class="(\\w+)"[^<]*data-new="true"[^<]*>[^<>]*<\/div>', 'img'), _replace);
        html = html.replace(new RegExp('<div[^<]*data-new="true"[^<]*data-qti-class="(\\w+)"[^<]*>[^<>]*<\/div>', 'img'), _replace);

        return html;
    };
    
    var _normalizeItemBody = function _normalizeItemBody(rawItemBody){
        var $itemBody = $(rawItemBody);
        if(!$itemBody.hasClass('grid-row')){
            return $('<div>', {'class' : 'grid-row'}).append($('<div>', {'class' : 'col-12'}).append($itemBody));
        }
        return $itemBody;
    };

    return {
        start : function(config){

            ckeditor.disableAutoInline = true;
            toggleToolDisplay();
            preview.init('#preview-trigger');
            fontSelector('#item-editor-font-selector');
            itemResizer();
            preparePrint();
            toggleAppearance();
            listStyler();

            loader.loadItem({uri : config.uri}, function(item){
                _renderItem(item);
                _initEditor(item, $('#item-editor-panel .item-editor-drop-area'));
                _debug(item);
            });

        }
    };

})
