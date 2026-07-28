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
define([], function (){

    'use strict';

    var baseUrl = window.location.origin + '/taoQtiItem/views/js/test/ciRegistry/data/';
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
                },
                'enabled' : true
            }
        ],
        samplePciDisabled : [
            {
                'baseUrl' : baseUrl+'samplePciDisabled',
                'typeIdentifier' : 'samplePciDisabled',
                'label' : 'Disabled Pci',
                'short' : 'disabled',
                'description' : 'A simple implementation of custom interaction that is disabled',
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
                    'hook' : 'samplePciDisabled/runtime/samplePci.amd.js',
                    'libraries' : [
                        'IMSGlobal/jquery_2_1_1',
                        'samplePciDisabled/runtime/js/renderer.js'
                    ],
                    'stylesheets' : [
                        'samplePciDisabled/runtime/css/base.css',
                        'samplePciDisabled/runtime/css/samplePci.css'
                    ],
                    'mediaFiles' : [
                        'samplePciDisabled/runtime/assets/ThumbDown.png',
                        'samplePciDisabled/runtime/assets/ThumbUp.png',
                        'samplePciDisabled/runtime/css/img/bg.png'
                    ]
                },
                'creator' : {
                    'icon' : 'samplePciDisabled/creator/img/icon.svg',
                    'hook' : 'samplePciDisabled/pciCreator.js',
                    'libraries' : [
                        'samplePciDisabled/creator/tpl/markup.tpl',
                        'samplePciDisabled/creator/tpl/propertiesForm.tpl',
                        'samplePciDisabled/creator/widget/Widget.js',
                        'samplePciDisabled/creator/widget/states/Question.js',
                        'samplePciDisabled/creator/widget/states/states.js'
                    ]
                },
                'enabled' : false
            }
        ]
    };

    return {
        load : function load(){
            return _registry0;
        }
    };
});