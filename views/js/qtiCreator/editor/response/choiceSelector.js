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
define(['jquery',
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/choiceSelector'
], function($, _, __, component, choiceSelectorTpl){
    
    //exposed methods
    var choiceSelector = {
        getChoices : function(){},
        setChoices : function(){},
        resetChoices : function(){}
    };
    
    function init(){
        //@todo do some magic here
        var selectedChoices = this.config.choices || [];
        var availableChoices = this.config.interaction.getChoices();
        console.log('selectedChoices', selectedChoices);
        console.log('availableChoices', availableChoices);
    }
    
    function destroy(){
        //@todo clean up
    }
    
    var choiceSelectorFactory = function breadcrumbsFactory(config) {
        return component(choiceSelector)
                .on('init', init)
                .on('destroy', destroy)
                .setTemplate(choiceSelectorTpl)
                .init(config);
    };

    return choiceSelectorFactory;
});