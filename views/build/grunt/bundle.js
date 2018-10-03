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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA;
 */

/**
 * Configure the extension bundles
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
module.exports = function(grunt) {
    'use strict';
    var root        = grunt.option('root');

    grunt.config.merge({
        bundle : {
            taoqtiitem : {
                options : {
                    extension : 'taoQtiItem',
                    dependencies : ['taoItems'],
                    allowExternal : ['qtiCustomInteractionContext', 'qtiInfoControlContext'],
                    paths : {
                        'qtiCustomInteractionContext' : root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
                        'qtiInfoControlContext' : root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext',
                    },
                    bundles : [{
                        name : 'taoQtiItem',
                        default : true,

                        //we need to list the dependencies manually, since the
                        //sources contains tests in subfoldesr
                        include : [
                            'taoQtiItem/mathRenderer/mathRenderer',
                            'taoQtiItem/portableElementRegistry/**/*',
                            'taoQtiItem/qtiCommonRenderer/**/*',
                            'taoQtiItem/qtiCreator/**/*',
                            'taoQtiItem/qtiItem/**/*',
                            'taoQtiItem/qtiRunner/**/*',
                            'taoQtiItem/qtiXmlRenderer/**/*',
                            'qtiCustomInteractionContext',
                            'qtiInfoControlContext'
                        ]
                    }, {
                        name : 'taoQtiItemRunner',
                        include : [
                            'taoQtiItem/qtiCommonRenderer/**/*',
                            'taoQtiItem/qtiItem/**/*',
                            'taoQtiItem/runner/**/*',
                            'qtiCustomInteractionContext',
                            'qtiInfoControlContext'
                        ],
                        dependencies : ['taoItems/loader/taoItemsRunner.min']
                    }, {
                        name : 'qtiLoader',
                        bootstrap: true,
                        entryPoint: 'taoQtiItem/runtime/qtiLoader',
                        dependencies : ['taoQtiItem/loader/taoQtiItem.min']
                    }]
                }
            }
        }
    });

    grunt.registerTask('taoqtiitembundle', ['bundle:taoqtiitem']);

};
