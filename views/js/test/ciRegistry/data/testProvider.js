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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define(['module'], function (module){

    'use strict';

    var baseUrl = module.uri.substring(0, module.uri.indexOf('testProvider'));
    var _registry0 = {
        samplePci : [
            {
                'baseUrl' : baseUrl+'samplePci',
                'typeIdentifier' : 'samplePci',
                'label' : 'Sample Pci',
                'short' : 'sample',
                'description' : 'A simple implementation of custom interaction',
                'version' : '1.0.0',
                'author' : 'Sam Sipasseuth',
                'email' : 'sam@taotesting.com',
                'tags' : [
                    'mcq',
                    'likert'
                ],
                'response' : {
                    'baseType' : 'integer',
                    'cardinality' : 'single'
                },
                'runtime' : {
                    'hook' : 'samplePci/runtime/samplePci.amd.js',
                    'libraries' : [
                        'IMSGlobal/jquery_2_1_1',
                        'samplePci/runtime/js/renderer.js'
                    ],
                    'stylesheets' : [
                        'samplePci/runtime/css/base.css',
                        'samplePci/runtime/css/samplePci.css'
                    ],
                    'mediaFiles' : [
                        'samplePci/runtime/assets/ThumbDown.png',
                        'samplePci/runtime/assets/ThumbUp.png',
                        'samplePci/runtime/css/img/bg.png'
                    ]
                },
                'creator' : {
                    'icon' : 'samplePci/creator/img/icon.svg',
                    'hook' : 'samplePci/pciCreator.js',
                    'libraries' : [
                        'samplePci/creator/tpl/markup.tpl',
                        'samplePci/creator/tpl/propertiesForm.tpl',
                        'samplePci/creator/widget/Widget.js',
                        'samplePci/creator/widget/states/Question.js',
                        'samplePci/creator/widget/states/states.js'
                    ]
                }
            }
        ]
    };

    return {
        load : function load(){
            return _registry0;
        }
    };
});