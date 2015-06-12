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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'i18n',
    'taoQtiItem/apipCreator/editor/form/formHelper',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/signing',
    'helpers',
    'ui/resourcemgr'
], function (__, formHelper, formTpl, helpers) {
    'use strict';

    function Form(accessElementInfo) {
        this.accessElementInfo = accessElementInfo;
    }

    Form.prototype.render = function render() {
        var type = this.accessElementInfo.data.children[0].localName,
            tplData = {
                "fileHref" : this.accessElementInfo.getAttribute(type + '.videoFileInfo.fileHref'),
                "startCue" : this.accessElementInfo.getAttribute(type + '.videoFileInfo.startCue'),
                "endCue" : this.accessElementInfo.getAttribute(type + '.videoFileInfo.endCue'),
                "type" : type
            };
        return formTpl(tplData);
    };

    /**
     * Initialize resource manager (for uploading and selecting video files)
     * @param {object} $container jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initResourceMgr = function initResourceMgr($container) {
        var that = this,
            type = that.accessElementInfo.data.children[0].localName,
            $src = $container.find('input[name*="videoFileInfo.fileHref"]'),
            $uploadTrigger = $container.find('.selectMediaFile');

        $uploadTrigger.on('click', function () {
            $uploadTrigger.resourcemgr({
                title : __('Please select a video file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                appendContainer : '#mediaManager',
                mediaSourcesUrl : helpers._url('getMediaSources', 'QtiCreator', 'taoQtiItem'),
                browseUrl : helpers._url('files', 'ItemContent', 'taoItems'),
                uploadUrl : helpers._url('upload', 'ItemContent', 'taoItems'),
                deleteUrl : helpers._url('delete', 'ItemContent', 'taoItems'),
                downloadUrl : helpers._url('download', 'ItemContent', 'taoItems'),
                fileExistsUrl : helpers._url('fileExists', 'ItemContent', 'taoItems'),
                params : {
                    uri : that.accessElementInfo.apipItem.options.id,
                    lang : "en-US", //TODO set user language
                    filters : 'video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,application/octet-stream'
                },
                pathParam : 'path',
                select : function (e, files) {
                    if (files && files.length) {
                        that.accessElementInfo.setAttribute(type + '.videoFileInfo.mimeType', files[0].mime);
                        $src.val(files[0].file).trigger('change');
                    }
                }
            });
        });
    };

    /**
     * Initialize form events.
     * @param {object} $container jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initEvents = function initEvents($container) {
        formHelper.initEvents(this, $container);
        this.initResourceMgr($container);
    };

    return Form;
});