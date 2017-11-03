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
    'ui/component/alignable',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(_, $, componentFactory, makeAlignable, htmlEditor, contentHelper, tpl) {
    'use strict';


    var defaultConfig = {

    };

    var tooltipEditorApi = {

    };

    return function tooltipEditorFactory(config) {
        var tooltip,
            tooltipEditorComponent,
            widget;

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
                this.config.target  = tooltip.body();
                this.config.content = tooltip.content();
            })
            .on('render', function() {
                var self = this,
                    $component = self.getElement(),
                    $closeBtn = $component.find('.widget-ok');

                var $editableContainer = $component.find('.tooltip-editor-content');

                var bodyChangeCallback = _.throttle(function(newBody) {
                    tooltip.body(newBody);
                }, 800);

                $closeBtn.on('click', function() {
                    self.hide(); // todo: put the widget to sleep
                });



                $('.tooltip-editor-target').on('change', function() {
                    bodyChangeCallback(this.value);
                });

                if(!htmlEditor.hasEditor($component)){
                    htmlEditor.buildEditor($component, {
                        placeholder: '',
                        change : contentHelper.getChangeCallback(tooltip),
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

            })
            .on('destroy', function() {
                var self = this,
                    $component = self.getElement(),
                    $closeBtn = $component.find('.widget-ok');

                $closeBtn.off('click');
            });

        makeAlignable(tooltipEditorComponent);

        return tooltipEditorComponent.init();
    };
});