/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/object',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'ui/mediaEditor/mediaEditorComponent',
    'ui/previewer',
    'ui/resourcemgr',
    'ui/tooltip'
], function(_, $, __, stateFactory, Active, formTpl, formElement, inlineHelper, mediaEditorComponent){
    'use strict';
    /**
     * media Editor instance if has been initialized
     * @type {null}
     */
    var mediaEditor = null;

    var _config = {
        renderingThrottle : 1000,
        fileFilters : 'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,audio/mp3,audio/vnd.wav,audio/ogg,audio/vorbis,audio/webm,audio/mpeg,application/ogg,audio/aac,application/pdf'
    };

    var ObjectStateActive = stateFactory.extend(Active, function(){
        this.initForm();
    }, function(){
        this.widget.$form.empty();
    });

    var refreshRendering = _.throttle(function refreshRendering(widget){
        var obj = widget.element;
        var $container = widget.$original;
        var previewOptions = {
            url : obj.renderer.resolveUrl(obj.attr('data')),
            mime : obj.attr('type')
        };
        if(obj.attr('height')){
            previewOptions.height = obj.attr('height');
        }
        previewOptions.width = obj.attr('width') || '100%';
        previewOptions.height = obj.attr('height') || 'auto';
        if(previewOptions.url && previewOptions.mime){
            $container.previewer(previewOptions);
        }
    }, _config.renderingThrottle);

    ObjectStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            qtiObject = _widget.element,
            baseUrl = _widget.options.baseUrl;

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            src : qtiObject.attr('data'),
            alt : qtiObject.attr('alt'),
            height : qtiObject.attr('height'),
            width : qtiObject.attr('width')
        }));

        //init resource manager
        _initUpload(_widget);

        //init standard ui widget
        formElement.initWidget($form);

        const $panelObjectSize = $('.size-panel', $form);
        const $panelMediaSize = $('.media-size-panel', $form);

        const setMediaSizeEditor = () => {
            const type = qtiObject.attr('type');
            if (/video/.test(type)) {
                const $container = _widget.$original;
                $panelObjectSize.hide();
                $panelMediaSize.show();
                const mediaplayer = $container.data('player');
                mediaplayer.off('ready').on('ready', function() {
                    let width = qtiObject.attr('width');
                    let height = qtiObject.attr('height');
                    const originalSize = mediaplayer.getMediaOriginalSize();
                    const containerWidth = $('.qti-itemBody').width();
                    // the default % and by that the size of the video is based on the original video size compared to the container size
                    if (!width) {
                        width = Math.round(100 / (containerWidth / originalSize.width));
                        height = 0;
                    } else if (!/%/.test(width) || height) {
                        // for old format (px and height is set) the default % is calculated on rendered width and height
                        const scaleHeight = (Math.max(height || 0, 200) - $container.find('.mediaplayer .controls').height()) / originalSize.height;
                        const scaleWidth = Math.max(width || 0, 200) / originalSize.width;
                        const scale = Math.min(scaleHeight, scaleWidth);
                        width = Math.round(100 / (containerWidth / (scale * originalSize.width)));
                        qtiObject.removeAttr('height');
                        height = 0;
                    }
                    const onChange = _.debounce((nMedia) => {
                        if (qtiObject.attr('width') !== (nMedia['width'] + '%')) {
                            qtiObject.attr('width', Math.round(nMedia['width']) + '%');
                            refreshRendering(_widget);
                        }
                    }, 200);
                    if (mediaEditor) {
                        mediaEditor.destroy();
                    }
                    mediaEditor = mediaEditorComponent($panelMediaSize,
                        {
                            $node: $container.find('.mediaplayer video'),
                            $container: $container,
                            type: qtiObject.attr('type'),
                            width,
                            height,
                            responsive: true
                        },
                        {
                            mediaDimension: {
                                active: true,
                                showResponsiveToggle: false
                            }
                        })
                    .on('change', onChange);
                });
            } else {
                $panelObjectSize.show();
                $panelMediaSize.hide();
            }
        };

        setMediaSizeEditor();

        //init data change callbacks
        formElement.setChangeCallbacks($form, qtiObject, {
            src : function(object, value){
                qtiObject.attr('data', value);
                inlineHelper.togglePlaceholder(_widget);
                refreshRendering(_widget);
                setMediaSizeEditor();
            },
            width : function(object, value){
                var val = parseInt(value, 10);
                if(_.isNaN(val)){
                    qtiObject.removeAttr('width');
                }else{
                    qtiObject.attr('width', val);
                }
                refreshRendering(_widget);
            },
            height : function(object, value){
                var val = parseInt(value, 10);
                if(_.isNaN(val)){
                    qtiObject.removeAttr('height');
                }else{
                    qtiObject.attr('height', val);
                }
                refreshRendering(_widget);
            },
            alt : function(qtiObject, value){
                qtiObject.attr('alt', value);
            },
            align : function(qtiObject, value){
                inlineHelper.positionFloat(_widget, value);
            }
        });

    };

    var _initUpload = function(widget){

        var $form = widget.$form,
            options = widget.options,
            qtiObject = widget.element,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $src = $form.find('input[name=src]');

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
                    filters : _config.fileFilters
                },
                pathParam : 'path',
                select : function(e, files){
                    var file, type;
                    if(files && files.length){
                        file = files[0].file;
                        type = files[0].mime;
                        qtiObject.attr('type', type);
                        $src.val(file).trigger('change');
                    }
                },
                open : function(){
                    //hide tooltip if displayed
                    if($src.data('$tooltip')){
                        $src.blur().data('$tooltip').hide();
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