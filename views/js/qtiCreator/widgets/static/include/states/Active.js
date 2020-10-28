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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technlogies SA
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/include',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/xincludeRenderer',
    'util/typeCaster',
    'ui/resourcemgr',
    'ui/tooltip',
], function($, _, __, stateFactory, Active, formTpl, formElement, xincludeRenderer, typeCaster){
    'use strict';

    var scrollingHeights = [{
        value: '100',
        name: 'Full height'
    }, {
        value: '75',
        name: '3/4 of height'
    }, {
        value: '66.6666',
        name: '2/3 of height'
    }, {
        value: '50',
        name: 'Half height'
    }, {
        value: '33.3333',
        name: '1/3 of height'
    }, {
        value: '25',
        name: '1/4 of height'
    }];

    var IncludeStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    IncludeStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            include = _widget.element,
            baseUrl = _widget.options.baseUrl,
            $wrap = _widget.$container.parent('.text-block-wrap'),
            isScrolling = typeCaster.strToBool($wrap.length > 0 ? $wrap.attr('data-scrolling') : 'false'),
            selectedHeight = $wrap.attr('data-scrolling-height');

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            href : include.attr('href'),
            scrolling: isScrolling,
            scrollingHeights: scrollingHeights,
            selectedHeight: selectedHeight
        }));

        isScrolling ? $form.find('.scrollingSelect').show() : $form.find('.scrollingSelect').hide();
        selectedHeight && $form.find('.scrollingSelect select').val(selectedHeight).change();

        //init slider and set align value before ...
        _initUpload(_widget);

        //... init standard ui widget
        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, _widget.element, {
            scrolling: function (element, value) {
                var $wrap = _widget.$container.parent('.text-block-wrap');
                var $form = _widget.$form;

                if (!$wrap.length) {
                    $wrap = _widget.$container
                        .wrap('<div class="text-block-wrap" />')
                        .parent();
                }

                value ? $form.find('.scrollingSelect').show() : $form.find('.scrollingSelect').hide();

                $wrap.attr('data-scrolling', value);
            },
            scrollingHeight: function (element, value) {
                var $wrap = _widget.$container.parent('.text-block-wrap');

                $wrap.attr('data-scrolling-height', value);
            }
        });

    };

    var _initUpload = function(widget){

        var $form = widget.$form,
            options = widget.options,
            $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
            $href = $form.find('input[name=href]');

        var _openResourceMgr = function(){
            $uploadTrigger.resourcemgr({
                title : __('Please select a shared stimulus file from the resource manager.'),
                appendContainer : options.mediaManager.appendContainer,
                mediaSourcesUrl : options.mediaManager.mediaSourcesUrl+'?exclude=local',
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                fileExistsUrl : options.mediaManager.fileExistsUrl,
                disableUpload : true,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    filters : 'application/qti+xml'
                },
                pathParam : 'path',
                select : function(e, files){

                    var file;

                    if(files && files.length){

                        file = files[0].file;
                        $href.val(file);

                        //set the selected file as the new href and refresh rendering
                        xincludeRenderer.render(widget, options.baseUrl, file);

                        _.defer(function(){
                            $href.trigger('change');
                        });
                    }
                },
                open : function(){
                    //hide tooltip if displayed
                    if($href.data('$tooltip')){
                        $href.blur().data('$tooltip').hide();
                    }
                },
                close : function(){
                    //triggers validation :
                    $href.blur();
                }
            });
        };

        $uploadTrigger.on('click', _openResourceMgr);
        $href.on('click', _openResourceMgr);//href input is read only

        //if empty, open file manager immediately
        if(!$href.val()){
            _openResourceMgr();
        }

    };

    return IncludeStateActive;
});
