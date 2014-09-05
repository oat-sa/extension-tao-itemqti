define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionButton',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionGroup'
], function($, _, insertInteractionTpl, insertSectionTpl){
    
     /**
     * String to identify a custom interaction from the authoring data
     * 
     * @type String
     */
    var _customInteractionTag = 'Custom Interactions';
    
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
    
    function getGroupId(groupLabel){
        return groupLabel.replace(/\W+/g, '-').toLowerCase();
    }
    
    function getGroupSectionId(groupLabel){
        return 'sidebar-left-section-'+getGroupId(groupLabel);
    }
    
    function addGroup($toolbar, groupLabel){
        
        var groupId = getGroupSectionId(groupLabel);
                
        var $section = $(insertSectionTpl({
            id : groupId,
            label : groupLabel
        }));

        $toolbar.append($section);
        
        return $section;
    }
    
    function createInteractionsToolbar($toolbar, interactionToolbars){

        var groups = {};

        _.each(interactionToolbars, function(interaction){

            var groupLabel = interaction.tags.shift(),
                groupId = getGroupId(groupLabel),
                subGroupId = interaction.tags[0] || '';

            if(!groups[groupId]){

                //the group does not exist yet : create a <section> for the group

                var $section = addGroup($toolbar, groupLabel);

                groups[groupId] = {
                    id : groupId,
                    label : groupLabel,
                    $section : $section,
                    interactions : []
                };

            }

            //prepare interaction tpl data
            var interactionData = {
                qtiClass : interaction.qtiClass,
                disabled : !!interaction.disabled,
                title : interaction.title,
                'icon-font' : /^icon-/.test(interaction.icon),
                icon : interaction.icon,
                short : interaction.short
            };

            if(_subgroups[subGroupId]){
                interactionData['sub-group'] = subGroupId;
            }

            groups[groupId].interactions.push(interactionData);
        });

        _.each(groups, function(group){

            var $ul = group.$section.find('.tool-list');
            _.each(group.interactions, function(interactionData){
                $ul.append(insertInteractionTpl(interactionData))
            });

        });
        
        //set it ad "ready":
        $toolbar.data('interaction-toolbar-ready', true);
        $toolbar.trigger(_events.interactiontoolbarready);//interactiontoolbarready.qti-widget
    }
    
    function getGroup($toolbar, groupLabel){
        
        var groupId = getGroupSectionId(groupLabel);
        return $toolbar.find('#'+groupId);
    }
    
    function isReady($toolbar){
        
        return !!$toolbar.data('interaction-toolbar-ready');
    }
    
    return {
        create : createInteractionsToolbar,
        addGroup : addGroup,
        getGroupId : getGroupId,
        getGroupSectionId : getGroupSectionId,
        getGroup : getGroup,
        isReady : isReady,
        getCustomInteractionTag : function(){
            return _customInteractionTag;
        }
    }

});