define([
    'jquery',
    'store',
    'i18n',
    'taoQtiItem/qtiCreator/editor/base',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'json!taoQtiItem/qtiCreator/editor/resources/device-list.json',
    'select2'
], function ($, store, __, base, commonRenderer, deviceList) {
    'use strict'

    var overlay,
        container,
        togglersByTarget = {};

    /**
     *
     * @returns {boolean}
     */
    var createWidget = function (item) {

        if (!!overlay && overlay.length) {
            return false;
        }

        /**
         * Mobile-only functions
         */
        var mobile = (function () {

            var orientationToClass = function (orientation) {
                return 'mobile-preview-' + orientation;
            };

            var getOrientation = function () {
                return store.get('orientation') === 'landscape' ? 'landscape' : 'portrait';
            };

            return {
                getOrientation: getOrientation,
                orientationToClass: orientationToClass
            }
        }());

        /**
         * Create an item on the toolbar
         *
         * @param tool
         * @param type
         * @returns {void|*}
         */
        var createTool = function (tool, type) {
            var className = type ? 'lft ' + type + '-only' : 'lft';
            return $('<li>', {
                class: className
            }).append(tool);
        };

        /**
         * creates list of devices from devices.json
         *
         * @returns {*|HTMLElement}
         */
        var createDeviceSelector = function (type) {
            var device,
                devices,
                currDevice = store.get('current-' + type + '-device') || '',
                option,
                select = $('<select>', {
                    class: type + '-device-selector'
                }),
                container = $('.' + type + '-preview-container');

            // @todo this part is a bit dodgy, device list should be generated differently
            switch (type) {
                case 'mobile':
                    devices = deviceList['tablets'];
                    break;
                case 'desktop':
                    devices = deviceList['screens'];
                    break;
            }

            for (device in devices) {
                if (devices.hasOwnProperty(device)) {
                    option = $('<option>', {
                        value: [devices[device].dpWidth, devices[device].dpHeight].join(','),
                        text: devices[device].label
                    });
                    if (currDevice === devices[device].label) {
                        option.prop('selected', true);
                    }
                    select.append(option);
                }
            }
            return select;
        };

        /**
         * Change orientation of the tablet preview
         *
         * @returns {*|HTMLElement}
         */
        var createOrientationSelector = function () {
            var select = $('<select>', {
                    class: 'mobile-orientation-selector'
                }),
                orientations = {
                    landscape: __('Landscape'),
                    portrait: __('Portrait')
                },
                currOrientation = store.get('preview-orientation') || 'landscape',
                orientation,
                option;
            for (orientation in orientations) {
                if (orientations.hasOwnProperty(orientation)) {
                    option = $('<option>', {
                        value: orientation,
                        text: orientations[orientation]
                    });
                    if (currOrientation === orientation) {
                        option.prop('selected', true);
                    }
                    select.append(option);
                }
            }
            return select;
        };

        // @todo this is the old version written for mobile only
        // this version is working, function 'setupDeviceSelector' below has a bug
        // possible (even likely) reason: wrong preset from storage
        var legacySetupDeviceSelector = function (deviceSelector, mobilePreviewContainer) {

            deviceSelector.on('change', function () {
                var elem = $(this),
                    val = elem.val().split(','),
                    scaleFactor = parseFloat(val.pop()),
                    text = elem.find('option:selected').text(),
                    isLandscape = mobile.getOrientation() === 'landscape',
                    animationSettings,
                    i = val.length;

                while (i--) {
                    val[i] = parseFloat(val[i]) / scaleFactor;
                }

                animationSettings = {
                    width: isLandscape ? val[0] : val[1],
                    height: isLandscape ? val[1] : val[0]
                };

                if (animationSettings.width === container.width()
                    && animationSettings.height === container.height()) {
                    return false;
                }

                console.log(animationSettings, mobilePreviewContainer);
                mobilePreviewContainer.animate(animationSettings, function () {
                    store.set('device', text);
                });
            });

            deviceSelector.select2({
                minimumResultsForSearch: -1
            });

            // set initial size of mobile device
            deviceSelector.trigger('change');
        };

        /**
         * functionality of device selector
         *
         * @param type
         */
        var setupDeviceSelector = function (type) {

            var deviceSelector = $('.' + type + '-device-selector'),
                previewContainer = $('.' + type + '-preview-frame');

            deviceSelector.on('change', function () {
                var elem = $(this),
                    val = elem.val().split(','),
                    text = elem.find('option:selected').text(),
                    animationSettings,
                    i = val.length;

                while (i--) {
                    val[i] = parseFloat(val[i]);
                }

                if (type === 'mobile' && mobile.getOrientation() === 'portrait') {
                    animationSettings = {
                        width: val[1],
                        height: val[0]
                    };
                }
                else {
                    animationSettings = {
                        width: val[0],
                        height: val[1]
                    };
                }

                if (animationSettings.width === container.width()
                    && animationSettings.height === container.height()) {
                    return false;
                }

                previewContainer.animate(animationSettings, function () {
                    store.set(type + '-device-selector', text);
                });
            });

            deviceSelector.select2({
                minimumResultsForSearch: -1
            });

            // set initial size of mobile device
            deviceSelector.trigger('change');
        };


        /**
         * functionality of orientation selector
         *
         * @param orientationSelector
         * @param mobilePreviewContainer
         */
        var setupOrientationSelector = function (orientationSelector, mobilePreviewContainer) {

            orientationSelector.on('change', function () {
                var newOrientation = $(this).val(),
                    oldOrientation = mobile.getOrientation(),
                    animationSettings,
                    mobilePreviewFrame = $('.preview-mobile-frame');

                if (newOrientation === oldOrientation) {
                    return false;
                }

                animationSettings = {
                    height: mobilePreviewContainer.width(),
                    width: mobilePreviewContainer.height()
                };

                mobilePreviewContainer.animate(animationSettings, function () {
                    mobilePreviewFrame.removeClass(mobile.orientationToClass(mobile.getOrientation()))
                        .addClass(mobile.orientationToClass(newOrientation));
                    store.set('orientation', newOrientation);
                });

            });


            orientationSelector.select2({
                minimumResultsForSearch: -1
            });

            // set initial orientation of mobile device
            orientationSelector.trigger('change');
        };

        /**
         * The little warning at the very top
         *
         * @returns {*|HTMLElement}
         */
        var createFeedback = function () {
            var feedback = $('<div>', {
                class: 'tbl-cell'
            });
            feedback.append($('<div>', {
                class: 'feedback-info small',
                html: '<span class="icon-info"/>' + __('Final rendering may differ from this preview!')
            }));
            return feedback;
        };


        /**
         * Create container for item
         *
         * @param type
         * @returns {*|HTMLElement}
         */
        var createPreviewFrame = function (type) {
            var previewFrame = $('<div>', {
                class: type + '-preview-frame ' + type + '-only preview-outer-frame'
            });
            var previewContainer = $('<div>', {
                class: type + '-preview-container'
            });
            var previewItemContainer = $('<div>', {
                class: type + '-preview-item-container item-container'
            });
            if (type === 'mobile') {
                previewFrame.addClass(mobile.orientationToClass(mobile.getOrientation()));
            }
            previewContainer.append(previewItemContainer);
            previewFrame.append(previewContainer);
            return previewFrame;
        };

        /**
         * Toggle between mobile and desktop
         *
         * @param type
         * @returns {*}
         */
        var createToggler = function (type) {
            var toggler,
                toggleText,
                toggleTarget,
                icon;

            // view togglers
            if (type === 'mobile') {
                toggleText = __('Switch to desktop');
                toggleTarget = 'desktop';
                icon = 'icon-desktop-preview';
            }
            else {
                toggleText = __('Switch to mobile');
                toggleTarget = 'mobile';
                icon = 'icon-mobile-preview';
            }


            toggler = $('<span>', {
                class: 'btn-info toggle-view small',
                html: '<span class="' + icon + '"/>' + toggleText
            }).prop('target', toggleTarget);

            toggler.on('click', function () {
                var target = $(this).prop('target'),
                    newClass = 'preview-' + target,
                    oldClass = newClass === 'preview-desktop' ? 'preview-mobile' : 'preview-desktop',
                    targetContainer =  $('.' + target + '-preview-item-container');

                overlay.removeClass(oldClass).addClass(newClass);
                store.set('preview-type', target);
                targetContainer.empty();
                commonRenderer.render(item, targetContainer);
            });

            // add toggler to global object
            togglersByTarget[toggleTarget] = toggler;

            return toggler;
        };

        /**
         * Close preview
         *
         * @returns {*|HTMLElement}
         */
        var createCloser = function () {
            var closer = $('<span>', {
                class: 'btn-info small',
                html: __('Close') + ' <span class="icon-close r"/>'
            });
            closer.on('click', function () {

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
        var createPreviewHeading = function (type) {

            return $('<h1>', {
                class: type + '-preview-heading ' + type + '-only preview-heading tbl-cell',
                text: (type === 'mobile') ? __('Mobile Preview') : __('Desktop Preview')
            });
        };

        /**
         * Build the whole shebang
         */
        var setup = function () {
            var type = store.get('preview-type') || 'desktop',
                types = ['mobile', 'desktop'],
                iT = types.length,
                previews = {},
                headings = {},
                form = $('<form>', {
                    class: 'preview-utility-bar plain',
                    autocomplete: 'off'
                }),
                formInner = $('<div>', {
                    class: 'preview-utility-bar-inner tbl'
                }),
                canvas = $('<div>', {
                    class: 'preview-canvas'
                }),
                feedback = createFeedback(),
                deviceSelectors = {},
                orientationSelector = createOrientationSelector(),
                viewTogglers = {},
                tools = $('<ul>', {
                    class: 'plain tbl-cell clearfix'
                }),
                closer = createCloser();

            overlay = $('<div>', {
                class: 'preview-overlay tao-scope overlay preview-' + type});
            container = $('<div>', {class: 'preview-container'});


            while (iT--) {
                previews[types[iT]] = createPreviewFrame(types[iT]);
                viewTogglers[types[iT]] = createToggler(types[iT]);
                deviceSelectors[types[iT]] = createDeviceSelector(types[iT]);
                headings[types[iT]] = createPreviewHeading(types[iT]);
                formInner.append(headings[types[iT]]);
            }


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

            setupDeviceSelector('mobile');
            setupDeviceSelector('desktop');

            setupOrientationSelector(orientationSelector, previews['mobile']);

            $(document.body).append(overlay);

            overlay.hide();

            $(document).keyup(function (e) {
                if (e.keyCode == 27) {
                    closer.trigger('click');
                }
            });
        };

        setup();

        return container;
    };


    var preview = (function ($) {


        /**
         * Create preview
         *
         * @param launchers button to launch preview
         * @param item
         */
        var init = function (launchers, item) {

            createWidget(item);

            $(launchers).on('click', function () {
                // launch the correct preview
                // currently not in use but could easily be created
                // by adding something like '<span class="icon-mobile-preview" data-preview-type="mobile">
                // to the DOM
                var type = $(this).data('preview-type') || 'desktop';

                if (togglersByTarget[type]) {
                    togglersByTarget[type].trigger('click');
                }

                overlay.fadeIn(function () {
                    overlay.height($(document).outerHeight());
                });
            });
        };

        return {
            init: init
        }
    }($));

    return preview;
});


