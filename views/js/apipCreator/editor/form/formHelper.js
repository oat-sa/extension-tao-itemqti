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
    'jquery',
    'lodash',
    'i18n',
    'ui/feedback',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector',
    'helpers',
    'context',
    'ui/formValidator/formValidator',
    'ui/resourcemgr'
], function ($, _, __, feedback, inclusionOrderSelector, helpers, context, FormValidator) {
    'use strict';
    
    var _ns = '.apip-form';
    
    /**
     * Get access element info attribute value. 
     * 
     * If access element exists in the model then value from the model will be returned.
     * Otherwise qti element content (text) will be returned.
     * 
     * @param {object} formInstance
     * @param {atring} attributeName
     * @returns {string}
     */
    function getAttributeValue(formInstance, attributeName) {
        var aeInfo = formInstance.accessElementInfo,
            ae = aeInfo.getAssociatedAccessElement(),
            qtiElements,
            result = formInstance.accessElementInfo.getAttribute(attributeName);

        if (!result) {
            qtiElements = ae.getQtiElements();
            if (qtiElements.length) {
                result = $(qtiElements[0].data).text().trim();
            }
        }

        return result;
    }

    /**
     * Initialize access element info authoring form.
     * @param {object} formInstance
     * @param {jQueryElement} $container
     * @fires change.apip-form
     * @fires delete.apip-form
     * @returns {undefined}
     */
    function initEvents(formInstance, $container) {
        var aeInfo = formInstance.accessElementInfo;

        $container.on('change', 'input,textarea,select', function () {
            var $input = $(this),
                name = $input.attr('name'),
                value = $input.val();

            aeInfo.setAttribute(name, value);

            $input.trigger('change'+_ns, [aeInfo, name, value]);
        });

        $container.on('click', '.delete', function () {
            removeAssociatedAccessElement(formInstance);
            feedback().info('Access element removed.');
            $container.trigger('destroy'+_ns);
        });
    }

    /**
     * Remove access element
     * @param {object} formInstance
     */
    function removeAssociatedAccessElement(formInstance) {
        var aeInfo = formInstance.accessElementInfo;

        var ae = aeInfo.getAssociatedAccessElement();

        aeInfo.remove();
        ae.removeInclusionOrder(inclusionOrderSelector.getValue());

        if (ae.getAccessElementInfo() === null) {
            ae.remove();
        }
    }

    /**
     * Initialize form validator
     * @param {jQuery} $container
     * @return {object} - form validator instance
     */
    function initValidator($container) {
        return new FormValidator({
            container : $container,
            highlighter : {
                type : 'tooltip'
            }
        });
    }

    /**
     * Initialize resource manager (for uploading and selecting video files)
     * @param {object} formInstance
     * @param {jQueryElement} $container Popup container
     * @param {object} options resource manager options
     * @returns {undefined}
     */
    function initResourceMgr(formInstance, $container, options) {
        var defaultOptions = {
                title : __('Please select a video file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                appendContainer : '#mediaManager',
                mediaSourcesUrl : helpers._url('getMediaSources', 'QtiCreator', 'taoQtiItem'),
                browseUrl : helpers._url('files', 'ItemContent', 'taoItems'),
                uploadUrl : helpers._url('upload', 'ItemContent', 'taoItems'),
                deleteUrl : helpers._url('delete', 'ItemContent', 'taoItems'),
                downloadUrl : helpers._url('download', 'ItemContent', 'taoItems'),
                fileExistsUrl : helpers._url('fileExists', 'ItemContent', 'taoItems'),
                params : {
                    uri : formInstance.accessElementInfo.apipItem.options.id,
                    lang : context.locale,
                    filters : 'video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,application/octet-stream'
                },
                pathParam : 'path'
            };
            
        options = _.merge(defaultOptions, options);

        options.$uploadTrigger.on('click', function () {
            options.$uploadTrigger.resourcemgr(options);
        });
    }

    return {
        getAttributeValue : getAttributeValue,
        initEvents : initEvents,
        initValidator : initValidator,
        initResourceMgr : initResourceMgr,
        removeAssociatedAccessElement : removeAssociatedAccessElement
    };
});