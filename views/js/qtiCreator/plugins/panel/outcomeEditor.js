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
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/panel',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing'
], function ($, _, __, pluginFactory, Element, popup, formElement, OutcomeDeclaration, panelTpl, listingTpl) {
    'use strict';

    var _ns = '.outcome-editor';

    /**
     * Render the lists of the item outcomes into the outcome editor panel
     *
     * @param {Object} item
     * @param {JQuery} $outcomeEditorPanel
     */
    function renderListing(item, $outcomeEditorPanel){
        var outcomesData = _.map(item.outcomes, function(outcome){
            return {
                serial : outcome.serial,
                identifier : outcome.id(),
                interpretation : outcome.attr('interpretation'),
                normalMaximum : outcome.attr('normalMaximum'),
                normalMinimum : outcome.attr('normalMinimum'),
                readonly : outcome.id() === 'SCORE'
            };
        });
        $outcomeEditorPanel.find('.outcomes').html(listingTpl({
            outcomes : outcomesData
        }));

        //init form javascript
        formElement.initWidget($outcomeEditorPanel);
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

                    $outcomeContainer.addClass('editing');

                    //sync the identifier value in case it was invalid before
                    $identifierInput.focus();
                    $identifierInput.val('');
                    $identifierInput.val(outcome.id());

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
                        }
                    }, formElement.getMinMaxAttributeCallbacks($outcomeContainer, 'normalMinimum', 'normalMaximum', {
                        allowNull : true,
                        floatVal: true,
                        callback : function(outcome, value, attr){
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
                $responsePanel.append($outcomeEditorPanel)
                renderListing(item, $outcomeEditorPanel);
            });
        }
    });
});

