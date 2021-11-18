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
 * Copyright (c) 2021 Open Assessment Technologies SA
 */

/**
 * Creates a component with language selector
 * that lets you select language for item or specific block.
 *
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoQtiItem/qtiCreator/widgets/component/languageSelector/languageSelector'
], function ($, _, __, componentFactory, languageSelectorTpl) {
    'use strict';

    /**
     * Creates the languageSelector component
     * @param {HTMLElement|jQueryElement} container - where the component is appended
     * @param {Object} [setUpConfig] - configure the component
     * @param {Object} [setUpConfig.lang] - preselected lang
     * @returns {languageSelector} the configured component
     */
    return function languageSelectorFactory(container, setUpConfig) {
        const api = {
            /**
             * Gets access to the item creator
             * @returns {itemCreator}
             */
            getItemCreator() {
                return itemCreator;
            },

            /**
             * Gets access to the area broker
             * @returns {areaBroker}
             */
            getAreaBroker() {
                return areaBroker;
            }
        };
        const languageSelectorComponent = componentFactory(api)
            // set the component's layout
            .setTemplate(languageSelectorTpl)

            .on('init', function(){
              if(container){
                  this.render(container);
              }
            })

            // renders the component
            .on('render', function () {
                const $element = this.getElement();

            })
            .on('destroy', function () {});

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => languageSelectorComponent.init(config));

        return languageSelectorComponent;
    };
});
