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
], function ($, _, __, commonRenderer, deviceList, previewTpl, styleEditor, helpers) {
    'use strict'

    var overlay,
        container,
        togglersByTarget = {},
        orientation = 'landscape',
        previewType = 'desktop',
        previewTypes = ['desktop', 'mobile'],
        $doc = $(document),
        $window = $(window),
        screenWidth = $doc.width(),
        maxDeviceWidth = 0,
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
            maxDeviceWidth = Math.max(maxDeviceWidth, value.width);

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
    var _setPreviewType = function(newType){

        if(newType === previewType) {
            return;
        }
        var re = new RegExp(previewType,'g');

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
        if(newOrientation === orientation) {
            return;
        }

        var re = new RegExp(orientation,'g'),
            previewFrame = $('.preview-outer-frame')[0];

        previewFrame.className = previewFrame.className.replace(re, newOrientation);

        // reset global orientation
        orientation = newOrientation;
    };


    /**
     * Center the horizontal scroll bar if any
     *
     * @private
     */
    var _center = function() {
        var previewContainer = $('.' + previewType + '-preview-frame'),
            previewWidth = previewContainer.outerWidth(),
            previewLeft = (previewWidth - screenWidth) / 2;

        if(previewWidth <= screenWidth) {
            return;
        }

        $window.scrollLeft(previewLeft);
    };



    /**
     * get with and height with scale factor taken in account
     *
     * @param sizeSettings
     * @returns {*}
     * @private
     */
    var _getScaledSettings = function(sizeSettings) {
        var scaledSettings = _.clone(sizeSettings);
        _(scaledSettings).forEach(function(value, key) {
            scaledSettings[key] *= scaleFactor;
        });
        return scaledSettings;
    };

    var _scale = function(domElement) {
        domElement.style['-webkit-transform'] = 'scale(' + scaleFactor + ',' + scaleFactor + ')';
        domElement.style['-ms-transform'] = 'scale(' + scaleFactor + ',' + scaleFactor + ')';
        domElement.style['transform'] = 'scale(' + scaleFactor + ',' + scaleFactor + ')';
        domElement.style['-webkit-transform-origin'] = 'top center';
        domElement.style['-ms-transform-origin'] = 'top center';
        domElement.style['transform-origin'] = 'top center';
    };

    /**
     * Calculate the largest device frame width
     *
     * @returns {number}
     * @private
     */
    var _getLargestFrameWidth = function() {
        var i = previewTypes.length,
            frameWidth = 0,
            previewFrame;

        while(i--) {
            overlay.find('.toggle-view[data-target="' + previewTypes[i] + '"]').trigger('click');
            previewFrame = overlay.find('.' + previewTypes[i] + '-preview-frame');
            overlay.addClass('quick-show');
            frameWidth = Math.max(frameWidth, previewFrame.outerWidth() - previewFrame.find('.preview-container').outerWidth());
            overlay.removeClass('quick-show');
        }

        return frameWidth;
    };

    var _computeScaleFactor = function() {
        var requiredWidth = maxDeviceWidth + _getLargestFrameWidth() + 20; // 20 = allow for some margin around the device
        if(requiredWidth > screenWidth) {
            scaleFactor = screenWidth / requiredWidth;
        }
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
            }
            else {
                sizeSettings = {
                    width: val[0],
                    height: val[1]
                };
            }

            if (sizeSettings.width === container.width()
                && sizeSettings.height === container.height()) {
                return false;
            }

            container.css(sizeSettings);

            _scale($('.preview-scale-container')[0]);


            _setPreviewType(type);
            _center();

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

        $('.orientation-selector').on('change', function () {
            var type = $(this).data('target'),
                previewFrame = $('.' + type + '-preview-frame'),
                container = previewFrame.find('.' + type + '-preview-container'),
                iframe = overlay.find('.preview-iframe'),
                sizeSettings,
                scaledSettings,
                newOrientation = $(this).val();

            if (newOrientation === orientation) {
                return false;
            }

            sizeSettings = {
                height: container.width(),
                width: container.height()
            };

            scaledSettings = _getScaledSettings(sizeSettings);

            container.css(scaledSettings);

//            iframe.css(sizeSettings);
//            _scale(iframe[0]);

            _setOrientation(newOrientation);

            // scroll to center
            _center();

        }).select2({
            minimumResultsForSearch: -1
        });
    };

    /**
     * Close preview
     *
     * @returns {*|HTMLElement}
     */
    var _setupCloser = function () {
        var closer = overlay.find('.preview-closer');
        closer.on('click', function () {
            commonRenderer.setContext($('.item-editor-item'));
            overlay.fadeOut();
        });

        $doc.keyup(function (e) {
            if (e.keyCode == 27) {
                closer.trigger('click');
            }
        });
    };

    /**
     * Toggle between mobile and desktop
     *
     *
     * @returns {*}
     */
    var _setupTogglers = function () {


        var togglers = overlay.find('.toggle-view');

        togglers.each(function() {
            var toggler = $(this);
            togglersByTarget[toggler.data('target')] = toggler;
        });

        togglers.on('click', function () {
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
        _setupCloser();
        _setupTogglers();
        _computeScaleFactor();
        _center();

        _setPreviewType(previewType);
        _setOrientation(orientation);

//        $window.on('resize, orientationchange', function() {
//           // _computeScaleFactor();
//        })
    };

    /**
     * This should long term be done with a modal window
     */
    var _confirmPreview = function() {
        if(!hasBeenSavedOnce) {
            hasBeenSavedOnce = confirm(__('The item will be saved before it can be previewed\nPress cancel to abort'));
        }
        return hasBeenSavedOnce;
    };


    /**
     * Display the preview
     *
     * @private
     */
    var _showWidget = function(launcher, widget) {

        var itemUri = helpers._url('index', 'QtiPreview', 'taoQtiItem') + '?uri=' + encodeURIComponent(widget.itemUri) + '&' + 'quick=1';

        $('.preview-iframe').attr('src', itemUri);


        $.when(styleEditor.save(), widget.save()).done(function() {

            previewType = $(launcher).data('preview-type') || 'desktop';

            if (togglersByTarget[previewType]) {
                togglersByTarget[previewType].trigger('click');
            }

            overlay.fadeIn(function () {
                overlay.height($doc.outerHeight());
                overlay.find('select').trigger('change');
            });

        });
    };


    return (function ($) {

        /**
         * Create preview
         *
         * @param launchers - buttons to launch preview
         * @param widget
         */
        var init = function(launchers, widget){

            _initWidget();

            $(launchers).on('click', function() {
                if(!_confirmPreview()) {
                    return
                };
                _showWidget(this, widget);
            });
        };

        return {
            init: init
        }
    }($));
});