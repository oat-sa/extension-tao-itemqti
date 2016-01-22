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

    var $selectBox = $();


    //exposed methods
    var choiceSelector = {
        getChoices : function(){},
        setChoices : function(){},
        resetChoices : function(){}
    };

    function init(){
    }

    function destroy(){
        $selectBox.empty().select2('destroy');
    }


    /**
     * Reset and populate select box and apply select2
     */
    function postRender() {

        var self = this,
            selectChoices = this.config.choices,
            format = function (state) {
                return '<span title="' + $(state.element).attr('title') + '">' + state.text + '</span>';
            },
            toTitle = function(content) {
                var origLength = content.length;
                content = $('<div>', { html: content }).text().trim().replace(/\s+/g, ' ').substr(0, 30);
                if(content.length < origLength) {
                    content += '…';
                }
                return content;
            };

        $selectBox = this.$component.find('select');

        _.forOwn(this.config.interaction.getChoices(), function(valueObj, key) {
            var option = new Option(valueObj.attr('identifier'), key, !!selectChoices[key]);
            option.title = toTitle(valueObj.bdy.bdy);
            $selectBox.append(option);
        });

        $selectBox.select2({
            dropdownAutoWidth: true,
            placeholder: $selectBox.attr('placeholder'),
            minimumResultsForSearch: -1,
            formatResult: format,
            formatSelection: format
        }).on('change', function() {
            self.trigger('change', $selectBox.select2('val'));
        });
    }

    var choiceSelectorFactory = function choiceSelectorFactory(config) {
        return component(choiceSelector)
                .on('init', init)
                .on('destroy', destroy)
                .on('render', postRender)
                .setTemplate(choiceSelectorTpl)
                .init(config);
    };

    return choiceSelectorFactory;
});