define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/img',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'taoQtiItem/qtiItem/helper/util',
    'lodash',
    'util/image',
    'ui/mediaEditor/mediaEditorComponent',
    'core/mimetype',
    'ui/resourcemgr',
    'nouislider',
    'ui/tooltip'
], function($, __, stateFactory, Active, formTpl, formElement, inlineHelper, itemUtil, _, imageUtil, mediaEditorComponent, mimeType){
    'use strict';

    /**
     * media Editor instance if has been initialized
     * @type {null}
     */
    var mediaEditor = null;

    var ImgStateActive = stateFactory.extend(Active, function(){
        this.initForm();
    }, function(){
        this.widget.$form.empty();
    });

    /**
     * Extract a default label from a file/path name
     * @param {String} fileName - the file/path
     * @returns {String} a label
     */
    var _extractLabel = function extractLabel(fileName){
        return fileName
            .replace(/\.[^.]+$/, '')
            .replace(/^(.*)\//, '')
            .replace(/\W/, ' ')
            .substr(0, 255);
    };

    ImgStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $img = _widget.$original,
            $form = _widget.$form,
            img = _widget.element,
            baseUrl = _widget.options.baseUrl;

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            src : img.attr('src'),
            alt : img.attr('alt')
        }));

        //init slider and set align value before ...
        _initAdvanced(_widget);
        _initMediaSizer(_widget);
        _initAlign(_widget);
        _initUpload(_widget);

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, img, {
            src : _.throttle(function(img, value){

                img.attr('src', value);
                if (!$img.hasClass('hidden')) {
                    $img.addClass('hidden');
                }
                $img.attr('src', _widget.getAssetManager().resolve(value));
                $img.trigger('contentChange.qti-widget').change();

                inlineHelper.togglePlaceholder(_widget);

                _initAdvanced(_widget);
                if (img.attr('off-media-editor') === 1) {
                    img.removeAttr('off-media-editor');
                } else {
                    _initMediaSizer(_widget);
                }
            }, 1000),
            alt : function(img, value){
                img.attr('alt', value);
            },
            longdesc : formElement.getAttributeChangeCallback(),
            align : function(img, value){
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

    var _getMedia = function(imgQtiElement, $imgNode, cb) {
        //init data-responsive:
        if (typeof imgQtiElement.data('responsive') === 'undefined') {
            if(imgQtiElement.attr('width') && !/[0-9]+%/.test(imgQtiElement.attr('width'))){
                imgQtiElement.data('responsive', false);
            }else{
                imgQtiElement.data('responsive', true);
            }
        }

        if (
            typeof imgQtiElement.attr('original-width') !== 'undefined'
            && typeof imgQtiElement.attr('original-height') !== 'undefined'
            && typeof imgQtiElement.attr('type') !== 'undefined'
            && typeof imgQtiElement.attr('src') !== 'undefined'
            && typeof imgQtiElement.attr('width') !== 'undefined'
            && typeof imgQtiElement.attr('height') !== 'undefined'
        ) {
            cb({
                $node: $imgNode,
                type: imgQtiElement.attr('type'),
                src:  imgQtiElement.attr('src'),
                width:  imgQtiElement.attr('width'),
                height: imgQtiElement.attr('height'),
                responsive: imgQtiElement.data('responsive')
            });
        } else {
            mimeType.getResourceType($imgNode.attr('src'), function (err, type) {
                imgQtiElement.attr('type', type);
                cb({
                    $node: $imgNode,
                    type: imgQtiElement.attr('type'),
                    src:  imgQtiElement.attr('src'),
                    width:  imgQtiElement.attr('width'),
                    height: imgQtiElement.attr('height'),
                    responsive: imgQtiElement.data('responsive')
                });
            });
        }
    };

    var _initMediaSizer = function(widget){

        var img = widget.element,
            $src = widget.$form.find('input[name=src]'),
            $mediaResizer = widget.$form.find('.img-resizer'),
            $mediaSpan = widget.$container,
            $img = widget.$original;

        if (mediaEditor) {
            mediaEditor.destroy();
        }

        if ($src.val()) {
            _getMedia(img, $img, function (media) {
                var options = {
                    mediaDimension: {
                        active: true
                    }
                };
                media.$container = $mediaSpan.parents('.widget-box');
                mediaEditor = mediaEditorComponent($mediaResizer, media, options)
                    .on('change', function (nMedia) {
                        media = nMedia;
                        $img.prop('style', null); // not allowed by qti
                        $img.removeAttr('style');
                        img.data('responsive', media.responsive);
                        _(['width', 'height']).each(function(sizeAttr){
                            var val;
                            if (media[sizeAttr] === '' || typeof media[sizeAttr] === 'undefined' || media[sizeAttr] === null){
                                img.removeAttr(sizeAttr);
                                $mediaSpan.css(sizeAttr, '');
                            } else {
                                val = Math.round(media[sizeAttr]);
                                if (media.responsive) {
                                    val += '%';
                                    img.attr(sizeAttr, val);
                                    $img.attr(sizeAttr, '100%');
                                } else {
                                    img.attr(sizeAttr, val);
                                }
                                $mediaSpan.css(sizeAttr, val);
                            }
                            //trigger choice container size adaptation
                            widget.$container.trigger('contentChange.qti-widget');
                        });
                        $img.removeClass('hidden');
                    });
            });
        }
    };

    var _initAdvanced = function(widget){

        var $form = widget.$form,
            src = widget.element.attr('src');

        if(src){
            $form.find('[data-role=advanced]').show();
        }else{
            $form.find('[data-role=advanced]').hide();
        }
    };


    var _initUpload = function(widget){

        var $form = widget.$form,
            options = widget.options,
            img = widget.element,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $src = $form.find('input[name=src]'),
            $alt = $form.find('input[name=alt]');

        var _openResourceMgr = function(){
            $uploadTrigger.resourcemgr({
                title : __('Please select an image file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
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
                    filters : [
                        {'mime':'image/jpeg'},
                        {'mime':'image/png'},
                        {'mime':'image/gif'},
                        {'mime':'image/svg+xml'},
                        {'mime':'application/x-gzip', 'extension':'svgz'}
                    ]
                },
                pathParam : 'path',
                select : function(e, files){
                    var file, alt;
                    var confirmBox, cancel, save;
                    if(files && files.length){
                        file = files[0].file;
                        alt = files[0].alt;
                        $src.val(file);
                        if($.trim($alt.val()) === ''){
                            if(alt === ''){
                                alt = _extractLabel(file);
                            }
                            img.attr('alt', alt);
                            $alt.val(alt).trigger('change');
                        } else {
                            confirmBox = $('.change-alt-modal-feedback', $form);
                            cancel = confirmBox.find('.cancel');
                            save = confirmBox.find('.save');

                            $('.alt-text',confirmBox).html('"' + $alt.val() + '"<br>with<br>"' + alt+'" ?');

                            confirmBox.modal({ width: 500 });

                            save.off('click')
                                .on('click', function () {
                                    img.attr('alt', alt);
                                    $alt.val(alt).trigger('change');
                                    confirmBox.modal('close');
                                });

                            cancel.off('click')
                                .on('click', function () {
                                    confirmBox.modal('close');
                                });
                        }

                        _.defer(function(){
                            img.attr('off-media-editor', 1);
                            $src.trigger('change');
                        });
                    }
                },
                open : function(){
                    // hide tooltip if displayed
                    if($src.data('$tooltip')){
                        $src.blur().data('$tooltip').hide();
                    }
                },
                close : function(){
                    // triggers validation:
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

    return ImgStateActive;
});
