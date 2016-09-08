define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/object',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'taoQtiItem/qtiItem/helper/util',
    'lodash',
    'ui/mediasizer',
    'ui/resourcemgr',
    'nouislider',
    'ui/tooltip'
], function($, __, stateFactory, Active, formTpl, formElement, inlineHelper, itemUtil, _){

    var fileFilters = 'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,audio/mp3,audio/vnd.wav,audio/ogg,audio/vorbis,audio/webm,audio/mpeg,application/ogg,audio/aac,application/pdf';

    var ObjectStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    var refreshRendering = function refreshRendering(widget){
        //widget.refresh();return;
        var qtiObject =  widget.element;
        var previewOptions = {
            url : widget.getAssetManager().resolve(qtiObject.attr('data')),
            mime : qtiObject.attr('type'),
            width : qtiObject.attr('width') || '100%'
        };
        if(qtiObject.attr('height')){
            previewOptions.height = qtiObject.attr('height');
        }
        widget.$original.previewer(previewOptions);
    }

    ObjectStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            qtiObject = _widget.element,
            baseUrl = _widget.options.baseUrl,
            responsive = true;

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            src : qtiObject.attr('data'),
            alt : qtiObject.attr('alt'),
            height : qtiObject.attr('height'),
            width : qtiObject.attr('width'),
            responsive : responsive
        }));

        //init slider and set align value before ...
        _initAdvanced(_widget);
        _initAlign(_widget);
        _initUpload(_widget);

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, qtiObject, {
            src : _.throttle(function(object, value){
                qtiObject.attr('data', value);
                inlineHelper.togglePlaceholder(_widget);
                refreshRendering(_widget);
            }, 1000),
            width : _.throttle(function(object, value){
                qtiObject.attr('width', parseInt(value, 10));
                refreshRendering(_widget);
            }, 1000),
            height : _.throttle(function(object, value){
                qtiObject.attr('height', parseInt(value, 10));
                refreshRendering(_widget);
            }, 1000),
            alt : function(qtiObject, value){
                qtiObject.attr('alt', value);
            },
            align : function(qtiObject, value){
                inlineHelper.positionFloat(_widget, value);
            }
        });

    };

    var _initAlign = function(widget){

        var align = 'default';

        //init float positioning:
        if(widget.element.hasClass('rgt')){
            align = 'right';
        }else if(widget.element.hasClass('lft')){
            align = 'left';
        }

        inlineHelper.positionFloat(widget, align);
        widget.$form.find('select[name=align]').val(align);
    };

    var _initAdvanced = function(widget){

        var $form = widget.$form,
            data = widget.element.attr('data');

        if(data){
            $form.find('[data-role=advanced]').show();
        }else{
            $form.find('[data-role=advanced]').hide();
        }
    };


    var _initUpload = function(widget){

        var $form = widget.$form,
            options = widget.options,
            qtiObject = widget.element,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $src = $form.find('input[name=src]'),
            $width = $form.find('input[name=width]'),
            $height = $form.find('input[name=height]');

        var _openResourceMgr = function _openResourceMgr(){
            $uploadTrigger.resourcemgr({
                title : __('Please select a media file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                appendContainer : options.mediaManager.appendContainer,
                mediaSourcesUrl : options.mediaManager.mediaSourcesUrl,
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                fileExistsUrl : options.mediaManager.fileExistsUrl,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    filters : fileFilters
                },
                pathParam : 'path',
                select : function(e, files){

                    var file, type;

                    if(files && files.length){

                        file = files[0].file;
                        type = files[0].mime;
                        console.log('file', files[0]);

                        if(qtiObject && (!qtiObject.attr('width') || parseInt(qtiObject.attr('width'), 10) <= 0)){
                            //qtiObject.attr('width', widget.$original.innerWidth());
                            $width.val(widget.$original.innerWidth()).trigger('change');
                        }
                        if(qtiObject && (!qtiObject.attr('height') || parseInt(qtiObject.attr('height'), 10) <= 0)){
                            //qtiObject.attr('height', widget.$original.innerHeight());
                            $height.val(widget.$original.innerHeight()).trigger('change');
                        }
                        qtiObject.attr('type', type);
                        $src.val(file).trigger('change');
                    }
                },
                open : function(){
                    //hide tooltip if displayed
                    if($src.data('qtip')){
                        $src.blur().qtip('hide');
                    }
                },
                close : function(){
                    //triggers validation :
                    $src.blur();
                }
            });
        };

        $uploadTrigger.on('click', _openResourceMgr);

        //if empty, open file manager immediately
        if(!$src.val()){
            _openResourceMgr();
        }

    };

    return ObjectStateActive;
});
