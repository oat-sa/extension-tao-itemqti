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
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/editorField'
], function(_, $, componentFactory, htmlEditor, contentHelper, tpl) {
    'use strict';

    /**
     * @param {Element} tooltip - the tooltip instance
     * @param {String} config.content - content of the field
     * @param {String} config.title - css class of the editable field
     * @param {String} config.class - title attribute of the editable field
     * @param {Function} config.change - the editor change callback
     */
    return function editorFieldFactory(config) {
        var tooltip,
            EditorFieldComponent,
            widget;

        var EditorFieldApi = {
            buildEditor: function buildEditor() {
                var self = this,
                    $component = self.getElement(),
                    changeCallback = _.noop;

                if (_.isFunction(self.config.change)) {
                    changeCallback = _.throttle(function(data) {
                        self.config.change.call(self, data);
                    }, 500);
                }

                if(!htmlEditor.hasEditor($component)){
                    htmlEditor.buildEditor($component, {
                        placeholder: '',
                        change : changeCallback,
                        removePlugins: 'magicline,taotooltip',
                        data : {
                            container : tooltip,
                            widget : widget
                        },
                        toolbar : [
                            {
                                name : 'basicstyles',
                                items : ['Bold', 'Italic', 'Subscript', 'Superscript']
                            }
                        ],
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

        EditorFieldComponent = componentFactory(EditorFieldApi, config)
            .setTemplate(tpl)
            .on('init', function() {
                if (!this.config.tooltip) {
                    throw new Error('tooltip instance must be given in the config');
                }
                tooltip = this.config.tooltip;
                widget = tooltip.data('widget');
            })
            .on('render', function() {
                this.buildEditor();
            })
            .on('destroy', function() {
                this.destroyEditor();
            });

        return EditorFieldComponent.init();
    };
});