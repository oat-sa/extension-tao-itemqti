/**
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
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'uri',
    'util/url',
    'core/dataProvider/request'
], function ($, _, commonRenderer, xincludeLoader, uri, urlUtil, request) {
    'use strict';

    return {
        /**
         * Render (or re-render) the xinclude widget based on the current href and givenBaseUrl
         *
         * @param {Object} xincludeWidget
         * @param {String} baseUrl
         * @param {String} newHref
         * @returns {undefined}
         */
        render: function render(xincludeWidget, baseUrl, newHref) {
            const xinclude = xincludeWidget.element;
            if (newHref) {
                xinclude.attr('href', newHref);
            }

            xincludeLoader.load(xinclude, baseUrl, function (xi, data, loadedClasses) {
                if (data) {
                    //loading success :
                    commonRenderer.get().load(function () {
                        //set commonRenderer to the composing elements only (because xinclude is "read-only")
                        _.each(xinclude.getComposingElements(), function (elt) {
                            elt.setRenderer(commonRenderer.get());
                        });

                        //reload the wiget to rfresh the rendering with the new href
                        xincludeWidget.refresh();
                    }, loadedClasses);
                    const passageHref = xinclude.attr('href');
                    if (/taomedia:\/\/mediamanager\//.test(passageHref)) {
                        // check rich passage styles and inject them to item
                        const passageUri = uri.decode(passageHref.replace('taomedia://mediamanager/', ''));
                        request(urlUtil.route('getStylesheets', 'SharedStimulusStyling', 'taoMediaManager'), {
                            uri: passageUri
                        }).then(response => {
                            response.forEach(element => {
                                const styleElem = $('<link>', {
                                    rel: 'stylesheet',
                                    type: 'text/css',
                                    href: urlUtil.route('loadStylesheet', 'SharedStimulusStyling', 'taoMediaManager', {
                                        uri: passageUri,
                                        stylesheet: element
                                    })
                                });
                                $('head').append(styleElem);
                            });
                        }).catch();
                    }
                } else {
                    //loading failure :
                    xinclude.removeAttr('href');
                }
            });
        }
    };
});
