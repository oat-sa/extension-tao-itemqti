define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionButton',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/insertInteractionGroup',
], function($, _, insertInteractionTpl, insertSectionTpl){

    var _subgroups = {
        'inline-interactions' : 'Inline Interactions'
    };

    function createInteractionsToolbar($toolbar, interactionToolbars){

        var groups = {};

        _.each(interactionToolbars, function(interaction){

            var groupLabel = interaction.tags.shift(),
                groupId = groupLabel.replace(/\W+/g, '-').toLowerCase(),
                subGroupId = interaction.tags[0] || '';

            if(!groups[groupId]){

                //the group does not exist yet : create a <section> for the group

                var $section = $(insertSectionTpl({
                    id : groupId,
                    label : groupLabel
                }));

                groups[groupId] = {
                    id : groupId,
                    label : groupLabel,
                    $section : $section,
                    interactions : []
                };

                $toolbar.append($section);
            }

            //prepare interaction tpl data
            var interactionData = {
                qtiClass : interaction.qtiClass,
                disabled : !!interaction.disabled,
                title : interaction.title,
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
    }
    
    return {
        create : createInteractionsToolbar,
    }

});