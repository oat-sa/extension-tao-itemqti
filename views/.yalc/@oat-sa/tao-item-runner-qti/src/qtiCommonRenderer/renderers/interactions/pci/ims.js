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
 * Copyright (c) 2017-2021 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
import _ from 'lodash';
import loggerFactory from 'core/logger';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instanciator from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/instanciator';

import sharedContext from 'context';

const logger = loggerFactory('taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/ims');

const pciDoneCallback = pci => {
    //standard callback function to be implemented in a future story
    logger.info('pciDoneCallback called on PCI ' + pci.typeIdentifier);
};

/**
 * Key under the IMS PCI constructor is stored on interaction
 */
const pciConstructorDataKey = 'pciConstructor';

export default function defaultPciRenderer(runtime) {
    return {
        getRequiredModules() {
            const requireEntries = [];
            // load modules
            _.forEach(runtime.modules, function (module, name) {
                requireEntries.push(name);
            });
            return requireEntries;
        },
        /**
         * Saves the original IMS PCI module to be able to reinstanciate later
         * @param {Object} interaction
         * @param {Object} pciConstructor
         */
        setPCIConstructor(interaction, pciConstructor) {
            interaction.data(pciConstructorDataKey, pciConstructor);
        },
        /**
         * Returns with original IMS PCI module
         * @param {Object} interaction
         */
        getPCIConstructor(interaction) {
            return interaction.data(pciConstructorDataKey);
        },
        createInstance(interaction, context) {
            let pciConstructor = this.getPCIConstructor(interaction);

            //get interaction xml:lang prop to put it into pci instance config
            const contentLanguage = interaction.attributes && interaction.attributes.language;
            const itemLanguage = interaction.rootElement && interaction.rootElement.attributes && interaction.rootElement.attributes['xml:lang'];
            const language = contentLanguage || itemLanguage;
            const userLanguage = sharedContext && sharedContext.locale;

            const properties = _.assign(_.clone(interaction.properties), {language, userLanguage});

            // save original IMS PCI module first time to be able to reinstanciate later if necessary
            if (!pciConstructor) {
                pciConstructor = instanciator.getPci(interaction);
                this.setPCIConstructor(interaction, pciConstructor);
            }

            // serialize any array or object properties
            _.forOwn(properties, function (propVal, propKey) {
                properties[propKey] = _.isArray(propVal) || _.isObject(propVal) ? JSON.stringify(propVal) : propVal;
            });

            let pciReadyCallback;
            const readyPromise = new Promise(resolve => {
                pciReadyCallback = resolve;
            });

            const config = {
                properties,
                templateVariables: {}, //not supported yet
                boundTo: context.response || {},
                onready: pciReadyCallback,
                ondone: pciDoneCallback,
                status: 'interacting' //only support interacting state currently(TODO: solution, review),
            };

            pciConstructor.getInstance(containerHelper.get(interaction).get(0), config, context.state);

            return readyPromise.then(instance => {
                instanciator.setPci(interaction, instance);
                return instance;
            });
        },
        destroy: function destroy(interaction) {
            instanciator.getPci(interaction).oncompleted();
        },
        /**
         * IMS PCI does not have setState, so PCI should be destroyed and reinstanciated with response.
         * This function should run only in review mode.
         * @param {Object} interaction
         * @param {Object} state - state that should be set
         * @returns {Promise<Object>} - Resolves with newly created instance
         */
        setReviewState(interaction, state) {
            this.destroy(interaction);
            return this.createInstance(interaction, { response: { RESPONSE: state.response } });
        },
        setState: _.noop,
        getState(interaction) {
            return instanciator.getPci(interaction).getState();
        }
    };
}
