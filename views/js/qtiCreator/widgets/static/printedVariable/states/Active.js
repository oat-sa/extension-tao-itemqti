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
    'jquery',
    'lodash',
    'i18n',
    'util/typeCaster',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/printedVariable',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline'
], function($, _, __, typeCaster, stateFactory, Active, formTpl, formElement, inlineHelper){
    'use strict';

    var PrintedVariableStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    PrintedVariableStateActive.prototype.initForm = function(){

        var _widget          = this.widget,
            printedVarEl     = _widget.element,
            $printedVarDom   = _widget.$original,
            $form            = _widget.$form,
            rootElement      = printedVarEl.getRootElement();

        var outcomes = _.isFunction(rootElement.data('getOutcomes')) && rootElement.data('getOutcomes')();

        outcomes = (outcomes || []).map(function(entry) {
            var selected = (printedVarEl.attr('identifier') === entry);
            return {
                value: entry,
                name: entry,
                selected: selected
            };
        });

        $form.html(formTpl({
            outcomes:         outcomes,
            format:           printedVarEl.attr('format'),
            powerForm:        typeCaster.strToBool(printedVarEl.attr('powerForm')),
            base:             printedVarEl.attr('base'),
            index:            printedVarEl.attr('index'),
            delimiter:        printedVarEl.attr('delimiter'),
            field:            printedVarEl.attr('field'),
            mappingIndicator: printedVarEl.attr('mappingIndicator')
        }));

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, printedVarEl, {
            identifier: function(pv, value, name) {
                printedVarEl.attr(name, value);
                $printedVarDom.html(value);
                inlineHelper.togglePlaceholder(_widget);
            },
            format:           formElement.getAttributeChangeCallback(),
            powerForm:        formElement.getAttributeChangeCallback(),
            base:             formElement.getAttributeChangeCallback(),
            index:            formElement.getAttributeChangeCallback(),
            delimiter:        formElement.getAttributeChangeCallback(),
            field:            formElement.getAttributeChangeCallback(),
            mappingIndicator: formElement.getAttributeChangeCallback()
        });

    };

    return PrintedVariableStateActive;
});
