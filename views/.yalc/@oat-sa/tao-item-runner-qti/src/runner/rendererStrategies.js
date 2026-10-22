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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

import loggerFactory from 'core/logger';
import providerRegistry from 'core/providerRegistry';
import qtiRenderer from 'taoQtiItem/qtiCommonRenderer/renderers/rendererProvider';
import reviewRenderer from 'taoQtiItem/reviewRenderer/renderers/rendererProvider';

const logger = loggerFactory('taoQtiItem/runner/rendererStrategies');

/**
 * The default renderer provider. It should be the QTI common renderer.
 * @type string
 */
const defaultRenderer = qtiRenderer.name;

/**
 * Alias mapping for particular names.
 * Gives the appropriate renderer based on the IMS view property.
 * Read more about IMS view here:
 * https://www.imsglobal.org/question/qtiv2p2p2/QTIv2p2p2-ASI-InformationModelv1p0/imsqtiv2p2p2_asi_v1p0_InfoModelv1p0.html#FigEnumeratedListClass_DataModel_View
 *
 * @type {Object}
 */
const alias = {
    author: qtiRenderer.name,
    candidate: qtiRenderer.name,
    proctor: reviewRenderer.name,
    scorer: reviewRenderer.name,
    testConstructor: qtiRenderer.name,
    tutor: reviewRenderer.name
};

/**
 * Gets the name of an existing renderer.
 * If the wanted renderer does not exist, it will fallback to the default one.
 * A warning will be issue for unknown names.
 * @param {String} name
 * @returns {String}
 */
function getProviderName(name) {
    const providers = rendererStrategies.getAvailableProviders();

    if (providers.includes(name)) {
        return name;
    }

    if (alias[name]) {
        return alias[name];
    }

    if (name) {
        logger.warn(`Unknown QTI Item Runner renderer ${name}!`);
    }

    return defaultRenderer;
}

/**
 * This renderer manager registers two different renderers at the moment:
 * - qtiCommonRenderer: Standard renderer used for test taker view
 * - reviewRenderer: This renderer is meant to render items in review mode (which is ready-only with some enhancement)
 *
 * @param {string} rendererName
 * @returns {*|{init(): *, getRenderer(): *}|init}
 */
export default function rendererStrategies(rendererName) {
    const providerName = getProviderName(rendererName);
    const provider = rendererStrategies.getProvider(providerName);
    const renderer = {
        /**
         * Initializes the renderer.
         * @returns {renderer}
         */
        init() {
            provider.init.call(this);
            return this;
        },

        /**
         * Gets the renderer's name
         * @returns {String}
         */
        getName() {
            return provider.name;
        },

        /**
         * Gets the renderer
         * @returns {renderer}
         */
        getRenderer() {
            return provider.getRenderer();
        }
    };

    return renderer.init();
}

providerRegistry(rendererStrategies);

rendererStrategies.registerProvider(qtiRenderer.name, qtiRenderer);
rendererStrategies.registerProvider(reviewRenderer.name, reviewRenderer);
