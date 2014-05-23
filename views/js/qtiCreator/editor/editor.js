define([
    'jquery'
], function ($) {
    
    'use strict';

    var editor = (function () {

        var elements = {
            scope: $('#item-editor-scope'),
            toolbar: $('#item-editor-toolbar'),
            toolbarInner: $('#item-editor-toolbar-inner'),
            sidebars: $('.item-editor-sidebar'),
            itemBar: $('#item-editor-item-bar'),
            itemPanel: $('#item-editor-panel')
        };

        // selectors and classes
        var heading = 'h2',
            section = 'section',
            panel   = 'hr, .panel',
            closed  = 'closed',
            ns      = 'accordion';


        var buildSubGroups = function () {
            elements.sidebars.find('[data-sub-group]').each(function() {
                var $element   = $(this),
                    $section   = $element.parents('section'),
                    subGroup   = $element.data('sub-group'),
                    $subGroupPanel,
                    $subGroupList,
                    $cover;

                if(!subGroup) {
                    return;
                }

                $subGroupPanel = $section.find('.sub-group.' + subGroup);
                $subGroupList = $subGroupPanel.find('.tool-list');
                if(!$subGroupPanel.length) {
                    $subGroupPanel = $('<div>', { 'class': 'panel clearfix sub-group ' + subGroup });
                    $subGroupList = $('<ul>', { 'class': 'tool-list plain clearfix' });
                    $subGroupPanel.append($subGroupList);
                    $section.append($subGroupPanel);
                    $cover = $('<div>', { 'class': 'sub-group-cover'});
                    $subGroupPanel.append($cover);
                    $subGroupPanel.data('cover', $cover);
                }
                $subGroupList.append($element);
            });

        };

        /**
         * setup accordion
         */
        var sidebarAccordionInit = function () {

            elements.sidebars.each(function () {
                var $sidebar = $(this),
                    $sections = $sidebar.find(section),
                    $allPanels = $sidebar.children(panel).hide(),
                    $allTriggers = $sidebar.find(heading);


                // setup events
                $allTriggers.each(function () {
                    var $heading = $(this),
                        $section = $heading.parents(section),
                        $panel   = $section.children(panel),
                        $closer = $('<span>', { 'class': 'icon-up'}),
                        $opener = $('<span>', { 'class': 'icon-down'}),
                        action  = $panel.is(':visible') ? 'open' : 'close';

                    $heading.append($closer).append($opener).addClass(closed);

                    // toggle heading class arrow (actually switch arrow)
                    $panel.on('panelclose.' + ns + ' panelopen.' + ns, function(e, args) {
                        var fn = e.type === 'panelclose' ? 'add' : 'remove';
                        args.heading[fn + 'Class'](closed);
                    });


                    $panel.trigger('panel' + action + '.' + ns, { heading: $heading });
                });

                $sections.each(function () {

                    // assign click action to headings
                    $(this).find(heading).on('click', function (e, args) {

                        var $heading = $(this),
                            $panel   = $heading.parents(section).children(panel),
                            preserveOthers = !!(args && args.preserveOthers),
                            actions = {
                                close: 'hide',
                                open: 'fadeIn'
                            },
                            action,
                            forceState = (args && args.forceState ? args.forceState : false),
                            classFn;

                        if(forceState) {
                            classFn = forceState === 'open' ? 'addClass' : 'removeClass';
                            $heading[classFn](closed);
                        }

                        action = $heading.hasClass(closed) ? 'open' : 'close';

                        // whether or not to close other sections in the same sidebar
                        // @todo (optional): remove 'false' in the condition below
                        // to change the style to accordion, i.e. to allow for only one open section
                        if(false && !preserveOthers) {
                            $allPanels.not($panel).each(function() {
                                var $panel = $(this),
                                    $heading = $panel.parent().find(heading),
                                    _action = 'close';

                                $panel.trigger('panel' + _action + '.' + ns, { heading: $heading })[actions[_action]]();
                            });
                        }

                        $panel.trigger('panel' + action + '.' + ns, { heading: $heading })[actions[action]]();
                    });

                });
            });
        };

        /**
         * Toggle section display
         *
         * @param sections
         */
        var _toggleSections = function(sections, preserveOthers, state) {
            sections.each(function(){
                $(this).find(heading).trigger('click', { preserveOthers: preserveOthers, forceState: state });
            });
        };

        /**
         * Close specific sections
         *
         * @param sections
         */
        var closeSections = function(sections, preserveOthers) {
            _toggleSections(sections, !!preserveOthers, 'close');
        };

        /**
         * Open specific sections
         *
         * @param sections
         */
        var openSections = function(sections, preserveOthers) {
            _toggleSections(sections, !!preserveOthers, 'open');
        };

        // display the sidebar and its sections temporarily to calculate the height
        var _tmpDisplay = function($elements, reset) {
            $elements.each(function() {
                var $element = $(this);
                if(reset) {
                    $element.css('display', $element.prop('old-display'));
                    $element.css('opacity', $element.prop('old-opacity'));
                    $element.removeProp('old-display');
                    $element.removeProp('old-opacity');
                }
                else {
                    $element.prop('old-display', $element.css('display'));
                    $element.prop('old-opacity', $element.css('opacity'));
                    $element.css('display', 'block');
                    $element.css('opacity', 0);
                }
            });
        };

        /**
         * Adapt height of sidebars and content
         */
        var adaptHeight = function() {
            var height = 0;
            elements.sidebars.add(elements.itemPanel).each(function () {
                var block = $(this),
                    blocks = block.add(block.find('section hr .panel'));
                // work around the fact that the sidebars might be hidden at this point
                _tmpDisplay(blocks);
                height = Math.max(block.height(), height);
                _tmpDisplay(blocks, true);
            }).height(height);
        };


        /**
         * toggle availability of sub group
         * @param subGroup
         */
        var _toggleSubGroup = function(subGroup, state) {
            $('.'+subGroup).data('cover')[state]();
        };


        /**
         * enable sub group
         * @param subGroup
         */
        var enableSubGroup = function(subGroup) {
            _toggleSubGroup(subGroup, 'hide');
        };

        /**
         * disable sub group
         * @param subGroup
         */
        var disableSubGroup = function(subGroup) {
            _toggleSubGroup(subGroup, 'show');
        };

        /**
         * Initialize interface
         */
        var initGui = function () {

            buildSubGroups();

            // toggle blocks in sidebar
            // note that this must happen _after_ the height has been adapted
            sidebarAccordionInit();

            // close all
            closeSections(elements.sidebars.find(section));

            adaptHeight();

            /* At the time of writing this the following sections are available:
             *
             * #sidebar-left-section-text
             * #sidebar-left-section-block-interactions
             * #sidebar-left-section-inline-interactions
             * #sidebar-left-section-graphic-interactions
             * #sidebar-left-section-media
             * #sidebar-right-css-manager
             * #sidebar-right-style-editor
             * #sidebar-right-item-properties
             * #sidebar-right-body-element-properties
             * #sidebar-right-text-block-properties
             * #sidebar-right-interaction-properties
             * #sidebar-right-choice-properties
             * #sidebar-right-response-properties
             */

            openSections(
                $('#sidebar-left-section-content-blocks, #sidebar-left-section-content-elements, #sidebar-left-section-block-interactions'),
                false
            );

            elements.itemPanel.addClass('has-item');

            // display toolbar and sidebar
            //elements.sidebars.add(elements.toolbarInner).fadeTo(2000, 1);

        };

        return {
            initGui: initGui,
            openSections: openSections,
            closeSections: closeSections,
            adaptHeight: adaptHeight,
            enableSubGroup: enableSubGroup,
            disableSubGroup: disableSubGroup
        };

    }());
    return editor;
});


