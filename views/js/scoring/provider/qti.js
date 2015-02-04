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
 * Copyright (c) 2015 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Provides the QTI implementation for the scoring.
 * The provider needs to be registered into the {@link taoItems/scoring/api/scorer}.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function(){
    'use strict';

    /**
     * The QTI scoring provider.
     * @exports taoQtiItem/scoring/provider/qti
     */
    var qtiScoringProvider = {

        /**
         * Process the score from the response.
         *
         * @param {Object} response - we expect a response formated using the PCI
         * @param {Object} itemData - we expect the whole itemData in the QTI context.
         * @param {Function} done - callback with the produced outcome
         * @see {@link http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343} for the response format.
         * @this {taoItems/scoring/api/scorer} the scorer calls are delegated here, the context is the scorer's context with event mehods available.
         */
        process : function process(response, itemData, done){

        },
    };

    return qtiScoringProvider;
});
