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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/core/Element'
], function($, _, __, Element){
    "use strict";

    var _getItemContainer = function(){
        return $('#item-editor-panel');
    };

    var showPanel = function($panel, $fold){

        $panel.show();
        openSections($panel.children('section'));

        if($fold && $fold.length){
            closeSections($fold.children('section'));
        }
    };

    /**
     * Item-level sidebar mode: style | properties | comments.
     * Assigned inside initFormVisibilityListener once DOM refs exist.
     * @param {string} mode
     */
    var setItemSidebarMode = function(mode){
        return mode;
    };

    var initFormVisibilityListener = function(){

        //first of all, clear all listener
        $(document).off('.panel');

        var $itemContainer = _getItemContainer();

        var _staticElements = {
            _tooltip : 'Tooltip',
            figure : 'Figure',
            img : 'Image',
            object : 'Media',
            rubricBlock : 'Rubric Block',
            math : 'Math',
            table : 'Table',
            include : 'Shared Stimulus',
            infoControl : 'Student Tool'
        };

        var MODE_STYLE = 'style',
            MODE_PROPERTIES = 'properties',
            MODE_COMMENTS = 'comments';

        // all sections on the right sidebar are invisible by default
        var $formInteractionPanel = $('#item-editor-interaction-property-bar'),
            $formChoicePanel = $('#item-editor-choice-property-bar'),
            $formResponsePanel = $('#item-editor-response-property-bar'),
            $formItemPanel = $('#item-editor-item-property-bar'),
            $formBodyElementPanel = $('#item-editor-body-element-property-bar'),
            $formTextBlockPanel = $('#item-editor-text-property-bar'),
            $formModalFeedbackPanel = $('#item-editor-modal-feedback-property-bar'),
            $formStylePanel = $('#item-style-editor-bar'),
            $formCommentsPanel = $('#item-editor-item-comments-bar'),
            $modeTabs = $('#item-editor-item-mode-tabs'),
            currentItemMode = MODE_PROPERTIES;

        /**
         * Element-scoped property bars (interaction/choice/…) must not leak into
         * item-level Style / Comments modes.
         */
        var hideElementPropertyPanels = function(){
            $formInteractionPanel.hide();
            $formChoicePanel.hide();
            $formResponsePanel.hide();
            $formBodyElementPanel.hide();
            $formTextBlockPanel.hide();
            $formModalFeedbackPanel.hide();
        };

        /**
         * Switch item-level right sidebar mode. Style keeps inner accordion sections.
         * Mode tabs live in the top action-bar menu-right.
         * @param {string} mode
         */
        setItemSidebarMode = function(mode){
            if(mode !== MODE_STYLE && mode !== MODE_PROPERTIES && mode !== MODE_COMMENTS){
                return currentItemMode;
            }

            currentItemMode = mode;

            $modeTabs.find('[role="tab"]').each(function(){
                var $tab = $(this),
                    selected = $tab.data('tab') === mode;
                $tab.attr('aria-selected', selected ? 'true' : 'false');
                $tab.toggleClass('active', selected);
            });

            if(mode === MODE_STYLE){
                hideElementPropertyPanels();
                $formItemPanel.hide().prop('hidden', true);
                $formCommentsPanel.hide().prop('hidden', true);
                $formStylePanel.show().prop('hidden', false);
                $itemContainer.trigger('styleedit');
                showPanel($formStylePanel);
            }else if(mode === MODE_COMMENTS){
                hideElementPropertyPanels();
                $formStylePanel.hide().prop('hidden', true);
                $formItemPanel.hide().prop('hidden', true);
                $formCommentsPanel.show().prop('hidden', false);
                showPanel($formCommentsPanel);
            }else{
                $formStylePanel.hide().prop('hidden', true);
                $formCommentsPanel.hide().prop('hidden', true);

                // Restore element-scoped bar when a widget is still being edited;
                // otherwise show item-level properties.
                if($itemContainer.find('.edit-question').length){
                    $formItemPanel.hide().prop('hidden', true);
                    showPanel($formInteractionPanel);
                }else if($itemContainer.find('.edit-choice').length){
                    $formItemPanel.hide().prop('hidden', true);
                    showPanel($formChoicePanel, $formInteractionPanel);
                }else if($itemContainer.find('.edit-answer').length){
                    $formItemPanel.hide().prop('hidden', true);
                    showPanel($formResponsePanel);
                }else{
                    hideElementPropertyPanels();
                    $formItemPanel.show().prop('hidden', false);
                    showPanel($formItemPanel);
                }
            }

            $(document).trigger('itemsidebarmodechange.qti-creator', [mode]);
            return currentItemMode;
        };

        $modeTabs.off('click.panel').on('click.panel', '[role="tab"]', function(e){
            e.preventDefault();
            setItemSidebarMode($(this).data('tab'));
        });

        //@todo : fix this timeout event
        _.delay(function(){
            setItemSidebarMode(MODE_PROPERTIES);
        }, 200);

        $(document).on('afterStateInit.qti-widget.panel', function(e, element, state){

            switch(state.name){
                case 'active':

                    setItemSidebarMode(MODE_PROPERTIES);
                    if(!Element.isA(element, 'assessmentItem')){
                        $formItemPanel.hide();
                        $formCommentsPanel.hide().prop('hidden', true);
                        $formStylePanel.hide().prop('hidden', true);
                    }

                    var label = _staticElements[element.qtiClass];
                    if(label){
                        $formBodyElementPanel.find('h2').html(label + ' ' + __('Properties'));
                        showPanel($formBodyElementPanel);
                    }else if(element.qtiClass === '_container'){
                        showPanel($formTextBlockPanel);
                    }

                    if(element.qtiClass === 'modalFeedback'){
                        showPanel($formModalFeedbackPanel);
                        $formResponsePanel.hide();
                    }
                    break;

                case 'question':

                    setItemSidebarMode(MODE_PROPERTIES);
                    showPanel($formInteractionPanel);
                    $formItemPanel.hide();
                    break;

                case 'answer':

                    setItemSidebarMode(MODE_PROPERTIES);
                    showPanel($formResponsePanel);
                    $formItemPanel.hide();
                    break;

                case 'choice':
                    setItemSidebarMode(MODE_PROPERTIES);
                    showPanel($formChoicePanel, $formInteractionPanel);
                    $formItemPanel.hide();
                    break;

                case 'sleep':

                    if(_staticElements[element.qtiClass]){
                        $formBodyElementPanel.hide();
                    }else if(element.qtiClass === '_container'){
                        $formTextBlockPanel.hide();
                    }

                    if(!Element.isA(element, 'choice')){
                        if(!$itemContainer.find('.widget-box.edit-active').length){
                            setItemSidebarMode(
                                currentItemMode === MODE_STYLE ? MODE_PROPERTIES : currentItemMode
                            );
                        }
                    }
                    break;
            }

        }).on('afterStateExit.qti-widget.panel', function(e, element, state){

            switch(state.name){
                case 'active':
                    if(element.qtiClass === 'modalFeedback'){
                        showPanel($formResponsePanel);
                        $formModalFeedbackPanel.hide();
                    }
                    break;
                case 'question':
                    if(element.is('interaction')){
                        $formChoicePanel.hide();
                        $formInteractionPanel.hide();
                    }
                    break;
                case 'choice':
                    $formChoicePanel.hide();
                    showPanel($formInteractionPanel);
                    break;
                case 'answer':
                    $formResponsePanel.hide();
                    break;
            }

        }).on('elementCreated.qti-widget.panel', function(e, data){

            if(data.element.qtiClass === '_container'){
                enableSubGroup('inline-interactions');
            }

        }).on('deleted.qti-widget.panel', function(e, data){

            if(data.element.qtiClass === '_container'){
                toggleInlineInteractionGroup();
            }

        });
    };

    var toggleInlineInteractionGroup = function(){

        var $itemContainer = _getItemContainer();
        if($itemContainer.find('.widget-textBlock').length){
            enableSubGroup('inline-interactions');
        }else{
            disableSubGroup('inline-interactions');
        }
    };

    // selectors and classes
    var heading = 'h2',
        section = 'section',
        panel = 'hr, .panel',
        closed = 'closed',
        ns = 'accordion';

    var initSidebarAccordion = function($sidebar){

        var $sections = $sidebar.find(section),
            $allPanels = $sidebar.children(panel).hide(),
            $allTriggers = $sidebar.find(heading);

        if($allTriggers.length === 0){
            return true;
        }

        // setup events
        $allTriggers.each(function(){
            var $heading = $(this),
                $section = $heading.parents(section),
                $panel = $section.children(panel),
                $closer = $('<span>', {'class' : 'icon-up'}),
                $opener = $('<span>', {'class' : 'icon-down'}),
                action = $panel.is(':visible') ? 'open' : 'close';

            $heading.append($closer).append($opener).addClass(closed);

            // this allows multiple calls, required when blocks are added dynamically
            if($heading.hasClass('_accordion')) {
                return;
            }
            else {
                $heading.addClass('_accordion');
            }

            // toggle heading class arrow (actually switch arrow)
            $panel.on('panelclose.' + ns + ' panelopen.' + ns, function(e, args){
                var fn = e.type === 'panelclose' ? 'add' : 'remove';
                args.heading[fn + 'Class'](closed);
            });

            $panel.trigger('panel' + action + '.' + ns, {heading : $heading});

        });

        $sections.each(function(){

            // assign click action to headings
            $(this).find(heading).on('click', function(e, args){

                var $heading = $(this),
                    $panel = $heading.parents(section).children(panel),
                    preserveOthers = !!(args && args.preserveOthers),
                    actions = {
                        close : 'hide',
                        open : 'fadeIn'
                    },
                action,
                    forceState = (args && args.forceState ? args.forceState : false),
                    classFn;

                if(forceState){
                    classFn = forceState === 'open' ? 'addClass' : 'removeClass';
                    $heading[classFn](closed);
                }

                action = $heading.hasClass(closed) ? 'open' : 'close';

                // whether or not to close other sections in the same sidebar
                // @todo (optional): remove 'false' in the condition below
                // to change the style to accordion, i.e. to allow for only one open section
                if(false && !preserveOthers){
                    $allPanels.not($panel).each(function(){
                        var $panel = $(this),
                            $heading = $panel.parent().find(heading),
                            _action = 'close';

                        $panel.trigger('panel' + _action + '.' + ns, {heading : $heading})[actions[_action]]();
                    });
                }

                $panel.trigger('panel' + action + '.' + ns, {heading : $heading})[actions[action]]();
            });

        });
    };

    /**
     * Toggle section display
     *
     * @param sections
     */
    var _toggleSections = function(sections, preserveOthers, state){
        sections.each(function(){
            $(this).find(heading).trigger('click', {preserveOthers : preserveOthers, forceState : state});
        });
    };

    /**
     * Close specific sections
     *
     * @param sections
     */
    var closeSections = function(sections, preserveOthers){
        _toggleSections(sections, !!preserveOthers, 'close');
    };

    /**
     * Open specific sections
     *
     * @param sections
     */
    var openSections = function(sections, preserveOthers){
        _toggleSections(sections, !!preserveOthers, 'open');
    };

    /**
     * toggle availability of sub group
     * @param subGroup
     */
    var _toggleSubGroup = function(subGroup, state){
        subGroup = $('.' + subGroup);
        if(subGroup.length){
            var fn = state === 'disable' ? 'addClass' : 'removeClass';
            subGroup.data('cover')[fn]('blocking');
        }
    };

    /**
     * enable sub group
     * @param subGroup
     */
    var enableSubGroup = function(subGroup){
        _toggleSubGroup(subGroup, 'enable');
    };

    /**
     * disable sub group
     * @param subGroup
     */
    var disableSubGroup = function(subGroup){
        _toggleSubGroup(subGroup, 'disable');
    };

    return {
        initFormVisibilityListener : initFormVisibilityListener,
        setItemSidebarMode : function(mode){
            return setItemSidebarMode(mode);
        },
        showPanel : showPanel,
        toggleInlineInteractionGroup : toggleInlineInteractionGroup,
        initSidebarAccordion : initSidebarAccordion,
        openSections : openSections,
        closeSections : closeSections,
        enableSubGroup : enableSubGroup,
        disableSubGroup : disableSubGroup
    };

});
