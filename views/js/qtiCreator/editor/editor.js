define([
    'jquery'
], function ($) {
    'use strict'


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
                    $allPanels = $sidebar.find('hr, .panel'),
                    $allTriggers = $sidebar.find('h2');

                $allTriggers.each(function () {
                    var $closer = $('<span>', { 'class': 'icon-up'}),
                        $opener = $('<span>', { 'class': 'icon-down'});
                    $(this).append($closer).append($opener).addClass('closed');
                });

                $sections.each(function () {
                    var $section = $(this),
                        $trigger = $section.find('h2'),
                        $panel = $section.find('hr, .panel');

                    $trigger.on('click', function (e, args) {
                        var $currTrigger = $(this),
                            preserveOthers = !!(args && args.preserveOthers);
                        // whether or not to close other sections in the same sidebar

                        if(!preserveOthers) {
                            $allPanels.not($panel).slideUp();
                            $allTriggers.not($currTrigger).addClass('closed');
                        }

                        if($currTrigger.hasClass('closed')) {
                            $currTrigger.removeClass('closed');
                            $panel.slideDown();
                        }
                        else {
                            $trigger.addClass('closed');
                            $panel.slideUp();
                        }
                    })

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
                $(this).find('h2').trigger('click', { preserveOthers: !!preserveOthers })
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


            openSections( elements.sidebars.find('section').first(), true)


            elements.itemPanel.addClass('has-item');

            // display toolbar and sidebar
            //elements.sidebars.add(elements.toolbarInner).fadeTo(2000, 1);
            //elements.sidebars.add(elements.toolbarInner).show().css('opacity', 1);
            //console.log(elements.sidebars.add(elements.toolbarInner))
        };

        return {
            initGui: initGui,
            openSections: openSections
        }

    }());
    return editor;
});


