define([
    'taoQtiItem/qtiCreator/editor/toggleToolDisplay',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/fontSelector',
    'taoQtiItem/qtiCreator/editor/itemResizer',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/editor/toggleAppearance',
    'taoQtiItem/qtiCreator/editor/listStyler',
    'taoQtiItem/qtiCreator/editor/loader',
    'taoQtiItem/qtiCreator/editor/creatorRenderer',
    'ckeditor',
    'ckConfigurator',
    'taoQtiItem/qtiCreator/core/gridEditor'
], function(
    toggleToolDisplay,
    preview,
    fontSelector,
    itemResizer,
    preparePrint,
    toggleAppearance,
    listStyler,
    loader,
    creatorRenderer,
    ckeditor,
    ckConfigurator
    ){


    var _renderItem = function _renderItem(item){

        creatorRenderer.get().load(function(){

            item.setRenderer(this);
            $('.item-editor-drop-area').append(_normalizeItemBody(item.getBody().render()));
            item.postRender();

        }, item.getUsedClasses());
    };

    var _debug = function _debug(){

        $(document).on('beforeStateInit.qti-widget', function(e, element, state){
            console.log('->state : ' + state.name + ' : ' + element.serial);
        });

        $(document).on('afterStateExit.qti-widget', function(e, element, state){
            console.log('<-state : ' + state.name + ' : ' + element.serial);
        });

    };

    var _initEditor = function _initEditor($item){

        $item.gridEditor();
        $item.gridEditor('addInsertables', $('.tool-list > [data-qti-class]'), {
            helper : function(){
                return $(this).children('img').clone().removeClass('viewport-hidden').css('z-index', 999999);
            }
        });
        $item.gridEditor('resizable');
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
                _renderItem(item)
                _initEditor($('#item-editor-panel .item-editor-drop-area'));
            });

        }
    };

})
