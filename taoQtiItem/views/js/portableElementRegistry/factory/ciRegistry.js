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
 * Copyright (c) 2016-2022 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/portableElementRegistry/factory/factory',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function (_, __, portableElementRegistry, qtiElements) {
    'use strict';

    /**
     * Create a new interaction registry instance
     * interaction registry need to register newly loaded creator hooks in the list of available qti authoring elements
     *
     * @returns {Object} registry instance
     */
    return function customInteractionRegistry() {
        return portableElementRegistry({
            /**
             * Get the authoring information for a given custom interaction
             * @param {string} typeIdentifier - the interaction type identifier
             * @param {Object} [options]
             * @param {string|number} [options.version] - the interaction version
             * @param {boolean} [options.enabledOnly] - to only get interaction enabled && visible
             * @returns {Object} the authoring info
             */
            getAuthoringData(typeIdentifier, options = {}) {
                options = _.defaults(options || {}, { version: 0, enabledOnly: false });
                const pciModel = this.get(typeIdentifier, options.version);
                const qtiClass = `customInteraction.${pciModel.typeIdentifier}`;
                if (
                    pciModel &&
                    pciModel.creator &&
                    pciModel.creator.hook &&
                    pciModel.creator.icon &&
                    ((pciModel.enabled && qtiElements.isVisible(qtiClass)) || !options.enabledOnly)
                ) {
                    return {
                        label: pciModel.label, //currently no translation available
                        icon: pciModel.creator.icon.replace(new RegExp(`^${typeIdentifier}/`), pciModel.baseUrl),
                        short: pciModel.short,
                        description: pciModel.description,
                        qtiClass, //custom interaction is block type
                        tags: _.union([__('Custom Interactions')], pciModel.tags),
                        group: 'custom-interactions'
                    };
                }
            }
        }).on('creatorsloaded', function () {
            const creators = this.getLatestCreators();
            _.forEach(creators, function (creator, typeIdentifier) {
                qtiElements.classes[`customInteraction.${typeIdentifier}`] = {
                    parents: ['customInteraction'],
                    qti: true
                };
            });
        });
    };
});
