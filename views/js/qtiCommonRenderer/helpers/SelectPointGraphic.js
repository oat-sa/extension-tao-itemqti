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
    'raphael',
    'scale.raphael',
    'json!taoQtiItem/qtiCommonRenderer/renderers/graphic-style.json'
], function($, _, raphael, scaleRaphael, gstyle) {
    'use strict';


    /**
     * Select point graphic interaction helper
     * @exports qtiCommonRenderer/helpers/SelectPointGraphic
     */
    var SelectPointGraphicHelper = {

        /**
         * Apply the style defined by name to the element
         * @param {Raphael.Element} element - the element to change the state
         * @param {String} state - the name of the state (from states) to switch to
         */
        setStyle : function(element, name) {
            if (element && gstyle[name]) {
                element.attr(gstyle[name]);
            }
        },


        /**
         * Create a Raphael paper with a bg image, that is width responsive
         * @param {String} id - the id of the DOM element that will contain the paper
         * @param {String} serial - the interaction unique indentifier
         * @param {Object} options - the paper parameters
         * @param {String} options.img - the url of the background image
         * @param {jQueryElement} [options.container] - the parent of the paper element (got the closest parent by default)
         * @param {Number} [options.width] - the paper width
         * @param {Number} [options.height] - the paper height
         * @param {String} [options.imgId] - an identifier for the image element
         * @param {Function} [options.done] - executed once the image is loaded
         * @returns {Raphael.Paper} the paper
         */
        responsivePaper : function(id, serial, options) {

            var paper, image;

            var $container = options.container || $('#' + id).parent();
            var $editor    = $('.image-editor', $container);
            var $body  = $container.closest('.qti-itemBody');
            var factory = raphael.type === 'SVG' ? scaleRaphael : raphael;

            var width = options.width || $container.innerWidth();
            var height = options.height || $container.innerHeight();

            var resizer = _.throttle(resizePaper, 10);

            //padding and border diff. always add 1px to cover the rounded value in scalling


            paper = factory.call(null ,id, width, height);
            image = paper.image(options.img, 0, 0, width, height);
            if (options.imgId) {
                image.id = options.imgId;
            }

            //retry to resize once the SVG is loaded
            $(image.node)
                .attr('externalResourcesRequired','true')
                .on("load", function() {
                    resizePaper();
                });

            if (raphael.type === 'SVG') {

                //scale on creation
                resizePaper();

                $(window).on('resize.qti-widget.'  + serial, resizer);
                $(document).on('customcssloaded.styleeditor', function() {
                    _.delay(resizer, 200);
                });
                $container.on('resize.qti-widget.' + serial , function(e, givenWidth) {
                    resizer(e, givenWidth);
                });

            } else {
                paper.canvas.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                $container.find('.main-image-box').width(width);
                if (typeof options.resize === 'function') {
                    options.resize(width, 1);
                }
            }

            /**
             * scale the raphael paper
             * @private
             */
            function resizePaper(e, givenWidth) {
                if (e) {
                    e.stopPropagation();
                }

                var factor          = 1;
                var diff            = ($editor.outerWidth() - $editor.width()) + ($container.outerWidth() - $container.width()) + 1;
                var maxWidth        = $body.width();
                var containerWidth  = $container.innerWidth();

                if (containerWidth > 0 || givenWidth > 0) {


                    if (givenWidth < containerWidth && givenWidth < maxWidth) {
                        containerWidth = givenWidth - diff;
                    } else if (containerWidth > maxWidth) {
                        containerWidth = maxWidth - diff;
                    } else {
                        containerWidth -= diff;
                    }

                    if ($container.hasClass('responsive')) {
                        factor = containerWidth / width;

                        paper.changeSize(containerWidth, height * factor, false, false);
                        paper.scaleAll( factor );
                    } else {
                        paper.changeSize(containerWidth, height, false, false);
                    }
                    if (typeof options.resize === 'function') {
                        options.resize(containerWidth, factor);
                    }
                    $container.trigger('resized.qti-widget');
                }
            }

            return paper;
        },


        /**
         * Create target point
         * @param {Raphael.Paper} paper - the paper
         * @param {Object} [options]
         * @param {Object} [options.id] - and id to identify the target
         * @param {Object} [options.point] - the point to add to the paper
         * @param {Number} [options.point.x = 0] - point's x coord
         * @param {Number} [options.point.y = 0] - point's y coord
         * @param {Boolean} [options.hover] = true - the target has an hover effect
         * @param {Function} [options.create] - call once created
         * @param {Function} [options.remove] - call once removed
         */
        createTarget : function createTarget(paper, options) {
            var self    = this;
            options     = options || {};
            var point   = options.point || {x : 0, y : 0};
            var baseSize= 18;
            var factor  = (paper.w && paper.width) ? paper.width / paper.w : 1;
            var size    = factor !== 1 ? Math.floor(18 / factor) + 1 : baseSize;
            var half    = size / 2;
            var x       = point.x >= half ? point.x - half : 0;
            var y       = point.y >= half ? point.y - half : 0;
            var hover   = typeof options.hover === 'undefined' ? true : !!options.hover;
            var tBBox;

            //create the target from a path
            var target = paper
                .path(gstyle.target.path)
                .transform('T' + x + ',' + y + 's' + size / baseSize)
                .attr(gstyle.target)
                .attr('title', _('Click again to remove'));

            //generate an id if not set in options
            if (options.id) {
                target.id = options.id;
            } else {
                var count = 0;
                paper.forEach(function(element) {
                    if (element.data('target')) {
                        count++;
                    }
                });
                target.id = 'target-' + count;
            }

            tBBox = target.getBBox();

            //create an invisible rect over the target to ensure path selection
            var layer = paper
                .rect(tBBox.x, tBBox.y, tBBox.width, tBBox.height)
                .attr(gstyle.layer)
                .click(function() {
                    var id = target.id;
                    var point = this.data('point');
                    if (_.isFunction(options.select)) {
                        options.select(target, point, this);
                    }
                    if (_.isFunction(options.remove)) {
                        this.remove();
                        target.remove();
                        options.remove(id, point);
                    }
                });
            if (hover) {
                layer.hover(function() {
                    if (!target.flashing) {
                        self.setStyle(target, 'target-hover');
                    }
                }, function() {
                    if (!target.flashing) {
                        self.setStyle(target, 'target-success');
                    }
                });
            }

            layer.id = 'layer-' + target.id;
            layer.data('point', point);
            target.data('target', point);

            if (_.isFunction(options.create)) {
                options.create(target);
            }

            return target;
        },


        /**
         * Create a circle that animate and disapear from a shape.
         *
         * @param {Raphael.Paper} paper - the paper
         * @param {Raphael.Element} element - used to get the bbox from
         */
        createTouchCircle : function(paper, bbox) {
            var radius  = bbox.width > bbox.height ? bbox.width : bbox.height;
            var tCircle = paper.circle( (bbox.x + (bbox.width / 2)),  (bbox.y + (bbox.height / 2)), radius );

            tCircle.attr(gstyle['touch-circle']);

            _.defer(function() {
                tCircle.animate({'r' : radius + 5, opacity: 0.7}, 300, function() {
                    tCircle.remove();
                });
            });
        },


        /**
         * Highlight an element with the error style
         * @param {Raphael.Element} element - the element to hightlight
         * @param {String} [restorState = 'basic'] - the state to restore the elt into after flash
         */
        highlightError : function(element, restoredState) {
            var self = this;
            if (element) {
                element.flashing = true;
                self.updateElementState(element, 'error');
                _.delay(function() {
                    self.updateElementState(element, restoredState || 'basic');
                    element.flashing = false;
                }, 800);
            }
        },

        /**
         * Trigger an event already bound to a raphael element
         * @param {Raphael.Element} element
         * @param {String} event - the event name
         *
         */
        trigger : function(element, event) {
            var evt = _.where(element.events, { name : event });
            if (evt.length && evt[0] && typeof evt[0].f === 'function') {
                evt[0].f.apply(element, Array.prototype.slice.call(arguments, 2));
            }
        },


        /**
         * Get an x/y point from a MouseEvent
         * @param {MouseEvent} event - the source event
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {jQueryElement} $container - the paper container
         * @param {Boolean} isResponsive - if the paper is scaling
         * @returns {Object} x,y point
         */
        getPoint : function getPoint(event, paper, $container, isResponsive) {
            var rwidth, rheight, wfactor;

            //get the click coords
            var point = this.clickPoint($container, event);

            //recalculate point coords in case of scaled image.
            if (paper.w && paper.w !== paper.width) {
                if (isResponsive) {
                    wfactor = paper.w / paper.width;
                    point.x = Math.round(point.x * wfactor);
                    point.y = Math.round(point.y * wfactor);
                } else if (paper.width > paper.w) {
                    rwidth  = (paper.width - paper.w) / 2;
                    point.x = Math.round(point.x - rwidth);
                } else {
                    wfactor = paper.w / paper.width;
                    point.x = Math.round(point.x * wfactor);

                    rheight = (paper.height - (paper.height * (2 - wfactor))) / 2;
                    point.y = Math.round((point.y * wfactor) - rheight);
                }
            }

            return point;
        },


        /**
         * Get a point from a click event
         * @param {jQueryElement} $container - the element that contains the paper
         * @param {MouseEvent} event - the event triggered by the click
         * @returns {Object} the x,y point
         */
        clickPoint : function($container, event) {
            var x, y;
            var offset = $container.offset();
            if (event.pageX || event.pageY) {
                x = event.pageX - offset.left;
                y = event.pageY - offset.top;
            } else if (event.clientX || event.clientY) {
                x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - offset.left;
                y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - offset.top;
            }

            return { x : x, y : y };
        }
    };


    return SelectPointGraphicHelper;
});
