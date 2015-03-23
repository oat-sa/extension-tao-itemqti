define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/editor/elementSelector/tpl/popup',
    'tpl!taoQtiItem/qtiCreator/editor/elementSelector/tpl/content'
], function($, _, popupTpl, contentTpl){
    
    var _ns = '.element-selector';
    
    function init(options){

        var $anchor = options.attachTo;
        var $container = options.container;
        var positions = computePosition($anchor, $container);
        var $element = $(popupTpl({
            popup : positions.popup,
            arrow : positions.arrow,
            content : buildContent(options.interactions)
        }));

        //only one 
        $anchor.find('.contextual-popup').remove();

        //style and attach the form
        $anchor.css('position', 'relative');
        $anchor.append($element);

        $element.on('click', '.group-list li', function(){
            var $trigger = $(this);
            _activatePanel($element, $trigger);
        }).on('click', '.element-list li', function(){
            _activateElement($element, $(this));
        });
        
        return {
            getPopup : function(){
                return $element;
            },
            reposition : function(){
                var pos = computePosition($anchor, $container);
                $element.css({
                    top : pos.popup.top,
                    left : pos.popup.left
                });
                $element.children('.arrow').css('left', pos.arrow.left);
                $element.children('.arrow-cover').css('left', pos.arrow.leftCover);
            },
            activatePanel : function(groupName){
                activatePanel($element, groupName);
            },
            activateElement : function(qtiClass){
                activateElement($element, qtiClass);
            }
        };
    }

    function activatePanel($container, groupName){
        var $trigger = $container.find('.group-list li[data-group-name="' + groupName + '"]');
        _activatePanel($container, $trigger);
    }

    function _activatePanel($container, $trigger){
        if(!$trigger.hasClass('active')){
            $trigger.addClass('active').siblings('.active').removeClass('active');
            var group = $trigger.data('group-name');
            var $group = $container.find('.element-group[data-group-name="' + group + '"]');
            $group.show().siblings('.element-group').hide();
        }
    }
    
    function activateElement($container, qtiClass){
         var $trigger = $container.find('.element-list li[data-qti-class="' + qtiClass + '"]');
        _activateElement($container, $trigger);
    }
    
    function _activateElement($container, $trigger){
        var qtiClass = $trigger.data('qti-class');
        if(!$trigger.hasClass('active')){
            $container.find('.element-list li').removeClass('active');
            $trigger.addClass('active');
            $container.trigger('selected'+_ns, [qtiClass, $trigger]);
        }
    }
    
    function computePosition($anchor, $container){

        var popupWidth = 500;
        var arrowWidth = 6;
        var marginTop = 10;
        var marginLeft = 15;
        var _anchor = {top : $anchor.offset().top, left : $anchor.offset().left, w : $anchor.innerWidth(), h : $anchor.innerHeight()};
        var _container = {top : $container.offset().top, left : $container.offset().left, w : $container.innerWidth()};
        var _popup = {
            top : _anchor.h + marginTop,
            left : -popupWidth / 2,
            w : popupWidth
        };

        var offset = _anchor.left - _container.left;
        //do we have enough space on the left ?
        if(offset + marginLeft < _popup.w / 2){
            _popup.left = -offset + marginLeft;
        }else if(_container.w - (offset + _anchor.w + marginLeft) < _popup.w / 2){
            _popup.left = -offset + _container.w - marginLeft - _popup.w;
        }

        var _arrow = {
            left : -_popup.left + _anchor.w / 2 - arrowWidth,
            leftCover : -_popup.left + _anchor.w / 2 - arrowWidth - 6
        };

        return {
            popup : _popup,
            arrow : _arrow
        };
    }
    
    function _filterInteractions(interactions){
        var block;
        //remove all inline interactions, keep block container only
        var filtered = _.filter(interactions, function(interaction){
            var tags = interaction.tags;
            if(interaction.qtiClass === '_container'){
                block = interaction;
                interaction.tags[0] = 'Text Block';
                return false;
            }else if(tags && tags[0] !== 'Inline Interactions'){
                return true;
            }
            return false;
        });
        block.tags[0] = 'Text Block';
        filtered.unshift(block);
        return filtered;
    }
    
    function buildContent(interactions){

        var groups = [];
        _.each(_filterInteractions(interactions), function(interaction){

            var groupName = interaction.tags[0];
            var panel = _.find(groups, {name : groupName});
            if(!panel){
                panel = {
                    name : groupName,
                    label : groupName.replace(/\sInteractions$/, ''),
                    elements : []
                };
                groups.push(panel);
            }

            panel.elements.push({
                qtiClass : interaction.qtiClass,
                disabled : !!interaction.disabled,
                title : interaction.description,
                iconFont : /^icon-/.test(interaction.icon),
                icon : interaction.icon,
                label : interaction.label
            });
        });

        return contentTpl({
            groups : groups
        });
    }

    return {
        init : init,
        activateElement : activateElement,
        activatePanel : activatePanel
    };
});