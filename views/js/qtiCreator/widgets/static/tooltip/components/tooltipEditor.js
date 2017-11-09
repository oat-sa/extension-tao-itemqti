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
    'i18n',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/helpers/widgetPopup',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tip',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/editorField',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(
    _,
    __,
    $,
    widgetPopupFactory,
    contentHelper,
    tipFactory,
    editorFieldFactory,
    tpl
) {
    'use strict';

    var defaultConfig = {
        titleControls: {
            bin: true
        },
        windowTitle: __('Tooltip editor'),
        hasCloser: false
    };


    return function tooltipEditorFactory(config) {
        var tooltip,
            tooltipEditorComponent;

        config = _.defaults(config || {}, defaultConfig);

        tooltipEditorComponent = widgetPopupFactory({}, config)
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
                    $component = this.getElement(),
                    $body = self.getBody(),

                    $targetEditorContainer,
                    $contentEditorContainer,
                    $closeBtn;

                $component.addClass('');

                $body.append($(tpl()));

                $targetEditorContainer  = $body.find('.tooltip-editor-target-container');
                $contentEditorContainer = $body.find('.tooltip-editor-content-container');
                $closeBtn               = $body.find('.widget-ok');

                $closeBtn.on('click', function(e) {
                    e.stopPropagation();
                    self.trigger('close');
                });

                self.targetEditor = editorFieldFactory({
                    tooltip: tooltip,
                    title: __('Tooltip Target'),
                    className: 'tooltip-editor-target',
                    content: tooltip.body(),
                    preventEnter: true,
                    change: function(newBody) {
                        tooltip.body(newBody);
                    }
                })
                    .render($targetEditorContainer);

                self.contentEditor = editorFieldFactory({
                    tooltip: tooltip,
                    title: __('Tooltip Content'),
                    className: 'tooltip-editor-content',
                    content: tooltip.content(),
                    change: function(newContent) {
                        tooltip.content(newContent);
                    }
                })
                    .render($contentEditorContainer);
/*
                self.tip = tipFactory({
                    renderTo: $contentEditorContainer
                })
                    .alignWith(self.contentEditor.getContainer(), {
                        hPos: 'center',
                        vPos: 'top',
                        vOrigin: 'center'
                    });
                    */
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


        return tooltipEditorComponent.init();
    };
});