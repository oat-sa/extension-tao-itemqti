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

        var sidebarAccordionInit = function () {

            elements.sidebars.each(function () {
                var $sidebar = $(this),
                    $sections = $sidebar.find('section'),
                    $allPanels = $sidebar.find('hr, .panel').hide(),
                    $allTriggers = $sidebar.find('h2');

                $allTriggers.each(function () {
                    var $heading = $(this),
                        $section = $heading.parents('section'),
                        $panel   = $section.find('hr, .panel'),
                        $closer = $('<span>', { 'class': 'icon-up'}),
                        $opener = $('<span>', { 'class': 'icon-down'});

                    $heading.append($closer).append($opener).addClass('closed');

                    $panel.on('panelclose.accordion', function(e, args) {
                        args.heading.addClass('closed');
                    });

                    $panel.on('panelopen.accordion', function(e, args) {
                        args.heading.removeClass('closed');
                    });

                    if($panel.is(':visible')) {
                        $panel.trigger('panelopen.accordion', { heading: $heading });
                    }
                    else {
                        $panel.trigger('panelclose.accordion', { heading: $heading });
                    }
                });

                $sections.each(function () {

                    $(this).find('h2').on('click', function (e, args) {
                        var $heading = $(this),
                            $panel   = $heading.parents('section').find('hr, .panel'),
                            preserveOthers = !!(args && args.preserveOthers);
                            
                        // whether or not to close other sections in the same sidebar
                        //@todo : to change the style to accordion
                        if(false && !preserveOthers) {
                            $allPanels.not($panel).each(function() {
                                var $panel = $(this),
                                    $heading = $panel.parent().find('h2');

                                $panel.trigger('panelclose.accordion', { heading: $heading }).hide();
                            });
                        }

                        if($heading.hasClass('closed')) {
                            $panel.trigger('panelopen.accordion', { heading: $heading }).slideDown();
                        }
                        else {
                            $panel.trigger('panelclose.accordion', { heading: $heading }).hide();
                        }
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
                $(this).find('h2').trigger('click', { preserveOthers: !!preserveOthers });
            });
        };

        var initGui = function () {


            // adapt height of sidebars and item area
            var height = 0;
            elements.sidebars.add(elements.itemPanel).each(function () {
                height = Math.max($(this).height(), height);
            }).height(height);


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

            openSections($('#sidebar-left-section-content-block, #sidebar-left-section-block-interactions'), true);

            elements.itemPanel.addClass('has-item');

            // display toolbar and sidebar
            //elements.sidebars.add(elements.toolbarInner).fadeTo(2000, 1);
        };

        return {
            initGui: initGui,
            openSections: openSections
        };

    }());
    return editor;
});


