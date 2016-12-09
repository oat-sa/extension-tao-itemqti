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

    var _ns = '.outcomeEditor';

    function renderListing(item, $outcomeEditorPanel){
        var outcomesData = _.map(item.outcomes, function(outcome){
            return {
                serial : outcome.serial,
                identifier : outcome.id(),
                interpretation : outcome.attr('interpretation'),
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
            var self = this;
            var item = this.getHost().getItem();
            var $container = this.getAreaBroker().getContainer();
            var $responsePanel = $container.find('#sidebar-right-response-properties');
            var $outcomeEditorPanel;

            $container.on('initResponseForm' + _ns, function () {
                $container.append('editor');
                $responsePanel.find('.qti-outcome-editor').remove();
                $outcomeEditorPanel = $(panelTpl());

                //bind behaviour
                $outcomeEditorPanel.on('click', '.editable [data-role="edit"]', function(){

                    var $outcomeContainer = $(this).closest('.outcome-container');
                    var serial = $outcomeContainer.data('serial');
                    var outcome = Element.getElementBySerial(serial);
                    var $identifierLabel = $outcomeContainer.find('.identifier-label .label');
                    var minMaxCallbacks = formElement.getMinMaxAttributeCallbacks($outcomeContainer, 'normalMinimum', 'normalMaximum', {allowNull : true, floatVal: true});

                    formElement.setChangeCallbacks($outcomeContainer, outcome, _.assign({
                        identifier : function(outcome, value){
                            $identifierLabel.html(value);
                            outcome.id(value);
                        },
                        interpretation : function(outcome, value){
                            outcome.attr('interpretation', value);
                        }
                    }, minMaxCallbacks));

                    $outcomeContainer.addClass('editing');

                }).on('click', '.editing [data-role="edit"]', function(){

                    var $outcomeContainer = $(this).closest('.outcome-container');
                    $outcomeContainer.removeClass('editing');

                }).on('click', '.deletable [data-role="delete"]', function(){

                    //delete the outcome
                    var $outcomeContainer = $(this).closest('.outcome-container');
                    $outcomeContainer.remove();
                    item.remove('outcomes', $outcomeContainer.data('serial'));

                }).on('click', '.adder', function(){

                    //add new outcome
                    var newOutcome = new OutcomeDeclaration({
                        cardinality : 'single',
                        baseType : 'float',
                        normalMinimum : 0.0,
                        normalMaximum : 1.0
                    });
                    item.addOutcomeDeclaration(newOutcome);
                    newOutcome.buildIdentifier('OUTCOME');
                    renderListing(item, $outcomeEditorPanel);
                });

                //attach to response form side panel
                $responsePanel.append($outcomeEditorPanel)
                renderListing(item, $outcomeEditorPanel);
            });
        }
    });
});

