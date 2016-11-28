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
 * Copyright (c) 2013-2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/helpers/patternMask',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/textEntry'
], function($, __, stateFactory, Question, formElement, patternMaskHelper, formTpl){
    'use strict';

    var TextEntryInteractionStateQuestion = stateFactory.extend(Question);

    TextEntryInteractionStateQuestion.prototype.initForm = function(){
        
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        var patternMask = interaction.attr('patternMask'),
            maxChars = parseInt(patternMaskHelper.parsePattern(patternMask,'chars'),10);

        var constraints = {
            none : {label : __("None"), selected : true},
            maxLength : {label : __("Max Length"), selected : false},
            pattern : {label : __("Pattern"), selected : false}
        };

        if (!isNaN(maxChars) && maxChars > 0) {
            constraints.none.selected = false;
            constraints.maxLength.selected = true;
        }else if( patternMask !== null && patternMask !== undefined && patternMask !== ''){
            constraints.none.selected = false;
            constraints.pattern.selected = true;
        }

        $form.html(formTpl({
            base : parseInt(interaction.attr('base')),
            placeholderText : interaction.attr('placeholderText'),
            expectedLength : parseInt(interaction.attr('expectedLength')),
            constraints : constraints,
            patternMask : patternMask,
            maxLength : maxChars,
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, interaction, {
            base: formElement.getAttributeChangeCallback(),
            placeholderText: formElement.getAttributeChangeCallback(),
            expectedLength: function expectedLength(interaction, attrValue) {
                interaction.attr('expectedLength', isNaN(parseInt(attrValue, 10)) ? 0 : attrValue);
            },
            constraint : function constraint(interaction,attrValue){
                //TODO use class!!
                $('[id|="constraint"]').hide('500');
                $('#constraint-' + attrValue).show('1000');
                if (attrValue === "none") {
                    //Reset other pattern definition
                    $('[name="maxLength"]').val('');

                    interaction.attr('patternMask',null);
                }
            },
            patternMask : function patternMask(interaction, attrValue){
                //Reset other pattern definition
                $('[name="maxLength"]').val('');

                interaction.attr('patternMask', attrValue);
            },
            maxLength : function maxLength(interaction, attrValue){
                //Reset other pattern definition
                $('[name="patternMask"]').val('');

                var newValue = parseInt(attrValue,10);
                if(! isNaN(newValue)){
                    interaction.attr('patternMask', patternMaskHelper.createMaxCharPattern(newValue));
                }
            }
        });
    };

    return TextEntryInteractionStateQuestion;
});