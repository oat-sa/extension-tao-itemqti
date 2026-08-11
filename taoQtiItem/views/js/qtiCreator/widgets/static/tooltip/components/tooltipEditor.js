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
    'taoQtiItem/qtiCreator/widgets/helpers/widgetPopup/widgetPopup',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/editorField',
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(
    _,
    __,
    $,
    widgetPopupFactory,
    contentHelper,
    editorFieldFactory,
    tpl
) {
    'use strict';

    var widgetPopupConfig = {
        popupControls: {
            done: true
        },
        windowTitle: __('Tooltip editor'),
        alignable: true,
        containable: true,
        hasCloser: false,
        hasBin: true
    };

    /**
     * @param {Object} config
     * @param {Element} config.tooltip - the tooltip element
     */
    return function tooltipEditorFactory(config) {
        var tooltip,
            tooltipEditorComponent;

        config = _.defaults(config || {}, widgetPopupConfig);

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
                    $body = self.getBody(),

                    $targetEditorContainer,
                    $contentEditorContainer,
                    $closeBtn,

                    fieldToFocus = (! tooltip.body()) ? 'target' : 'content';

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
                    placeholder: __('Enter tooltip target'),
                    content: tooltip.body(),
                    focus: (fieldToFocus === 'target'),
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
                    placeholder: __('Enter tooltip content'),
                    content: tooltip.content(),
                    focus: (fieldToFocus === 'content'),
                    change: function(newContent) {
                        tooltip.content(newContent);
                    }
                })
                    .render($contentEditorContainer);

            })
            .on('destroy', function() {
                var self = this,
                    $component = self.getElement(),
                    $closeBtn = $component.find('.widget-ok');

                $closeBtn.off('click');

                this.contentEditor.destroy();
                this.targetEditor.destroy();
            });

        return tooltipEditorComponent.init();
    };
});