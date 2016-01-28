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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/choiceSelector',
    'select2'
], function($, _, __, component, choiceSelectorTpl){

    'use strict';

    /**
     * Exposed methods
     * @type {{getChoices: choiceSelector.getChoices, getSelectedChoices: choiceSelector.getSelectedChoices}}
     */
    var choiceSelector = {
        getChoices : function(){
            return this.config.interaction.choices || {};
        },
        getSelectedChoices : function() {
            return this.config.choices || [];
        },
        setSelectedChoices : function(choices) {
            this.config.choices = choices;
        }
    };

    /**
     * Format option for select2 usage
     *
     * @param state
     * @returns {string}
     */
    function formatOption (state) {
        return '<span title="' + $(state.element).attr('title') + '">' + state.text + '</span>';
    }

    /**
     * Add a title to select2 options
     *
     * @param {String} content
     * @param {Number} threshold
     * @returns {*}
     */
    function createOptionTitle (content, threshold) {
        var fullText = $('<div>', { html: content }).text().trim().replace(/\s+/g, ' ');
        var shortText = fullText.substr(0, threshold);
        return fullText.length - shortText.length <= 5 ? fullText : shortText + '…';
    }


    /**
     * Set some additional parameters
     */
    var init = function init(){
        if(!this.config.titleLength) {
            this.config.titleLength = 30;
        }
    };


    /**
     * Select 2 needs to be removed prior to destruction of the component
     */
    var destroy = function destroy(){
        this.$component.find('select').select2('destroy');
    };


    /**
     * Populate select box and apply select2
     */
    var render = function postRender() {

        var self = this;
        var $selectBox = this.$component.find('select');
        var selectedChoices = self.getSelectedChoices();

        _.each(self.getChoices(), function(choice) {
            var id = choice.id();
            var option = new Option(id, id, selectedChoices.indexOf(id) > -1);
            option.title = createOptionTitle(choice.bdy.bdy, self.config.titleLength);
            $selectBox.append(option);
        });

        $selectBox.select2({
            dropdownAutoWidth: true,
            placeholder: $selectBox.attr('placeholder'),
            minimumResultsForSearch: -1,
            formatResult: formatOption,
            formatSelection: formatOption
        }).on('change', function() {
            self.setSelectedChoices($selectBox.select2('val'));
            self.trigger('change', self.getSelectedChoices());
        });
    };

    var choiceSelectorFactory = function choiceSelectorFactory(config) {
        return component(choiceSelector)
                .on('init', init)
                .on('destroy', destroy)
                .on('render', render)
                .setTemplate(choiceSelectorTpl)
                .init(config);
    };

    return choiceSelectorFactory;
});
