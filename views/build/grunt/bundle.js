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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA;
 */

/**
 * Configure the extension bundles
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 * @param {Object} grunt - the grunt objectt (by convention)
 */
module.exports = function (grunt) {
    'use strict';

    grunt.config.merge({
        bundle: {
            taoqtiitem: {
                options: {
                    extension: 'taoQtiItem',
                    dependencies: ['taoItems'],
                    allowExternal: ['qtiCustomInteractionContext', 'qtiInfoControlContext'],
                    paths: require('./paths.json'),
                    bundles: [
                        {
                            name: 'taoQtiItem',
                            default: true,
                            babel: true,
                            //we need to list the dependencies manually, since the
                            //sources contains tests in subfolders
                            include: [
                                'taoQtiItem/mathRenderer/mathRenderer',
                                'taoQtiItem/portableElementRegistry/**/*',
                                'taoQtiItem/qtiCommonRenderer/**/*',
                                'taoQtiItem/reviewRenderer/**/*',
                                'taoQtiItem/qtiCreator/**/*',
                                'taoQtiItem/qtiItem/**/*',
                                'taoQtiItem/qtiRunner/**/*',
                                'taoQtiItem/qtiXmlRenderer/**/*',
                                'qtiCustomInteractionContext',
                                'qtiInfoControlContext'
                            ]
                        },
                        {
                            name: 'taoQtiItemRunner',
                            babel: true,
                            include: [
                                'taoQtiItem/qtiCommonRenderer/**/*',
                                'taoQtiItem/qtiItem/**/*',
                                'taoQtiItem/runner/**/*',
                                'qtiCustomInteractionContext',
                                'qtiInfoControlContext',
                                'taoQtiItem/qtiCreator/helper/xincludeLoader'
                            ],
                            dependencies: ['taoItems/loader/taoItemsRunner.min']
                        },
                        {
                            name: 'taoQtiItemRunner.es5',
                            babel: true,
                            targets: {
                                ie: '11'
                            },
                            include: [
                                'taoQtiItem/qtiCommonRenderer/**/*',
                                'taoQtiItem/qtiItem/**/*',
                                'taoQtiItem/runner/**/*',
                                'qtiCustomInteractionContext',
                                'qtiInfoControlContext'
                            ],
                            dependencies: ['taoItems/loader/taoItemsRunner.es5.min']
                        },
                        {
                            name: 'qtiLoader',
                            bootstrap: true,
                            babel: true,
                            entryPoint: 'taoQtiItem/runtime/qtiLoader',
                            dependencies: ['taoQtiItem/loader/taoQtiItem.min']
                        }
                    ]
                }
            }
        }
    });

    grunt.registerTask('taoqtiitembundle', ['bundle:taoqtiitem']);
};
