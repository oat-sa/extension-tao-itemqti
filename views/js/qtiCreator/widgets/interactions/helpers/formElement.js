/*
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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * Interactions's form element helper
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiItem/core/Element',
    'ui/tooltip'
], function($, _, __, formElement, Element, tooltip){
    'use strict';

    var _scoreTooltipContent = {
        required: __('This is required'),
        invalid:  __('The score format is not numeric')
    };

    var formElementHelper = {

        init : function init(widget){
            formElement.initWidget(widget.$form);
        },

        /**
         * Helps you to synchrnonize min/max widgets so the min isn't greater than the max, etc.
         *
         * @deprecated Please use instead the {@link qtiCreator/widget/component/minMax} component
         * with buitin synchronization support.
         *
         * @param {Object} widget - the interacion's widget (where widget.element is the interaction)
         * @param {String} [attributeNameMin = minChoices] - the name of the min field and attribute
         * @param {String} [attributeNameMax = maxChoices] - the name of the max field and attribute
         * @param {Function} [getMax = _.size] - how to get the max value from the choices lists (in attributes)
         */
        syncMaxChoices : function syncMaxChoices(widget, attributeNameMin, attributeNameMax, getMax){
            var $min;
            var $max;
            var _syncMaxChoices = function(){
                var newOptions = {max : getMax(widget.element.getChoices())};
                $min.incrementer('options', newOptions).keyup();
                $max.incrementer('options', newOptions).keyup();
            };

            attributeNameMin = attributeNameMin || 'minChoices';
            attributeNameMax = attributeNameMax || 'maxChoices';
            getMax = getMax || _.size;
            $min = widget.$form.find('input[name=' + attributeNameMin + ']');
            $max = widget.$form.find('input[name=' + attributeNameMax + ']');


            widget.on('choiceCreated', function(data){

                if(data.interaction.serial === widget.element.serial){
                    _syncMaxChoices();
                }

            }).on('deleted', function(data){

                if(data.parent.serial === widget.element.serial &&
                    Element.isA(data.element, 'choice')){

                    _syncMaxChoices();
                }
            });
        },

        //set float (used for score)
        setScore : function setScore($scoreInput, options){
            var value;
            var score;
            var key;
            var formElementTooltip;

            options = _.defaults(options || {}, {
                required : false,
                empty : function(){
                },
                set : function(){
                },
                key : function(){
                    return $(this).attr('name');
                },
                tooltipContent : _scoreTooltipContent
            });

            if(typeof $scoreInput.data('$tooltip') === 'undefined'){
                formElementTooltip = tooltip.error($scoreInput, ' ', {
                    trigger: 'manual',
                });
                $scoreInput.data('$tooltip', formElementTooltip);

            }

            value = $scoreInput.val();
            score = parseFloat(value);
            key = options.key.call($scoreInput[0]);

            if(value === ''){
                if(options.required){
                    //missing required score value!
                    $scoreInput.data('$tooltip').updateTitleContent(options.tooltipContent.required);
                    $scoreInput.data('$tooltip').show();
                }else{
                    $scoreInput.data('$tooltip').hide();
                    options.empty(key);
                }
            }else if(!isNaN(score)){
                //is a correct number
                $scoreInput.data('$tooltip').hide();
                options.set(key, score);
            }else{
                //invalid input!
                $scoreInput.data('$tooltip').updateTitleContent(options.tooltipContent.invalid);
                $scoreInput.data('$tooltip').show();
            }

        }
        //set text (used for controlled pattern, especially id)
    };

    return formElementHelper;
});
