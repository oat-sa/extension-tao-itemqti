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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'ui/component',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditorTarget'
], function(_, $, componentFactory, htmlEditor, contentHelper, tpl) {
    'use strict';


    var defaultConfig = {

    };



    return function tooltipEditorContentFactory(config) {
        var tooltip,
            tooltipEditorComponent,
            widget;

        var tooltipEditorApi = {
            buildEditor: function buildEditor() {
                var self = this,
                    $component = self.getElement();

                if(!htmlEditor.hasEditor($component)){
                    htmlEditor.buildEditor($component, {
                        placeholder: '',
                        change : function(newBody) {
                            tooltip.body(newBody); //todo: throttle this or send event with data to upper component
                        },
                        removePlugins: 'magicline',
                        data : {
                            container : tooltip,
                            widget : widget
                        },
                        blur : function(){
                            widget.changeState('sleep');
                        }
                    });
                }
            },

            destroyEditor: function destroyEditor() {
                var self = this,
                    $component = self.getElement();

                htmlEditor.destroyEditor($component);
            }
        };
        config = _.defaults(config || {}, defaultConfig);

        /**
         *
         */
        tooltipEditorComponent = componentFactory(tooltipEditorApi, config)
            .setTemplate(tpl)
            .on('init', function() {
                if (!this.config.tooltip) {
                    throw new Error('tooltip instance must be given in the config');
                }
                tooltip = this.config.tooltip;
                widget = tooltip.data('widget');

                // set templates variables
                this.config.target = tooltip.body();
            })
            .on('render', function() {
                // var self = this,
                //     $component = self.getElement();
            })
            .on('destroy', function() {
                this.destroyEditor();
            });

        return tooltipEditorComponent.init();
    };
});