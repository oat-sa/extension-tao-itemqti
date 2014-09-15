define([
    'lodash',
    'jquery'
], function(_, $){

    'use strict';

    var editor = (function(){

        var elements = {};


        var _setupElements = function(){
            var _elements = {
                scope : '#item-editor-scope',
                toolbarInner : '#item-editor-toolbar-inner',
                sidebars : '.item-editor-sidebar',
                itemBar : '#item-editor-item-bar',
                itemPanel : '#item-editor-panel',
                scrollOuter : '#item-editor-scroll-outer',
                scrollInner : '#item-editor-scroll-inner',
                label: '#item-editor-label',
                actionGroups: '.action-group'
            },
            element;
            for(element in _elements){
                elements[element] = $(_elements[element]);
            }
            elements.columns = elements.sidebars.add(elements.itemPanel);
        };

        // selectors and classes
        var heading = 'h2',
            section = 'section',
            panel = 'hr, .panel',
            closed = 'closed',
            ns = 'accordion';

        /**
         * setup accordion
         */
        var sidebarAccordionInit = function(){

            elements.sidebars.each(function(){
                var $sidebar = $(this),
                    $sections = $sidebar.find(section),
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

        /**
         * Initialize interface
         */
        var initGui = function(config){

            _setupElements();

            // toggle blocks in sidebar
            // note that this must happen _after_ the height has been adapted
            sidebarAccordionInit();

            // close all
            closeSections(elements.sidebars.find(section));


            openSections($('#sidebar-left-section-common-interactions'), false);

            elements.itemPanel.addClass('has-item');

            elements.label.find('span').text(config.$label);

            elements.actionGroups.show();

        };


        return {
            initGui : initGui,
            openSections : openSections,
            closeSections : closeSections,
            enableSubGroup : enableSubGroup,
            disableSubGroup : disableSubGroup
        };

    }());
    
    return editor;
});


