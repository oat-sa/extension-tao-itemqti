define([
  'taoQtiItem/portableLib/require',
  'taoQtiItem/portableLib/lodash'
], function (require, _) {
  'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) { return e; } else {
      var n = {};
      if (e) {
        Object.keys(e).forEach(function (k) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        });
      }
      n['default'] = e;
      return n;
    }
  }

  _ = _ && _.hasOwnProperty('default') ? _['default'] : _;

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  /**
   * The data required by the modules loader
   *
   * @typedef {Object} moduleDefinition
   * @property {String} module - AMD module name
   * @property {String} bundle - AMD module name of the bundle that should contain the module
   * @property {String} category - the module category
   * @property {String} name - the module name
   * @property {String|Number} [position = 'append'] - append, prepend or arbitrary position within the category
   */

  /**
   * Creates a loader with the list of required modules
   * @param {Object} requiredModules - A collection of mandatory modules, where the key is the category and the value are an array of loaded modules
   * @param {Function} [validate] - A validator function, by default the module should be an object
   * @param {Object} [specs] - Some extra methods to assign to the loader instance
   * @returns {loader} the provider loader
   * @throws TypeError if something is not well formatted
   */

  function moduleLoaderFactory(requiredModules, validate, specs) {
    /**
     * The list of loaded modules
     */
    var loaded = {};
    /**
     * Retains the AMD modules to load
     */

    var modules = {};
    /**
     * The modules to exclude
     */

    var excludes = [];
    /**
     * Bundles to require
     */

    var bundles = [];
    /**
     * The module loader
     * @typedef {loader}
     */

    var loader = {
      /**
       * Adds a list of dynamic modules to load
       * @param {moduleDefinition[]} moduleList - the modules to add
       * @returns {loader} chains
       * @throws {TypeError} misuse
       */
      addList: function addList(moduleList) {
        _.forEach(moduleList, this.add, this);

        return this;
      },

      /**
       * Adds a dynamic module to load
       * @param {moduleDefinition} def - the module to add
       * @returns {loader} chains
       * @throws {TypeError} misuse
       */
      add: function add(def) {
        if (!_.isPlainObject(def)) {
          throw new TypeError('The module definition module must be an object');
        }

        if (_.isEmpty(def.module) || !_.isString(def.module)) {
          throw new TypeError('An AMD module must be defined');
        }

        if (_.isEmpty(def.category) || !_.isString(def.category)) {
          var identifyProvider = def.id || def.name || def.module;
          throw new TypeError("The provider '".concat(identifyProvider, "' must belong to a category"));
        }

        modules[def.category] = modules[def.category] || [];

        if (_.isNumber(def.position)) {
          modules[def.category][def.position] = def.module;
        } else if (def.position === 'prepend' || def.position === 'before') {
          modules[def.category].unshift(def.module);
        } else {
          modules[def.category].push(def.module);
        }

        if (def.bundle && !_.contains(bundles, def.bundle)) {
          bundles.push(def.bundle);
        }

        return this;
      },

      /**
       * Appends a dynamic module
       * @param {moduleDefinition} def - the module to add
       * @returns {loader} chains
       * @throws {TypeError} misuse
       */
      append: function append(def) {
        return this.add(_.merge({
          position: 'append'
        }, def));
      },

      /**
       * Prepends a dynamic module to a category
       * @param {moduleDefinition} def - the module to add
       * @returns {loader} chains
       * @throws {TypeError} misuse
       */
      prepend: function prepend(def) {
        return this.add(_.merge({
          position: 'prepend'
        }, def));
      },

      /**
       * Removes a module from the loading stack
       * @param {String} module - the module's module
       * @returns {loader} chains
       * @throws {TypeError} misuse
       */
      remove: function remove(module) {
        excludes.push(module);
        return this;
      },

      /**
       * Loads the dynamic modules : trigger the dependency resolution
       * @param {Boolean} [loadBundles=false] - does load the bundles
       * @returns {Promise}
       */
      load: function load(loadBundles) {
        var self = this; //compute the providers dependencies

        var dependencies = _(modules).values().flatten().uniq().difference(excludes).value();
        /**
         * Loads AMD modules and wrap then into a Promise
         * @param {String[]} amdModules - the list of modules to require
         * @returns {Promise} resolves with the loaded modules
         */


        var loadModules = function loadModules() {
          var amdModules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

          if (_.isArray(amdModules) && amdModules.length) {
            if (typeof define === 'function' && define.amd) {
              return new Promise(function (resolve, reject) {
                window.require(amdModules, function () {
                  for (var _len = arguments.length, loadedModules = new Array(_len), _key = 0; _key < _len; _key++) {
                    loadedModules[_key] = arguments[_key];
                  }

                  return resolve(loadedModules);
                }, function (err) {
                  reject(err);
                });
              });
            } else {
              return Promise.all(amdModules.map(function (module) {
                return (//eslint-disable
                  new Promise(function (resolve, reject) { require([
                  /* webpackIgnore: true */
                  "".concat(module)], function (m) { resolve(_interopNamespace(m)); }, reject) }) //eslint-enable

                );
              })).then(function (loadedModules) {
                return Promise.resolve.apply(Promise, _toConsumableArray(loadModules));
              });
            }
          }

          return Promise.resolve();
        }; // 1. load bundles
        // 2. load dependencies
        // 3. add them to the modules list


        return loadModules(loadBundles ? bundles : []).then(function () {
          return loadModules(dependencies);
        }).then(function (loadedModules) {
          _.forEach(dependencies, function (dependency, index) {
            var module = loadedModules[index];

            var category = _.findKey(modules, function (val) {
              return _.contains(val, dependency);
            });

            if (typeof validate === 'function' && !validate(module)) {
              throw new TypeError("The module '".concat(dependency, "' is not valid"));
            }

            if (_.isString(category)) {
              loaded[category] = loaded[category] || [];
              loaded[category].push(module);
            }
          });

          return self.getModules();
        });
      },

      /**
       * Get the resolved list of modules.
       * Load needs to be called before to have the dynamic modules.
       * @param {String} [category] - to get the modules for a given category, if not set, we get everything
       * @returns {Object[]} the modules
       */
      getModules: function getModules(category) {
        if (_.isString(category)) {
          return loaded[category] || [];
        }

        return _(loaded).values().flatten().uniq().value();
      },

      /**
       * Get the module categories
       * @returns {String[]} the categories
       */
      getCategories: function getCategories() {
        return _.keys(loaded);
      }
    };
    validate = _.isFunction(validate) ? validate : _.isPlainObject; //verify and add the required modules

    _.forEach(requiredModules, function (moduleList, category) {
      if (_.isEmpty(category) || !_.isString(category)) {
        throw new TypeError('Modules must belong to a category');
      }

      if (!_.isArray(moduleList)) {
        throw new TypeError('A list of modules must be an array');
      }

      if (!_.all(moduleList, validate)) {
        throw new TypeError('The list does not contain valid modules');
      }

      if (loaded[category]) {
        loaded[category] = loaded[category].concat(moduleList);
      } else {
        loaded[category] = moduleList;
      }
    }); // let's extend the instance with extra methods


    if (specs) {
      _(specs).functions().forEach(function (method) {
        loader[method] = function delegate() {
          return specs[method].apply(loader, [].slice.call(arguments));
        };
      });
    }

    return loader;
  }

  return moduleLoaderFactory;

});
