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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/tooltip'
], function(_, $, __, ckEditor, stateFactory, Active, htmlEditor, contentHelper, inlineHelper, tooltipEditorFactory, formTpl){
    'use strict';

    var tooltipEditor;

    var TooltipStateActive = stateFactory.extend(Active, function create(){
        this.initForm();
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TooltipStateActive.prototype.initForm = function(){
        this.widget.$form.html(formTpl());
    };

    TooltipStateActive.prototype.buildEditor = function buildEditor(){
        var self = this,
            _widget = self.widget,
            creatorContext = _widget.getCreatorContext(),
            $itemPanel = _widget.getAreaBroker().getItemPanelArea(),
            $tooltipContainer = _widget.$container,
            tooltip = _widget.element;

        tooltipEditor = tooltipEditorFactory({
            tooltip: tooltip,
            areaBroker: _widget.getAreaBroker()
        })
            .on('delete', self.destroyTooltip.bind(self))
            .on('done', function() {
                _widget.changeState('sleep');
            })
            .render($itemPanel)
            .show();

        self.alignEditorOn($tooltipContainer);

        creatorContext.on('resize.tooltipEditor', function() {
            self.alignEditorOn($tooltipContainer);
        });
    };

    TooltipStateActive.prototype.alignEditorOn = function alignEditorOn($tooltipContainer) {
        if (tooltipEditor) {
            tooltipEditor.alignWith($tooltipContainer, {
                hPos: 'center',
                vPos: 'bottom',
                vOrigin: 'bottom',

                // the following are arbitrary values
                // that gives visually nice results
                hOffset: -5,
                vOffset: 53
            });
        }
    };

    TooltipStateActive.prototype.destroyTooltip = function destroyTooltip() {
        var self = this,
            _widget = self.widget,
            tooltip = _widget.element,
            $tooltipContainer = _widget.$container;

        var parent = tooltip.parent(),
            newParentBody = parent.body().replace(tooltip.placeholder(), tooltip.body());

        //properly destroy the old tooltip and its widget
        _widget.destroy();
        tooltip.remove();

        //set the new body into the model of the parent
        parent.body(newParentBody);

        // Update the markup
        $tooltipContainer.replaceWith(tooltip.body());
    };

    TooltipStateActive.prototype.destroyEditor = function destroyEditor(){
        var _widget = this.widget,
            creatorContext = _widget.getCreatorContext(),
            tooltip = _widget.element,
            $tooltip = _widget.$original;

        // We never leave the tooltip markup empty, so ckEditor stays our friend
        $tooltip.html(tooltip.body() || '&nbsp;');

        if (tooltipEditor) {
            tooltipEditor.hide();
            tooltipEditor.destroy();
            tooltipEditor = null;
        }

        inlineHelper.togglePlaceholder(_widget);

        creatorContext.off('.tooltipeditor');
    };

    return TooltipStateActive;
});