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
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/panel',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing'
], function ($, _, __, pluginFactory, OutcomeDeclaration, panelTpl, listingTpl) {
    'use strict';

    var _ns = '.outcomeEditor';

    function renderListing(item, $outcomeEditorPanel){
        var outcomesData = _.map(item.outcomes, function(outcome){
            return {
                serial : outcome.serial,
                identifier : outcome.id(),
                description : outcome.attr('interpretation'),
                readonly : outcome.id() === 'SCORE'
            };
        });
        $outcomeEditorPanel.find('.outcomes').html(listingTpl({
            outcomes : outcomesData
        }));
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
                $responsePanel.append($outcomeEditorPanel).on('click', ':not(.readonly) [data-role="edit"]', function(){
                    console.log('edit');
                }).on('click', ':not(.readonly) [data-role="delete"]', function(){
                    console.log('delete');
                }).on('click', '.adder', function(){
                    var newOutcome = new OutcomeDeclaration();
                    item.addOutcomeDeclaration(newOutcome);
                    newOutcome.buildIdentifier('OUTCOME');
                    newOutcome.attr({
                        normalMinimum : 0.0,
                        normalMaximum : 1.0
                    });
                    renderListing(item, $outcomeEditorPanel);
                });
                renderListing(item, $outcomeEditorPanel);
            });
        }
    });
});

