define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'json!taoQtiItem/qtiCreator/editor/resources/device-list.json',
    'tpl!taoQtiItem/qtiCreator/tpl/preview/preview',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'helpers',
    'ui/modal',
    'select2'
], function($, _, __, commonRenderer, deviceList, previewTpl, styleEditor, helpers) {
    'use strict'

    var overlay,
        container,
        togglersByTarget = {},
        orientation = 'landscape',
        previewType = 'desktop',
        previewTypes = ['desktop', 'mobile'],
        $doc = $(document),
        $window = $(window),
        screenSize = {
            width: $window.innerWidth(),
            height: $window.innerWidth()
        },
        maxDeviceSize = {
            width: 0,
            height: 0
        },
        scaleFactor = 1,
        hasBeenSavedOnce = false,
        typeDependant;

    /**
     * Create data set for device selectors
     *
     * @param type
     * @returns {Array}
     * @private
     */
    var _getDeviceSelectorData = function(type) {

        /*
         * @todo
         * The device list is currently based on the devices found on the Chrome emulator.
         * This is not ideal and should be changed in the future.
         * I have http://en.wikipedia.org/wiki/List_of_displays_by_pixel_density in mind but we
         * will need to figure what criteria to apply when generating the list.
         */
        var devices = type === 'mobile' ? deviceList['tablets'] : deviceList['screens'],
            options = [];

        _.forEach(devices, function(value) {

            // figure out the widest possible screen to calculate the scale factor
            maxDeviceSize = {
                width: Math.max(maxDeviceSize.width, value.width),
                height: Math.max(maxDeviceSize.height, value.height)
            };

            options.push({
                value: [value.width, value.height].join(','),
                label: value.label,
                selected: previewType === value.label
            });
        });

        return options;
    };

    /**
     * Collect all elements that can toggle their class name between mobile-* and desktop-*
     *
     * @private
     */
    var _setupTypeDependantElements = function() {
        typeDependant = overlay.add(overlay.find('.preview-scale-container').find('[class*="' + previewType + '"]'));
    };


    /**
     * Change the class name of all type dependant elements
     *
     * @param type
     */
    var _setPreviewType = function(newType) {

        if (newType === previewType) {
            return;
        }
        var re = new RegExp(previewType, 'g');

        typeDependant.each(function() {
            this.className = this.className.replace(re, newType);
        });

        previewType = newType;
    };


    /**
     * Set orientation
     *
     * @param newOrientation
     * @private
     */
    var _setOrientation = function(newOrientation) {
        if (newOrientation === orientation) {
            return;
        }

        var re = new RegExp(orientation, 'g'),
            previewFrame = $('.preview-outer-frame')[0];

        previewFrame.className = previewFrame.className.replace(re, newOrientation);

        // reset global orientation
        orientation = newOrientation;
    };

    /**
     * Scale devices down to fit screen
     * @private
     */
    var _scale = function() {
        var $scaleContainer = $('.preview-scale-container');
        var containerScaledWidth = $scaleContainer.width() * scaleFactor;
        var left = (screenSize.width - containerScaledWidth) / 2;
        $scaleContainer.css({
            left: left,
            '-webkit-transform': 'scale(' + scaleFactor + ',' + scaleFactor + ')',
            '-ms-transform': 'scale(' + scaleFactor + ',' + scaleFactor + ')',
            'transform': 'scale(' + scaleFactor + ',' + scaleFactor + ')',
            '-webkit-transform-origin': '0 0',
            '-ms-transform-origin': '0 0',
            'transform-origin': '0 0'
        });

        $('.preview-utility-bar, .preview-message-box').width(screenSize.width);
    };

    /**
     * Calculate the largest device frame width
     *
     * @returns {{width: number, height: number}}
     * @private
     */
    var _getLargestFrameSize = function() {
        var i = previewTypes.length,
            frameSize = {
                width: 0,
                height: 0
            },
            previewFrame,
            previewContainer;

        while (i--) {
            overlay.find('.toggle-view[data-target="' + previewTypes[i] + '"]').trigger('click');
            previewFrame = overlay.find('.' + previewTypes[i] + '-preview-frame');
            previewContainer = previewFrame.find('.preview-container');

            overlay.addClass('quick-show');

            frameSize = {
                width: Math.max(frameSize.width, previewFrame.outerWidth() - previewContainer.outerWidth()),
                height: Math.max(frameSize.height, previewFrame.outerHeight() - previewContainer.outerHeight())
            };
            overlay.removeClass('quick-show');
        }

        return frameSize;
    };

    /**
     * Compute scale factor based on screen size and device size
     *
     * @private
     */
    var _computeScaleFactor = function() {
        var frameSize = _getLargestFrameSize();

        var scaleValues = {
            x: 1,
            y: 1
        };

        // 60/100 = allow for some margin around the device
        var requiredSize = {
            width: maxDeviceSize.width + frameSize.width + 60,
            height: maxDeviceSize.height + frameSize.height + 100 + $('.preview-utility-bar').outerHeight()
        };

        if (requiredSize.width > screenSize.width) {
            scaleValues.x = screenSize.width / requiredSize.width;
        }

        if (requiredSize.height > screenSize.height) {
            scaleValues.y = screenSize.height / requiredSize.height;
        }

        scaleFactor = Math.min(scaleValues.x, scaleValues.y);
    };

    /**
     * Add functionality to device selectors
     *
     * @private
     */
    var _setupDeviceSelectors = function() {

        overlay.find('.preview-device-selector').on('change', function() {
            var elem = $(this),
                type = elem.data('target'),
                val = elem.val().split(','),
                sizeSettings,
                i = val.length,
                container = overlay.find('.' + type + '-preview-container'),
                iframe = overlay.find('.preview-iframe');


            while (i--) {
                val[i] = parseFloat(val[i]);
            }

            if (type === 'mobile' && orientation === 'portrait') {
                sizeSettings = {
                    width: val[1],
                    height: val[0]
                };
            } else {
                sizeSettings = {
                    width: val[0],
                    height: val[1]
                };
            }

            if (sizeSettings.width === container.width() && sizeSettings.height === container.height()) {
                return false;
            }

            container.css(sizeSettings);

            _scale();


            _setPreviewType(type);

        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Setup orientation selector. There is no actual orientation switch for desktop but it could
     * be added easily if required.
     * @private
     */
    var _setupOrientationSelectors = function() {

        $('.orientation-selector').on('change', function() {
            var type = $(this).data('target'),
                previewFrame = $('.' + type + '-preview-frame'),
                container = previewFrame.find('.' + type + '-preview-container'),
                iframe = overlay.find('.preview-iframe'),
                sizeSettings,
                newOrientation = $(this).val();

            if (newOrientation === orientation) {
                return false;
            }

            sizeSettings = {
                height: container.width(),
                width: container.height()
            };

            container.css(sizeSettings);
            _scale();


            _setOrientation(newOrientation);

        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Close preview
     *
     * @returns {*|HTMLElement}
     */
    var _setupClosers = function() {
        var closer = overlay.find('.preview-closer'),
            feedbackCloser = overlay.find('.preview-message-box .close-trigger');
        closer.on('click', function() {
            commonRenderer.setContext($('.item-editor-item'));
            overlay.fadeOut();
        });

        $doc.keyup(function(e) {
            if (e.keyCode == 27) {
                closer.trigger('click');
            }
        });

        feedbackCloser.on('click', function() {
            overlay.find('.preview-message-box').hide();
        })
    };

    /**
     * Toggle between mobile and desktop
     *
     *
     * @returns {*}
     */
    var _setupTogglers = function() {


        var togglers = overlay.find('.toggle-view');

        togglers.each(function() {
            var toggler = $(this);
            togglersByTarget[toggler.data('target')] = toggler;
        });

        togglers.on('click', function() {
            var newPreviewType = $(this).data('target');

            _setPreviewType(newPreviewType);

            $('.' + newPreviewType + '-device-selector').trigger('change');
        });
    };

    /**
     * Remove possibly existing widgets and create a new one
     *
     * @param item
     * @private
     */
    var _initWidget = function() {
        $('.preview-overlay').remove();
        container = null;
        overlay = $(previewTpl({
            mobileDevices: _getDeviceSelectorData('mobile'),
            desktopDevices: _getDeviceSelectorData('desktop'),
            previewType: previewType
        }));


        $('body').append(overlay);

        _setupTypeDependantElements();

        _setupDeviceSelectors();
        _setupOrientationSelectors();
        _setupTogglers();

        _setupClosers();

        _computeScaleFactor();

        _setPreviewType(previewType);
        _setOrientation(orientation);

        $window.on('resize, orientationchange', function() {
            if (overlay.is(':visible')) {
                _computeScaleFactor();
                _scale();
            }
        })
    };

    /**
     * Confirm to save the item
     */
    var _confirmPreview = function() {

        var confirmBox = $('.preview-modal-feedback'),
            cancel = confirmBox.find('.cancel'),
            save = confirmBox.find('.save'),
            close = confirmBox.find('.modal-close');

            confirmBox.modal({ width: 500 });

        save.on('click', function() {
            hasBeenSavedOnce = true;
            overlay.trigger('save.preview');
            confirmBox.modal('close');
        });

        cancel.on('click', function() {
            confirmBox.modal('close');
        });
    };


    /**
     * Display the preview
     *
     * @private
     */
    var _showWidget = function(launcher, widget) {

        var preview = function() {
            var itemUri = helpers._url('index', 'QtiPreview', 'taoQtiItem') + '?uri=' + encodeURIComponent(widget.itemUri) + '&' + 'quick=1';

            $('.preview-iframe').attr('src', itemUri);

            $.when(styleEditor.save(), widget.save()).done(function() {

                previewType = $(launcher).data('preview-type') || 'desktop';

                if (togglersByTarget[previewType]) {
                    togglersByTarget[previewType].trigger('click');
                }

                overlay.show();
                overlay.height($doc.outerHeight());
                overlay.find('select:visible').trigger('change');
                _scale();
            });
            return true;
        };



        // wait for confirmation to save the item
        if(!hasBeenSavedOnce) {
            _confirmPreview();
            overlay.on('save.preview', function() {
                overlay.off('save.preview');
                return preview();
            });
        }

        else {
            return preview();
        }


    };


    return (function($) {

        /**
         * Create preview
         *
         * @param launchers - buttons to launch preview
         * @param widget
         */
        var init = function(launchers, widget) {

            _initWidget();

            $(launchers).on('click', function() {
                _showWidget(this, widget);
            });
        };

        return {
            init: init
        }
    }($));
});