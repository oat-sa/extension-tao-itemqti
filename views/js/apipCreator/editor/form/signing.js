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
    'taoQtiItem/apipCreator/editor/form/formHelper',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/signing'
], function (formHelper, formTpl) {
    'use strict';

    function Form(accessElementInfo, options) {
        this.accessElementInfo = accessElementInfo;
        this.options = options;
    }

    Form.prototype.render = function render(options) {
        var tplData = {
            "fileHref" : this.accessElementInfo.getAttribute(this.options.type + '.videoFileInfo.fileHref'),
            "startCue" : this.accessElementInfo.getAttribute(this.options.type + '.videoFileInfo.startCue'),
            "endCue" : this.accessElementInfo.getAttribute(this.options.type + '.videoFileInfo.endCue'),
            "type" : this.options.type
        };
        return formTpl(tplData);
    };

    /**
     * Initialize form events.
     * @param {object} $container jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initEvents = function initEvents($container) {
        var that = this;
        
        formHelper.initEvents(this, $container);
        formHelper.initResourceMgr(this, $container, {
            params : {
                filters : 'video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,application/octet-stream'
            },
            select : function (e, files) {
                if (files && files.length) {
                    that.accessElementInfo.setAttribute(that.options.type + '.videoFileInfo.mimeType', files[0].mime);
                    $container.find('input[name*="videoFileInfo.fileHref"]').val(files[0].file).trigger('change');
                }
            },
            $uploadTrigger : $container.find('.selectMediaFile')
        });
    };

    return Form;
});