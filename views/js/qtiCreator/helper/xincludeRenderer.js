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
    'module',
    'context',
    'lodash',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'core/moduleLoader'
], function (module, context, _, commonRenderer, xincludeLoader, moduleLoader) {
    'use strict';

    const moduleConfig = module.config();
    let xincludeHandlers = [];
    if (moduleConfig.handlers) {
        /*
         * This loads all the modules from module configuration, which are in the `handlers` array.
         */
        moduleLoader({}, _.isFunction)
            .addList(moduleConfig.handlers)
            .load(context.bundle)
            .then(handlers => xincludeHandlers = handlers);
    }

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
            xincludeWidget.$container.attr('contenteditable', false);
            const xinclude = xincludeWidget.element;
            if (newHref) {
                xinclude.attr('href', newHref);
            }
            xincludeLoader.load(xinclude, baseUrl, function (xi, data, loadedClasses) {
                if (data) {
                    const dataBody = data.body.body;
                    const hasClass = dataBody.match(/class="(?<className>tao-\w+)?/); // eslint-disable-line no-console

                    let className = '';
                    if (hasClass && hasClass.groups && hasClass.groups.className) {
                        className = hasClass.groups.className;
                    }
                    //loading success :
                    commonRenderer.get().load(function () {
                        //set commonRenderer to the composing elements only (because xinclude is "read-only")
                        _.forEach(xinclude.getComposingElements(), function (elt) {
                            elt.setRenderer(commonRenderer.get());
                        });

                        //reload the wiget to rfresh the rendering with the new href
                        xincludeWidget.refresh();
                    }, loadedClasses);
                    xincludeHandlers.forEach(handler => handler(xinclude.attr('href'), className, xi.serial));
                } else {
                    //loading failure :
                    xinclude.removeAttr('href');
                }
            });
        },
        /**
         * Return xinclude handlers
         * @returns {Array}
         */
        getXincludeHandlers: function getXincludeHandlers() {
            return xincludeHandlers;
        }
    };
});
