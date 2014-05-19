define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'json!taoQtiItem/qtiCreator/editor/resources/device-list.json',
    'select2'
], function($, __, commonRenderer, deviceList){
    'use strict'

    var overlay,
        container,
        togglersByTarget = {},
        currOrientation = 'landscape',
        currPreviewType = 'desktop',
        $doc = $(document);

    /**
     *
     * @returns {boolean}
     */
    var createWidget = function(item){

        if(!!overlay && overlay.length){
            return false;
        }

        /**
         * Create an item on the toolbar
         *
         * @param tool
         * @param type
         * @returns {void|*}
         */
        var createTool = function(tool, type){
            return $('<li>', {
                class : (type ? 'lft ' + type + '-only' : 'lft')
            }).append(tool);
        };

        /**
         * creates list of devices from devices.json
         *
         * @returns {*|HTMLElement}
         */
        var createDeviceSelector = function(type){
            var device,
                devices,
                option,
                select = $('<select>', {
                class : type + '-device-selector'
            });


            /*
             * @todo
             * The device list is currently based on the devices found on the Chrome emulator.
             * This is not ideal and should be changed in the future.
             * I have http://en.wikipedia.org/wiki/List_of_displays_by_pixel_density in mind but we
             * will need to figure what criteria to apply when generating the list.
             */
            switch(type){
                case 'mobile':
                    devices = deviceList['tablets'];
                    break;
                case 'desktop':
                    devices = deviceList['screens'];
                    break;
            }

            for(device in devices){
                if(devices.hasOwnProperty(device)){
                    option = $('<option>', {
                        value : [devices[device].width, devices[device].height].join(','),
                        text : devices[device].label
                    });
                    if(currPreviewType === devices[device].label){
                        option.prop('selected', true);
                    }
                    select.append(option);
                }
            }

            select.on('change', function(){
                var elem = $(this),
                    val = elem.val().split(','),
                    animationSettings,
                    i = val.length,
                    container = $('.' + type + '-preview-container');


                while(i--){
                    val[i] = parseFloat(val[i]);
                }

                if(type === 'mobile' && currOrientation === 'portrait'){
                    animationSettings = {
                        width : val[1],
                        height : val[0]
                    };
                }
                else{
                    animationSettings = {
                        width : val[0],
                        height : val[1]
                    };
                }

                if(animationSettings.width === container.width()
                    && animationSettings.height === container.height()){
                    return false;
                }

                container.animate(animationSettings, function(){
                    currPreviewType = type;
                });
            });

            return select;
        };

        /**
         * Change orientation of the tablet preview
         *
         * @returns {*|HTMLElement}
         */
        var createOrientationSelector = function(mobilePreviewContainer){

            mobilePreviewContainer = mobilePreviewContainer.find('.preview-container');

            var select = $('<select>', {
                class : 'mobile-orientation-selector'
            }),
            orientations = {
                landscape : __('Landscape'),
                portrait : __('Portrait')
            },
            orientation,
                option;
            for(orientation in orientations){
                if(orientations.hasOwnProperty(orientation)){
                    option = $('<option>', {
                        value : orientation,
                        text : orientations[orientation]
                    });
                    if(currOrientation === orientation){
                        option.prop('selected', true);
                    }
                    select.append(option);
                }
            }
            select.on('change', function(){
                var newOrientation = $(this).val(),
                    animationSettings,
                    mobilePreviewFrame = $('.preview-mobile-frame');

                if(newOrientation === currOrientation){
                    return false;
                }

                animationSettings = {
                    height : mobilePreviewContainer.width(),
                    width : mobilePreviewContainer.height()
                };

                mobilePreviewContainer.animate(animationSettings, function(){
                    mobilePreviewFrame.removeClass('mobile-preview-' + currOrientation)
                        .addClass('mobile-preview-' + newOrientation);

                    // reset global orientation
                    currOrientation = newOrientation;
                });

            });
            return select;
        };

        /**
         * The little warning at the very top
         *
         * @returns {*|HTMLElement}
         */
        var createFeedback = function(){
            var feedback = $('<div>', {
                class : 'tbl-cell'
            });
            feedback.append($('<div>', {
                class : 'feedback-info small',
                html : '<span class="icon-info"/>' + __('Final rendering may differ from this preview!')
            }));
            return feedback;
        };

        /**
         * Create container for item
         *
         * @param type
         * @returns {*|HTMLElement}
         */
        var createPreviewFrame = function(type){
            var previewFrame = $('<div>', {
                class : type + '-preview-frame ' + type + '-only preview-outer-frame'
            });
            var previewContainer = $('<div>', {
                class : type + '-preview-container preview-container'
            });
            if(type === 'mobile'){
                previewFrame.addClass('mobile-preview-' + currOrientation);
            }
            previewFrame.append(previewContainer);
            return previewFrame;
        };

        /**
         * Toggle between mobile and desktop
         *
         * @param type
         * @returns {*}
         */
        var createToggler = function(type){
            var toggler,
                toggleText,
                toggleTarget,
                icon;

            // view togglers
            if(type === 'mobile'){
                toggleText = __('Switch to desktop');
                toggleTarget = 'desktop';
                icon = 'icon-desktop-preview';
            }
            else{
                toggleText = __('Switch to mobile');
                toggleTarget = 'mobile';
                icon = 'icon-mobile-preview';
            }


            toggler = $('<span>', {
                class : 'btn-info toggle-view small',
                html : '<span class="' + icon + '"/>' + toggleText
            }).prop('target', toggleTarget);

            toggler.on('click', function(){
                var target = $(this).prop('target'),
                    newClass = 'preview-' + target,
                    oldClass = newClass === 'preview-desktop' ? 'preview-mobile' : 'preview-desktop',
                    targetContainer = $('.' + target + '-preview-container');

                overlay.removeClass(oldClass).addClass(newClass);
                currPreviewType = target;
                targetContainer.empty();
                commonRenderer.render(item, targetContainer);
            });

            // add toggler to global collection
            togglersByTarget[toggleTarget] = toggler;

            return toggler;
        };

        /**
         * Close preview
         *
         * @returns {*|HTMLElement}
         */
        var createCloser = function(){
            var closer = $('<span>', {
                class : 'btn-info small',
                html : __('Close') + ' <span class="icon-close r"/>'
            });
            closer.on('click', function(){
                commonRenderer.setContext($('.item-editor-item'));
                overlay.fadeOut();
            });
            return closer;
        };

        /**
         * Heading, i.e. Desktop preview|Mobile preview
         * @param type
         * @returns {*|HTMLElement}
         */
        var createPreviewHeading = function(type){

            return $('<h1>', {
                class : type + '-preview-heading ' + type + '-only preview-heading tbl-cell',
                text : (type === 'mobile') ? __('Mobile Preview') : __('Desktop Preview')
            });
        };

        /**
         * Build the whole shebang
         */
        (function(){
            var types = ['mobile', 'desktop'],
                iT = types.length,
                previews = {},
                headings = {},
                form = $('<form>', {
                class : 'preview-utility-bar plain',
                autocomplete : 'off'
            }),
            formInner = $('<div>', {
                class : 'preview-utility-bar-inner tbl'
            }),
            canvas = $('<div>', {
                class : 'preview-canvas'
            }),
            feedback = createFeedback(),
                deviceSelectors = {},
                orientationSelector,
                viewTogglers = {},
                tools = $('<ul>', {
                class : 'plain tbl-cell clearfix'
            }),
            closer = createCloser();

            overlay = $('<div>', {
                class : 'preview-overlay tao-scope overlay preview-' + currPreviewType
            });
            container = $('<div>', {
                class : 'preview-container-outer'
            });


            while(iT--){
                previews[types[iT]] = createPreviewFrame(types[iT]);
                viewTogglers[types[iT]] = createToggler(types[iT]);
                deviceSelectors[types[iT]] = createDeviceSelector(types[iT]);
                headings[types[iT]] = createPreviewHeading(types[iT]);
                formInner.append(headings[types[iT]]);
            }

            orientationSelector = createOrientationSelector(previews['mobile']);

            tools.append(createTool(deviceSelectors['desktop'], 'desktop'));
            tools.append(createTool(viewTogglers['desktop'], 'desktop'));

            tools.append(createTool(deviceSelectors['mobile'], 'mobile'));
            tools.append(createTool(orientationSelector, 'mobile'));
            tools.append(createTool(viewTogglers['mobile'], 'mobile'));

            tools.append(createTool(closer, false));

            formInner.append(feedback);
            formInner.append(tools);

            form.append(formInner);

            canvas.append(form);
            canvas.append(previews['desktop']);
            canvas.append(previews['mobile']);

            container.append(canvas);

            overlay.append(container);

            overlay.find('select').select2({
                minimumResultsForSearch : -1
            });

            $doc.find('body').append(overlay);

            overlay.hide();

            $doc.keyup(function(e){
                if(e.keyCode == 27){
                    closer.trigger('click');
                }
            });
        })();

        return container;
    };


    return (function($){

        var destroy = function(){
            $('.preview-overlay').remove();
            overlay = null;
            container = null;
        };

        /**
         * Create preview
         *
         * @param launchers - buttons to launch preview
         * @param item
         */
        var init = function(launchers, item){
            
            destroy();
            
            createWidget(item);

            $(launchers).on('click', function(){
                currPreviewType = $(this).data('preview-type') || 'desktop';

                if(togglersByTarget[currPreviewType]){
                    togglersByTarget[currPreviewType].trigger('click');
                }
                
                
                console.log(overlay);
                
                overlay.fadeIn(function(){
                    overlay.height($doc.outerHeight());
                    overlay.find('select').trigger('change');
                });
            });
        };

        return {
            init : init
        }
    }($));
});