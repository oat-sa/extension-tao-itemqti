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
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tip',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditorTarget',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditorContent',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(
    _,
    $,
    componentFactory,
    makeAlignable,
    htmlEditor,
    contentHelper,
    tipFactory,
    targetEditorFactory,
    contentEditorFactory,
    tpl
) {
    'use strict';


    var defaultConfig = {

    };

    var tooltipEditorApi = {

    };

    return function tooltipEditorFactory(config) {
        var tooltip,
            tooltipEditorComponent;

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

                // set templates variables
                this.config.target  = tooltip.body();
                this.config.content = tooltip.content();
            })
            .on('render', function() {
                var self = this,
                    $component = self.getElement(),

                    $targetEditorContainer  = $component.find('.tooltip-editor-target-container'),
                    $contentEditorContainer = $component.find('.tooltip-editor-content-container'),
                    $closeBtn               = $component.find('.widget-ok');

                $closeBtn.on('click', function(e) {
                    e.stopPropagation();
                    self.trigger('close');
                });

                self.targetEditor = targetEditorFactory({ tooltip: tooltip })
                    .render($targetEditorContainer);
                self.contentEditor = contentEditorFactory({ tooltip: tooltip })
                    .render($contentEditorContainer);

                self.tip = tipFactory({
                    renderTo: $contentEditorContainer
                })
                    .alignWith($contentEditorContainer, {
                        hPos: 'center',
                        vPos: 'top',
                        vOrigin: 'center'
                    });

                $contentEditorContainer.on('click', function() {
                    self.contentEditor.buildEditor();
                });
                $targetEditorContainer.on('click', function() {
                    self.targetEditor.buildEditor();
                });

                $component.on('click', function(e) {
                    if (!$.contains($contentEditorContainer[0], e.target)) {
                        self.contentEditor.destroyEditor();

                    } else if (!$.contains(targetEditorFactory[0], e.target)) {
                        self.targetEditor.destroyEditor();
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
                    this.contentEditor = null; // works well with async ?!
                }
                if (this.targetEditor) {
                    this.targetEditor.destroy();
                    this.targetEditor = null;
                }
                if (this.tip) {
                    this.tip.destroy();
                    this.tip = null;
                }
            });

        makeAlignable(tooltipEditorComponent);

        return tooltipEditorComponent.init();
    };
});