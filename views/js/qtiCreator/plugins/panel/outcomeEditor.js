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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/helper/popup',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'ui/tooltip',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/panel',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing'
], function ($, _, __, pluginFactory, Element, popup, formElement, OutcomeDeclaration, xmlRenderer, tooltip, panelTpl, listingTpl) {
    'use strict';

    var _ns = '.outcome-editor';

    /**
     * Types of externalScored attributes
     * @type {{externalMachine: string, none: string, human: string}}
     */
    const externalScoredOptions = {
        none: 'none',
        human: 'human',
        externalMachine : 'externalMachine'
    };

    /**
     * Get the identifiers of the variables that are used in the response declaration
     *
     * @param {Object} item
     * @returns {Array}
     */
    function getRpUsedVariables(item){

        var rpXml = xmlRenderer.render(item.responseProcessing);
        var variables = ['SCORE', 'MAXSCORE'];//score and max score are always used, even in template based response processing
        var $rp = $(rpXml);

        $rp.find('variable,setOutcomeValue').each(function(){
            var id = $(this).attr('identifier');
            variables.push(id);
        });

        return _.uniq(variables);
    }

    /**
     * Render the lists of the item outcomes into the outcome editor panel
     *
     * @param {Object} item
     * @param {JQuery} $outcomeEditorPanel
     */
    function renderListing(item, $outcomeEditorPanel){

        var rpVariables = getRpUsedVariables(item);

        var outcomesData = _.map(item.outcomes, function(outcome){
            var readonly = (rpVariables.indexOf(outcome.id()) >= 0);

            var externalScored = {
                none : {label : __("None"), selected : !outcome.attr('externalScored')},
                human : {label : __("Human"), selected : outcome.attr('externalScored') === externalScoredOptions.human},
                externalMachine : {label : __("External Machine"), selected : outcome.attr('externalScored') === externalScoredOptions.externalMachine}
            };

            return {
                serial : outcome.serial,
                identifier : outcome.id(),
                interpretation : outcome.attr('interpretation'),
                normalMaximum : outcome.attr('normalMaximum'),
                normalMinimum : outcome.attr('normalMinimum'),
                externalScored: externalScored,
                titleDelete : readonly ? __('Cannot delete a variable currently used in response processing') : __('Delete'),
                titleEdit : readonly ? __('Cannot edit a variable currently used in response processing') : __('Edit'),
                readonly : readonly
            };
        });

        $outcomeEditorPanel.find('.outcomes').html(listingTpl({
            outcomes : outcomesData
        }));

        //init form javascript
        formElement.initWidget($outcomeEditorPanel);
    }

    /**
     * Validates if the number is a valid scoring trait
     *
     * @param value
     * @returns {boolean}
     */
    function isValidScoringTrait(value) {
        return (value % 1 === 0 && value !== undefined);
    }

    /**
     * Attaches warning tooltips to value fields
     *
     * @param $field
     */
    function attachScoringTraitWarningTooltip($field){
        var widgetTooltip;

        if(!$field.data('$tooltip')) {
            widgetTooltip = tooltip.warning($field, __('This value does not follow scoring traits guidelines. It won\'t be compatible with TAO Manual Scoring'), {
                trigger: 'manual',
                popperOptions: {
                    positionFixed: false
                }
            });
            $field.data('$tooltip', widgetTooltip);
        }
    }

    /**
     * Disposes tooltips
     *
     * @param $field
     */
    function disposeScoringTraitWarningTooltip($field) {
        if($field.data('$tooltip')) {
            $field.data('$tooltip').dispose();
        }
    }

    return pluginFactory({
        name: 'outcomeEditor',
        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {

            var item = this.getHost().getItem();
            var $container = this.getAreaBroker().getContainer();
            var $responsePanel = $container.find('#sidebar-right-response-properties');
            var $outcomeEditorPanel;

            $container.on('initResponseForm' + _ns, function () {

                //remove old one if exists
                $responsePanel.find('.qti-outcome-editor').remove();

                //create new one
                $outcomeEditorPanel = $(panelTpl());

                //bind behaviour
                $outcomeEditorPanel.on('click'+_ns, '.editable [data-role="edit"]', function(){

                    var $outcomeContainer = $(this).closest('.outcome-container');
                    var serial = $outcomeContainer.data('serial');
                    var outcome = Element.getElementBySerial(serial);
                    var $labelContainer = $outcomeContainer.find('.identifier-label');
                    var $identifierLabel = $labelContainer.find('.label');
                    var $identifierInput = $labelContainer.find('.identifier');
                    var validateScoringTrait = outcome.attr('externalScored') === externalScoredOptions.human;

                    $outcomeContainer.addClass('editing');

                    //sync the identifier value in case it was invalid before
                    $identifierInput.focus();
                    $identifierInput.val('');
                    $identifierInput.val(outcome.id());

                    const $outcomeValueMinimum = $outcomeContainer.find('input[name=normalMinimum]');
                    const $outcomeValueMaximum = $outcomeContainer.find('input[name=normalMaximum]');

                    function showScoringTraitWarningOnInvalidValue() {
                        if(!isValidScoringTrait(outcome.attr('normalMinimum'))) {
                            $outcomeValueMinimum.data('$tooltip').show();
                        }
                        if(!isValidScoringTrait(outcome.attr('normalMaximum'))) {
                            $outcomeValueMaximum.data('$tooltip').show();
                        }
                    }

                    //Attach scoring trait warning tooltips on init to outcome value fields
                    if(validateScoringTrait) {
                        attachScoringTraitWarningTooltip($outcomeValueMinimum);
                        attachScoringTraitWarningTooltip($outcomeValueMaximum);

                        // shows tooltips in case of invalid value
                        showScoringTraitWarningOnInvalidValue();
                    }

                    //attach form change callbacks
                    formElement.setChangeCallbacks($outcomeContainer, outcome, _.assign({
                        identifier : function(outcome, value){
                            //update the html for real time update
                            $identifierLabel.html(value);

                            //save to model
                            outcome.id(value);
                        },
                        interpretation : function(outcome, value){
                            //update the title attr for real time update
                            $labelContainer.attr('title', value);

                            //save to model
                            outcome.attr('interpretation', value);
                        },
                        externalScored : function(outcome, value){
                            //Turn off scoring trait validation if externalScored is not human
                            validateScoringTrait = (value === externalScoredOptions.human);
                            /**
                             * Save to model
                             *
                             * Removes the `externalScored` attribute from outcome when `none` is selected.
                             * Attaches scoring trait warning tooltips when `externalScored` is `human`
                             *
                             */
                            if(value === externalScoredOptions.none) {
                                outcome.removeAttr('externalScored');
                                disposeScoringTraitWarningTooltip($outcomeValueMinimum);
                                disposeScoringTraitWarningTooltip($outcomeValueMaximum);
                            } else if( value === externalScoredOptions.human) {
                                outcome.attr('externalScored', value);
                                attachScoringTraitWarningTooltip($outcomeValueMinimum);
                                attachScoringTraitWarningTooltip($outcomeValueMaximum);
                                // shows tooltips in case of invalid value
                                showScoringTraitWarningOnInvalidValue();
                            } else {
                                outcome.attr('externalScored', value);
                                disposeScoringTraitWarningTooltip($outcomeValueMinimum);
                                disposeScoringTraitWarningTooltip($outcomeValueMaximum);
                            }
                        }
                    }, formElement.getMinMaxAttributeCallbacks($outcomeContainer, 'normalMinimum', 'normalMaximum', {
                        allowNull : true,
                        floatVal: true,
                        callback : function(outcome, value, attr){
                            const $outcomeValue = $outcomeContainer.find(`input[name=${attr}]`);

                            console.log('change');
                            debugger;

                            if (validateScoringTrait) {
                                showScoringTraitWarningOnInvalidValue($outcomeValue, attr);
                                if(!isValidScoringTrait(value)) {
                                    $outcomeValue.data('$tooltip').show();
                                } else {
                                    $outcomeValue.data('$tooltip').hide();
                                }
                            }

                            if(isNaN(value)){
                                outcome.removeAttr(attr);
                            }
                        }
                    })));

                }).on('click'+_ns, '.editing [data-role="edit"]', function(){

                    var $outcomeContainer = $(this).closest('.outcome-container');
                    $outcomeContainer.removeClass('editing');
                    formElement.removeChangeCallback($outcomeContainer);

                }).on('click'+_ns, '.deletable [data-role="delete"]', function(){

                    //delete the outcome
                    var $outcomeContainer = $(this).closest('.outcome-container');
                    $outcomeContainer.remove();
                    item.remove('outcomes', $outcomeContainer.data('serial'));

                }).on('click'+_ns, '.adder', function(){

                    //add new outcome
                    var newOutcome = new OutcomeDeclaration({
                        cardinality : 'single',
                        baseType : 'float',
                        normalMinimum : 0.0,
                        normalMaximum : 1.0
                    });

                    //attach the outcome to the item before generating item-level unique id
                    item.addOutcomeDeclaration(newOutcome);
                    newOutcome.buildIdentifier('OUTCOME');

                    //refresh the list
                    renderListing(item, $outcomeEditorPanel);
                });

                //attach to response form side panel
                $responsePanel.append($outcomeEditorPanel);
                renderListing(item, $outcomeEditorPanel);
            });
        }
    });
});