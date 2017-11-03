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
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditorContent',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(_, $, componentFactory, makeAlignable, htmlEditor, contentHelper, tooltipEditorContentFactory, tpl) {
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
                    $contentEditorContainer = $('.tooltip-editor-content-container'),
                    $closeBtn = $component.find('.widget-ok');

                var bodyChangeCallback = _.throttle(function(newBody) {
                    tooltip.body(newBody);
                }, 800);

                self.contentEditor = tooltipEditorContentFactory({ tooltip: tooltip });

                $closeBtn.on('click', function() {
                    self.hide(); // todo: put the widget to sleep
                });

                $('.tooltip-editor-target').on('input', function() {
                    bodyChangeCallback(this.value);
                });

                self.contentEditor.render($contentEditorContainer);

                $contentEditorContainer.on('click', function() {
                    self.contentEditor.buildEditor();
                });
                $component.on('click', function(e) {
                    if (!$.contains($contentEditorContainer[0], e.target)) {
                        self.contentEditor.destroyEditor();
                    }
                });

            })
            .on('destroy', function() {
                var self = this,
                    $component = self.getElement(),
                    $closeBtn = $component.find('.widget-ok');

                $closeBtn.off('click');

                if (this.contentEditor) {
                    this.contentEditor.destroy();
                    this.contentEditor = null;
                }
            });

        makeAlignable(tooltipEditorComponent);

        return tooltipEditorComponent.init();
    };
});