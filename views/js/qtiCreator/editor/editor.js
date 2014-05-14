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
         * Open specific sections
         *
         * @param sections
         */
        var openSections = function(sections, preserveOthers) {
            sections.each(function(){
                $(this).find(heading).trigger('click', { preserveOthers: preserveOthers });
            });
        };

        // display the sidebar and its sections temporarily to calculate the height
        var _tmpDisplay = function($elements, reset) {
            $elements.each(function() {
                var $element = $(this);
                if(reset) {
                    $element.css('display', $element.prop('old-display'));
                    $element.prop('old-display', null);
                }
                else {
                    $element.prop('old-display', $element.css('display'));
                    $element.css('display', 'block');
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
                    blocks = block.add(block.find('section'));
                // work around the fact that the sidebars might be hidden at this point
                _tmpDisplay(blocks);
                height = Math.max($(this).height(), height);
                _tmpDisplay(blocks, true);
            }).height(height);
        };

        /**
         * Initialize interface
         */
        var initGui = function () {


            adaptHeight();

            // toggle blocks in sidebar
            // note that this must happen _after_ the height has been adapted
            sidebarAccordionInit();

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
                $('#sidebar-left-section-content-block, #sidebar-left-section-content-element, #sidebar-left-section-block-interactions'),
                true
            );

            elements.itemPanel.addClass('has-item');

            // display toolbar and sidebar
            //elements.sidebars.add(elements.toolbarInner).fadeTo(2000, 1);

        };

        return {
            initGui: initGui,
            openSections: openSections,
            adaptHeight: adaptHeight
        };

    }());
    return editor;
});


