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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionButton',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionGroup',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/tooltip',
    'ui/tooltip'
], function($, _, __, hider, insertInteractionTpl, insertSectionTpl, tooltipTpl, tooltip){
    'use strict';

    /**
     * String to identify a custom interaction from the authoring data
     *
     * @type String
     */
    var _customInteractionTag = __('Custom Interactions');

    /**
     * Interaction types that require a sub group in the toolbar
     *
     * @type Object
     */
    var _subgroups = {
        'inline-interactions' : 'Inline Interactions'
    };

    var _events = {
        interactiontoolbarready : 'interactiontoolbarready.qti-widget'
    };

    function getGroupId(groupId){
        return groupId.replace(/\W+/g, '-').toLowerCase();
    }

    function getGroupSectionId(groupId){
        return 'sidebar-left-section-' + getGroupId(groupId);
    }

    function addGroup($sidebar, groupId, groupLabel){

        const groupSectionId = getGroupSectionId(groupId);

        const $section = $(insertSectionTpl({
            id : groupSectionId,
            label : groupLabel
        }));

        $sidebar.append($section);

        return $section;
    }

    function create($sidebar, interactions){

        _.forEach(interactions, function(interactionAuthoringData){
            add($sidebar, interactionAuthoringData);
        });

        buildSubGroups($sidebar);

        //set it ad "ready":
        $sidebar.data('interaction-toolbar-ready', true);
        $sidebar.trigger(_events.interactiontoolbarready);//interactiontoolbarready.qti-widget
    }

    function getGroup($sidebar, groupId){

        const groupSectionId = getGroupSectionId(groupId);
        return $sidebar.find('#' + groupSectionId);
    }

    function isReady($sidebar){
        return !!$sidebar.data('interaction-toolbar-ready');
    }

    function whenReady($sidebar){
        return new Promise(function(resolve){
            if(isReady($sidebar)){
                resolve();
            }else{
                $sidebar.on(_events.interactiontoolbarready, function(){
                    resolve();
                });
            }
        });
    }

    function remove($sidebar, interactionClass){
        $sidebar.find('li[data-qti-class="' + interactionClass + '"]').remove();
    }

    function disable($sidebar, interactionClass){
        hider.hide($sidebar.find('li[data-qti-class="' + interactionClass + '"]'));
    }

    function enable($sidebar, interactionClass){
        hider.show($sidebar.find('li[data-qti-class="' + interactionClass + '"]'));
    }

    function exists($sidebar, interactionClass){
        return !!$sidebar.find('li[data-qti-class="' + interactionClass + '"]').length;
    }

    function add($sidebar, interactionAuthoringData){

        if(exists($sidebar, interactionAuthoringData.qtiClass)){
            throw 'the interaction is already in the sidebar';
        }

      const groupId = interactionAuthoringData.group,
            groupLabel = interactionAuthoringData.tags[0] || '',
            subGroupId = interactionAuthoringData.tags[1],
            tplData = {
                qtiClass : interactionAuthoringData.qtiClass,
                disabled : !!interactionAuthoringData.disabled,
                title : interactionAuthoringData.description,
                iconFont : /^icon-/.test(interactionAuthoringData.icon),
                icon : interactionAuthoringData.icon,
                short : interactionAuthoringData.short,
                dev : false
            };
        let $group = getGroup($sidebar, groupId);


        if(subGroupId && _subgroups[subGroupId]){
            tplData.subGroup = subGroupId;
        }

        if(!$group.length){
            //the group does not exist yet : create a <section> for the group
            $group = addGroup($sidebar, groupId, groupLabel);
        }

        if(subGroupId && _subgroups[subGroupId]){
            tplData.subGroup = subGroupId;
        }

        if(!$group.length){
            //the group does not exist yet : create a <section> for the group
            $group = addGroup($sidebar, groupId, groupLabel);
        }

        let $interaction = $(insertInteractionTpl(tplData));
        $group.find('.tool-list').append($interaction);

        return $interaction;
    }

    function buildSubGroups($sidebar){

        $sidebar.find('[data-sub-group]').each(function(){

            var $element = $(this),
                $section = $element.parents('section'),
                subGroup = $element.data('sub-group'),
                $subGroupPanel,
                $subGroupList,
                $cover;

            if(!subGroup){
                return;
            }

            $subGroupPanel = $section.find('.sub-group.' + subGroup);
            $subGroupList = $subGroupPanel.find('.tool-list');
            if(!$subGroupPanel.length){
                $subGroupPanel = $('<div>', {'class' : 'panel clearfix sub-group ' + subGroup});
                $subGroupList = $('<ul>', {'class' : 'tool-list plain clearfix'});
                $subGroupPanel.append($subGroupList);
                $section.append($subGroupPanel);
                $cover = $('<div>', {'class' : 'sub-group-cover blocking'});
                $subGroupPanel.append($cover);
                $subGroupPanel.data('cover', $cover);
            }
            $subGroupList.append($element);
        });

        addInlineInteractionTooltip();
    }

    /**
     * add tooltip to explain special requirement and behaviours for inline interactions
     * may need to generalize it in the future
     */
    function addInlineInteractionTooltip(){

        var timer,
            $inlineInteractionsPanel = $('#sidebar-left-section-inline-interactions .inline-interactions'),
            $tooltip = $(tooltipTpl({
                message : __('Inline interactions need to be inserted into a text block.')
            }));

        $inlineInteractionsPanel.append($tooltip);
        tooltip.lookup($inlineInteractionsPanel);

        $tooltip.css({
            position : 'absolute',
            zIndex : 11,
            top : 0,
            right : 10
        });

        $inlineInteractionsPanel.on('mouseenter', '.sub-group-cover', function(){

            timer = setTimeout(function(){
                $tooltip.find('[data-tooltip]').data('$tooltip').show();
            }, 300);

        }).on('mouseleave', '.sub-group-cover', function(){
            $tooltip.find('[data-tooltip]').data('$tooltip').hide();
            clearTimeout(timer);
        });
    }

    return {
        create : create,
        add : add,
        exists : exists,
        addGroup : addGroup,
        getGroupId : getGroupId,
        getGroupSectionId : getGroupSectionId,
        getGroup : getGroup,
        isReady : isReady,
        whenReady : whenReady,
        remove : remove,
        disable : disable,
        enable : enable,
        getCustomInteractionTag : function(){
            return _customInteractionTag;
        }
    };

});
