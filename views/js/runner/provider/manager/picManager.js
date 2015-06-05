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
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Element',

], function ($, _, Element) {
    'use strict';

    /**
     * The template of a PicManager instance
     * @type {picManager}
     */
    var picManager = {
        /**
         * Creates a manager for a particular PIC
         *
         * @param {Object} pic
         * @param {QtiItem} item
         * @returns {picManager}
         */
        init : function(pic, item) {
            if (Element.isA(pic, 'infoControl')) {
                this._pic = pic;
            }

            if (Element.isA(item, 'assessmentItem')) {
                this._item = item;
            }

            return this;
        },

        /**
         * Gets the related PIC
         *
         * @returns {Object} the descriptor of the PIC
         */
        getPic : function() {
            return this._pic;
        },

        /**
         * Gets the related Item
         *
         * @returns {QtiItem} the Item
         */
        getItem : function() {
            return this._item;
        },

        /**
         * Gets the PIC serial
         * @returns {String}
         */
        getSerial : function() {
            return this._pic && this._pic.serial;
        },

        /**
         * Gets the PIC type identifier
         * @returns {String}
         */
        getTypeIdentifier : function() {
            return this._pic && this._pic.typeIdentifier;
        },

        /**
         * Gets the underlying DOM element for a particular PIC
         * @returns {Object} An object providing the the underlying DOM elements of the PIC and its tool
         */
        getDom : function() {
            if (!this._dom) {
                var serial = this.getSerial();
                var pic, tool;

                if (serial) {
                    pic = $('[data-serial="' + serial + '"]');
                    if (pic.length) {
                        tool = $('[data-pic-serial="' + serial + '"]');

                        if (!tool.length) {
                            tool = pic.children().first();
                        }

                        this._dom = {
                            pic : pic,
                            tool : tool,
                            broken : pic.is(':empty') // tells if the tool has been moved outside of the PIC
                        };
                    }
                }
            }

            return this._dom;
        },

        /**
         * Enables the PIC
         * @returns {picManager}
         */
        enable : function() {
            // @todo

            this.trigger('enable');

            return this;
        },

        /**
         * Disables the PIC
         * @returns {picManager}
         */
        disable : function() {
            // @todo

            this.trigger('disable');

            return this;
        },

        /**
         * Shows the PIC
         * @returns {picManager}
         */
        show : function() {
            var dom = this.getDom();
            if (dom) {
                dom.tool.show();

                this.trigger('show');
            }

            return this;
        },

        /**
         * Hides the PIC
         * @returns {picManager}
         */
        hide : function() {
            var dom = this.getDom();
            if (dom) {
                dom.tool.hide();

                this.trigger('hide');
            }

            return this;
        },

        /**
         * Triggers an event on the underlying DOM element
         * @param {String} eventName
         * @returns {picManager}
         */
        trigger : function(eventName) {
            var dom = this.getDom();
            var args = _.rest(arguments, 1);

            args.unshift(this);

            if (dom) {
                // trigger the event, if the tool has been moved outside of the PIC, trigger also the event on the PIC
                dom.tool.trigger(eventName, args);
                if (dom.broken) {
                    dom.pic.trigger(eventName, args);
                }
            }

            return this;
        }
    };

    /**
     * The template of a PicManagerCollection instance
     * @type {picManagerCollection}
     */
    var picManagerCollection = {
        /**
         * Creates the collection of PIC from an Item
         *
         * @param {QtiItem} item
         * @returns {picManagerCollection}
         */
        init : function(item) {
            if (Element.isA(item, 'assessmentItem')) {
                this._item = item;
            }

            return this;
        },

        /**
         * Gets the list of PIC provided by the related item.
         *
         * @param {Boolean} [force] Force a list rebuild
         * @returns {Array} the list of provided PIC (descriptors)
         */
        getList : function(force) {
            var self = this;

            // build the list if empty
            if (force || !self._list) {
                self._map = {};
                self._list = [];
                if (self._item) {
                    _.forEach(self._item.getElements(), function(element) {
                        var manager;

                        if (Element.isA(element, 'infoControl')) {
                            manager = managerFactory(element, self._item);
                            self._list.push(manager);
                            self._map[element.serial] = manager;
                            self._map[element.typeIdentifier] = manager;
                        }
                    });
                }
            }

            return this._list;
        },

        /**
         * Gets the first PIC matching the identifier from the list provided by the running item.
         *
         * @param {String} picId The PIC typeIdentifier or serial
         * @returns {Object} the descriptor of the PIC
         */
        getPic : function(picId) {
            this.getList();
            return this._map[picId];
        },

        /**
         * Executes an action on a particular PIC
         * @param {String} picId The PIC typeIdentifier or serial
         * @param {String} action The action to call
         * @returns {*}
         */
        execute : function(picId, action) {
            var pic = this.getPic(picId);
            if (pic && pic[action]) {
                return pic[action].apply(pic, _.rest(arguments, 2));
            }
        },

        /**
         * Executes an action on each PIC
         * @param {String} action The action to call
         * @param {Funcrion} [filter] An optional filter to reduce the list
         * @returns {picManagerCollection}
         */
        executeAll : function(action, filter) {
            var args = _.rest(arguments, 2);
            var cb;

            if (typeof filter === 'function') {
                cb = function(pic) {
                    if (filter.call(pic, pic) && pic[action]) {
                        pic[action].apply(pic, args);
                    }
                };
            } else {
                cb = function(pic) {
                    if (pic[action]) {
                        pic[action].apply(pic, args);
                    }
                };
            }

            return this.each(cb);
        },

        /**
         * Calls a callback function on each listed PIC
         * @param {Function} cb
         * @returns {picManagerCollection}
         */
        each : function(cb) {
            _.forEach(this.getList(), cb);
            return this;
        },

        /**
         * Enables a PIC
         *
         * @param {String} picId The PIC typeIdentifier or serial
         * @returns {picManagerCollection}
         */
        enablePic : function(picId) {
            this.execute(picId, 'enable');
            return this;
        },

        /**
         * Disables a PIC
         *
         * @param {String} picId The PIC typeIdentifier or serial
         * @returns {picManagerCollection}
         */
        disablePic : function(picId) {
            this.execute(picId, 'disable');
            return this;
        },

        /**
         * Shows a PIC
         *
         * @param {String} picId The PIC typeIdentifier or serial
         * @returns {picManagerCollection}
         */
        showPic : function(picId) {
            this.execute(picId, 'show');
            return this;
        },

        /**
         * Hides a PIC
         *
         * @param {String} picId The PIC typeIdentifier or serial
         * @returns {picManagerCollection}
         */
        hidePic : function(picId) {
            this.execute(picId, 'hide');
            return this;
        }
    };

    /**
     * Creates a PIC manager for a particular Item.
     * @param {Object} pic
     * @param {QtiItem} item
     * @returns {picManager} Returns the instance of the PIC manager
     */
    var managerFactory = function(pic, item) {
        var manager = _.clone(picManager, true);
        return manager.init(pic, item);
    };

    /**
     * Creates a PIC manager for a particular Item.
     * @param {QtiItem} item
     * @returns {picManager} Returns the instance of the PIC manager
     */
    var collectionFactory = function(item) {
        var collection = _.clone(picManagerCollection, true);
        return collection.init(item);
    };

    return {
        collection: collectionFactory,
        manager: managerFactory
    };
});
