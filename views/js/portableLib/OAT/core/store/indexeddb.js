define([
  'taoQtiItem/portableLib/lodash',
  'taoQtiItem/portableLib/OAT/core/uuid'
], function (_, uuid) {
  'use strict';

  _ = _ && _.hasOwnProperty('default') ? _['default'] : _;
  Promise = Promise && Promise.hasOwnProperty('default') ? Promise['default'] : Promise;
  uuid = uuid && uuid.hasOwnProperty('default') ? uuid['default'] : uuid;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var idbstore = createCommonjsModule(function (module) {
    /*global window:false, self:false, define:false, module:false */

    /**
     * @license IDBWrapper - A cross-browser wrapper for IndexedDB
     * Version 1.7.0
     * Copyright (c) 2011 - 2016 Jens Arps
     * http://jensarps.de/
     *
     * Licensed under the MIT (X11) license
     */
    (function (name, definition, global) {

      if ( module.exports) {
        module.exports = definition();
      } else {
        global[name] = definition();
      }
    })('IDBStore', function () {

      var defaultErrorHandler = function defaultErrorHandler(error) {
        throw error;
      };

      var defaultSuccessHandler = function defaultSuccessHandler() {};

      var defaults = {
        storeName: 'Store',
        storePrefix: 'IDBWrapper-',
        dbVersion: 1,
        keyPath: 'id',
        autoIncrement: true,
        onStoreReady: function onStoreReady() {},
        onError: defaultErrorHandler,
        indexes: [],
        implementationPreference: ['indexedDB', 'webkitIndexedDB', 'mozIndexedDB', 'shimIndexedDB']
      };
      /**
       *
       * The IDBStore constructor
       *
       * @constructor
       * @name IDBStore
       * @version 1.7.0
       *
       * @param {Object} [kwArgs] An options object used to configure the store and
       *  set callbacks
       * @param {String} [kwArgs.storeName='Store'] The name of the store
       * @param {String} [kwArgs.storePrefix='IDBWrapper-'] A prefix that is
       *  internally used to construct the name of the database, which will be
       *  kwArgs.storePrefix + kwArgs.storeName
       * @param {Number} [kwArgs.dbVersion=1] The version of the store
       * @param {String} [kwArgs.keyPath='id'] The key path to use. If you want to
       *  setup IDBWrapper to work with out-of-line keys, you need to set this to
       *  `null`
       * @param {Boolean} [kwArgs.autoIncrement=true] If set to true, IDBStore will
       *  automatically make sure a unique keyPath value is present on each object
       *  that is stored.
       * @param {Function} [kwArgs.onStoreReady] A callback to be called when the
       *  store is ready to be used.
       * @param {Function} [kwArgs.onError=throw] A callback to be called when an
       *  error occurred during instantiation of the store.
       * @param {Array} [kwArgs.indexes=[]] An array of indexData objects
       *  defining the indexes to use with the store. For every index to be used
       *  one indexData object needs to be passed in the array.
       *  An indexData object is defined as follows:
       * @param {Object} [kwArgs.indexes.indexData] An object defining the index to
       *  use
       * @param {String} kwArgs.indexes.indexData.name The name of the index
       * @param {String} [kwArgs.indexes.indexData.keyPath] The key path of the index
       * @param {Boolean} [kwArgs.indexes.indexData.unique] Whether the index is unique
       * @param {Boolean} [kwArgs.indexes.indexData.multiEntry] Whether the index is multi entry
       * @param {Array} [kwArgs.implementationPreference=['indexedDB','webkitIndexedDB','mozIndexedDB','shimIndexedDB']] An array of strings naming implementations to be used, in order or preference
       * @param {Function} [onStoreReady] A callback to be called when the store
       * is ready to be used.
       * @example
       // create a store for customers with an additional index over the
       // `lastname` property.
       var myCustomerStore = new IDBStore({
           dbVersion: 1,
           storeName: 'customer-index',
           keyPath: 'customerid',
           autoIncrement: true,
           onStoreReady: populateTable,
           indexes: [
               { name: 'lastname', keyPath: 'lastname', unique: false, multiEntry: false }
           ]
       });
       * @example
       // create a generic store
       var myCustomerStore = new IDBStore({
           storeName: 'my-data-store',
           onStoreReady: function(){
               // start working with the store.
           }
       });
       */

      var IDBStore = function IDBStore(kwArgs, onStoreReady) {
        if (typeof onStoreReady == 'undefined' && typeof kwArgs == 'function') {
          onStoreReady = kwArgs;
        }

        if (Object.prototype.toString.call(kwArgs) != '[object Object]') {
          kwArgs = {};
        }

        for (var key in defaults) {
          this[key] = typeof kwArgs[key] != 'undefined' ? kwArgs[key] : defaults[key];
        }

        this.dbName = this.storePrefix + this.storeName;
        this.dbVersion = parseInt(this.dbVersion, 10) || 1;
        onStoreReady && (this.onStoreReady = onStoreReady);
        var env = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' ? window : self;
        var availableImplementations = this.implementationPreference.filter(function (implName) {
          return implName in env;
        });
        this.implementation = availableImplementations[0];
        this.idb = env[this.implementation];
        this.keyRange = env.IDBKeyRange || env.webkitIDBKeyRange || env.mozIDBKeyRange;
        this.consts = {
          'READ_ONLY': 'readonly',
          'READ_WRITE': 'readwrite',
          'VERSION_CHANGE': 'versionchange',
          'NEXT': 'next',
          'NEXT_NO_DUPLICATE': 'nextunique',
          'PREV': 'prev',
          'PREV_NO_DUPLICATE': 'prevunique'
        };
        this.openDB();
      };
      /** @lends IDBStore.prototype */


      var proto = {
        /**
         * A pointer to the IDBStore ctor
         *
         * @private
         * @type {Function}
         * @constructs
         */
        constructor: IDBStore,

        /**
         * The version of IDBStore
         *
         * @type {String}
         */
        version: '1.7.0',

        /**
         * A reference to the IndexedDB object
         *
         * @type {IDBDatabase}
         */
        db: null,

        /**
         * The full name of the IndexedDB used by IDBStore, composed of
         * this.storePrefix + this.storeName
         *
         * @type {String}
         */
        dbName: null,

        /**
         * The version of the IndexedDB used by IDBStore
         *
         * @type {Number}
         */
        dbVersion: null,

        /**
         * A reference to the objectStore used by IDBStore
         *
         * @type {IDBObjectStore}
         */
        store: null,

        /**
         * The store name
         *
         * @type {String}
         */
        storeName: null,

        /**
         * The prefix to prepend to the store name
         *
         * @type {String}
         */
        storePrefix: null,

        /**
         * The key path
         *
         * @type {String}
         */
        keyPath: null,

        /**
         * Whether IDBStore uses autoIncrement
         *
         * @type {Boolean}
         */
        autoIncrement: null,

        /**
         * The indexes used by IDBStore
         *
         * @type {Array}
         */
        indexes: null,

        /**
         * The implemantations to try to use, in order of preference
         *
         * @type {Array}
         */
        implementationPreference: null,

        /**
         * The actual implementation being used
         *
         * @type {String}
         */
        implementation: '',

        /**
         * The callback to be called when the store is ready to be used
         *
         * @type {Function}
         */
        onStoreReady: null,

        /**
         * The callback to be called if an error occurred during instantiation
         * of the store
         *
         * @type {Function}
         */
        onError: null,

        /**
         * The internal insertID counter
         *
         * @type {Number}
         * @private
         */
        _insertIdCount: 0,

        /**
         * Opens an IndexedDB; called by the constructor.
         *
         * Will check if versions match and compare provided index configuration
         * with existing ones, and update indexes if necessary.
         *
         * Will call this.onStoreReady() if everything went well and the store
         * is ready to use, and this.onError() is something went wrong.
         *
         * @private
         *
         */
        openDB: function openDB() {
          var openRequest = this.idb.open(this.dbName, this.dbVersion);
          var preventSuccessCallback = false;

          openRequest.onerror = function (error) {
            var gotVersionErr = false;

            if ('error' in error.target) {
              gotVersionErr = error.target.error.name == 'VersionError';
            } else if ('errorCode' in error.target) {
              gotVersionErr = error.target.errorCode == 12;
            }

            if (gotVersionErr) {
              this.onError(new Error('The version number provided is lower than the existing one.'));
            } else {
              this.onError(error);
            }
          }.bind(this);

          openRequest.onsuccess = function (event) {
            if (preventSuccessCallback) {
              return;
            }

            if (this.db) {
              this.onStoreReady();
              return;
            }

            this.db = event.target.result;

            if (typeof this.db.version == 'string') {
              this.onError(new Error('The IndexedDB implementation in this browser is outdated. Please upgrade your browser.'));
              return;
            }

            if (!this.db.objectStoreNames.contains(this.storeName)) {
              // We should never ever get here.
              // Lets notify the user anyway.
              this.onError(new Error('Object store couldn\'t be created.'));
              return;
            }

            var emptyTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
            this.store = emptyTransaction.objectStore(this.storeName); // check indexes

            var existingIndexes = Array.prototype.slice.call(this.getIndexList());
            this.indexes.forEach(function (indexData) {
              var indexName = indexData.name;

              if (!indexName) {
                preventSuccessCallback = true;
                this.onError(new Error('Cannot create index: No index name given.'));
                return;
              }

              this.normalizeIndexData(indexData);

              if (this.hasIndex(indexName)) {
                // check if it complies
                var actualIndex = this.store.index(indexName);
                var complies = this.indexComplies(actualIndex, indexData);

                if (!complies) {
                  preventSuccessCallback = true;
                  this.onError(new Error('Cannot modify index "' + indexName + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + '.'));
                }

                existingIndexes.splice(existingIndexes.indexOf(indexName), 1);
              } else {
                preventSuccessCallback = true;
                this.onError(new Error('Cannot create new index "' + indexName + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + '.'));
              }
            }, this);

            if (existingIndexes.length) {
              preventSuccessCallback = true;
              this.onError(new Error('Cannot delete index(es) "' + existingIndexes.toString() + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + '.'));
            }

            preventSuccessCallback || this.onStoreReady();
          }.bind(this);

          openRequest.onupgradeneeded = function (
          /* IDBVersionChangeEvent */
          event) {
            this.db = event.target.result;

            if (this.db.objectStoreNames.contains(this.storeName)) {
              this.store = event.target.transaction.objectStore(this.storeName);
            } else {
              var optionalParameters = {
                autoIncrement: this.autoIncrement
              };

              if (this.keyPath !== null) {
                optionalParameters.keyPath = this.keyPath;
              }

              this.store = this.db.createObjectStore(this.storeName, optionalParameters);
            }

            var existingIndexes = Array.prototype.slice.call(this.getIndexList());
            this.indexes.forEach(function (indexData) {
              var indexName = indexData.name;

              if (!indexName) {
                preventSuccessCallback = true;
                this.onError(new Error('Cannot create index: No index name given.'));
              }

              this.normalizeIndexData(indexData);

              if (this.hasIndex(indexName)) {
                // check if it complies
                var actualIndex = this.store.index(indexName);
                var complies = this.indexComplies(actualIndex, indexData);

                if (!complies) {
                  // index differs, need to delete and re-create
                  this.store.deleteIndex(indexName);
                  this.store.createIndex(indexName, indexData.keyPath, {
                    unique: indexData.unique,
                    multiEntry: indexData.multiEntry
                  });
                }

                existingIndexes.splice(existingIndexes.indexOf(indexName), 1);
              } else {
                this.store.createIndex(indexName, indexData.keyPath, {
                  unique: indexData.unique,
                  multiEntry: indexData.multiEntry
                });
              }
            }, this);

            if (existingIndexes.length) {
              existingIndexes.forEach(function (_indexName) {
                this.store.deleteIndex(_indexName);
              }, this);
            }
          }.bind(this);
        },

        /**
         * Deletes the database used for this store if the IDB implementations
         * provides that functionality.
         *
         * @param {Function} [onSuccess] A callback that is called if deletion
         *  was successful.
         * @param {Function} [onError] A callback that is called if deletion
         *  failed.
         */
        deleteDatabase: function deleteDatabase(onSuccess, onError) {
          if (this.idb.deleteDatabase) {
            this.db.close();
            var deleteRequest = this.idb.deleteDatabase(this.dbName);
            deleteRequest.onsuccess = onSuccess;
            deleteRequest.onerror = onError;
          } else {
            onError(new Error('Browser does not support IndexedDB deleteDatabase!'));
          }
        },

        /*********************
         * data manipulation *
         *********************/

        /**
         * Puts an object into the store. If an entry with the given id exists,
         * it will be overwritten. This method has a different signature for inline
         * keys and out-of-line keys; please see the examples below.
         *
         * @param {*} [key] The key to store. This is only needed if IDBWrapper
         *  is set to use out-of-line keys. For inline keys - the default scenario -
         *  this can be omitted.
         * @param {Object} value The data object to store.
         * @param {Function} [onSuccess] A callback that is called if insertion
         *  was successful.
         * @param {Function} [onError] A callback that is called if insertion
         *  failed.
         * @returns {IDBTransaction} The transaction used for this operation.
         * @example
         // Storing an object, using inline keys (the default scenario):
         var myCustomer = {
             customerid: 2346223,
             lastname: 'Doe',
             firstname: 'John'
         };
         myCustomerStore.put(myCustomer, mySuccessHandler, myErrorHandler);
         // Note that passing success- and error-handlers is optional.
         * @example
         // Storing an object, using out-of-line keys:
         var myCustomer = {
             lastname: 'Doe',
             firstname: 'John'
         };
         myCustomerStore.put(2346223, myCustomer, mySuccessHandler, myErrorHandler);
         // Note that passing success- and error-handlers is optional.
         */
        put: function put(key, value, onSuccess, onError) {
          if (this.keyPath !== null) {
            onError = onSuccess;
            onSuccess = value;
            value = key;
          }

          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          var hasSuccess = false,
              result = null,
              putRequest;
          var putTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);

          putTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          putTransaction.onabort = onError;
          putTransaction.onerror = onError;

          if (this.keyPath !== null) {
            // in-line keys
            this._addIdPropertyIfNeeded(value);

            putRequest = putTransaction.objectStore(this.storeName).put(value);
          } else {
            // out-of-line keys
            putRequest = putTransaction.objectStore(this.storeName).put(value, key);
          }

          putRequest.onsuccess = function (event) {
            hasSuccess = true;
            result = event.target.result;
          };

          putRequest.onerror = onError;
          return putTransaction;
        },

        /**
         * Retrieves an object from the store. If no entry exists with the given id,
         * the success handler will be called with null as first and only argument.
         *
         * @param {*} key The id of the object to fetch.
         * @param {Function} [onSuccess] A callback that is called if fetching
         *  was successful. Will receive the object as only argument.
         * @param {Function} [onError] A callback that will be called if an error
         *  occurred during the operation.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        get: function get(key, onSuccess, onError) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          var hasSuccess = false,
              result = null;
          var getTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);

          getTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          getTransaction.onabort = onError;
          getTransaction.onerror = onError;
          var getRequest = getTransaction.objectStore(this.storeName).get(key);

          getRequest.onsuccess = function (event) {
            hasSuccess = true;
            result = event.target.result;
          };

          getRequest.onerror = onError;
          return getTransaction;
        },

        /**
         * Removes an object from the store.
         *
         * @param {*} key The id of the object to remove.
         * @param {Function} [onSuccess] A callback that is called if the removal
         *  was successful.
         * @param {Function} [onError] A callback that will be called if an error
         *  occurred during the operation.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        remove: function remove(key, onSuccess, onError) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          var hasSuccess = false,
              result = null;
          var removeTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);

          removeTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          removeTransaction.onabort = onError;
          removeTransaction.onerror = onError;
          var deleteRequest = removeTransaction.objectStore(this.storeName)['delete'](key);

          deleteRequest.onsuccess = function (event) {
            hasSuccess = true;
            result = event.target.result;
          };

          deleteRequest.onerror = onError;
          return removeTransaction;
        },

        /**
         * Runs a batch of put and/or remove operations on the store.
         *
         * @param {Array} dataArray An array of objects containing the operation to run
         *  and the data object (for put operations).
         * @param {Function} [onSuccess] A callback that is called if all operations
         *  were successful.
         * @param {Function} [onError] A callback that is called if an error
         *  occurred during one of the operations.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        batch: function batch(dataArray, onSuccess, onError) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);

          if (Object.prototype.toString.call(dataArray) != '[object Array]') {
            onError(new Error('dataArray argument must be of type Array.'));
          } else if (dataArray.length === 0) {
            return onSuccess(true);
          }

          var count = dataArray.length;
          var called = false;
          var hasSuccess = false;
          var batchTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);

          batchTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(hasSuccess);
          };

          batchTransaction.onabort = onError;
          batchTransaction.onerror = onError;

          var onItemSuccess = function onItemSuccess() {
            count--;

            if (count === 0 && !called) {
              called = true;
              hasSuccess = true;
            }
          };

          dataArray.forEach(function (operation) {
            var type = operation.type;
            var key = operation.key;
            var value = operation.value;

            var onItemError = function onItemError(err) {
              batchTransaction.abort();

              if (!called) {
                called = true;
                onError(err, type, key);
              }
            };

            if (type == 'remove') {
              var deleteRequest = batchTransaction.objectStore(this.storeName)['delete'](key);
              deleteRequest.onsuccess = onItemSuccess;
              deleteRequest.onerror = onItemError;
            } else if (type == 'put') {
              var putRequest;

              if (this.keyPath !== null) {
                // in-line keys
                this._addIdPropertyIfNeeded(value);

                putRequest = batchTransaction.objectStore(this.storeName).put(value);
              } else {
                // out-of-line keys
                putRequest = batchTransaction.objectStore(this.storeName).put(value, key);
              }

              putRequest.onsuccess = onItemSuccess;
              putRequest.onerror = onItemError;
            }
          }, this);
          return batchTransaction;
        },

        /**
         * Takes an array of objects and stores them in a single transaction.
         *
         * @param {Array} dataArray An array of objects to store
         * @param {Function} [onSuccess] A callback that is called if all operations
         *  were successful.
         * @param {Function} [onError] A callback that is called if an error
         *  occurred during one of the operations.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        putBatch: function putBatch(dataArray, onSuccess, onError) {
          var batchData = dataArray.map(function (item) {
            return {
              type: 'put',
              value: item
            };
          });
          return this.batch(batchData, onSuccess, onError);
        },

        /**
         * Like putBatch, takes an array of objects and stores them in a single
         * transaction, but allows processing of the result values.  Returns the
         * processed records containing the key for newly created records to the
         * onSuccess calllback instead of only returning true or false for success.
         * In addition, added the option for the caller to specify a key field that
         * should be set to the newly created key.
         *
         * @param {Array} dataArray An array of objects to store
         * @param {Object} [options] An object containing optional options
         * @param {String} [options.keyField=this.keyPath] Specifies a field in the record to update
         *  with the auto-incrementing key. Defaults to the store's keyPath.
         * @param {Function} [onSuccess] A callback that is called if all operations
         *  were successful.
         * @param {Function} [onError] A callback that is called if an error
         *  occurred during one of the operations.
         * @returns {IDBTransaction} The transaction used for this operation.
         *
         */
        upsertBatch: function upsertBatch(dataArray, options, onSuccess, onError) {
          // handle `dataArray, onSuccess, onError` signature
          if (typeof options == 'function') {
            onSuccess = options;
            onError = onSuccess;
            options = {};
          }

          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          options || (options = {});

          if (Object.prototype.toString.call(dataArray) != '[object Array]') {
            onError(new Error('dataArray argument must be of type Array.'));
          }

          var keyField = options.keyField || this.keyPath;
          var count = dataArray.length;
          var called = false;
          var hasSuccess = false;
          var index = 0; // assume success callbacks are executed in order

          var batchTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);

          batchTransaction.oncomplete = function () {
            if (hasSuccess) {
              onSuccess(dataArray);
            } else {
              onError(false);
            }
          };

          batchTransaction.onabort = onError;
          batchTransaction.onerror = onError;

          var onItemSuccess = function onItemSuccess(event) {
            var record = dataArray[index++];
            record[keyField] = event.target.result;
            count--;

            if (count === 0 && !called) {
              called = true;
              hasSuccess = true;
            }
          };

          dataArray.forEach(function (record) {
            var key = record.key;

            var onItemError = function onItemError(err) {
              batchTransaction.abort();

              if (!called) {
                called = true;
                onError(err);
              }
            };

            var putRequest;

            if (this.keyPath !== null) {
              // in-line keys
              this._addIdPropertyIfNeeded(record);

              putRequest = batchTransaction.objectStore(this.storeName).put(record);
            } else {
              // out-of-line keys
              putRequest = batchTransaction.objectStore(this.storeName).put(record, key);
            }

            putRequest.onsuccess = onItemSuccess;
            putRequest.onerror = onItemError;
          }, this);
          return batchTransaction;
        },

        /**
         * Takes an array of keys and removes matching objects in a single
         * transaction.
         *
         * @param {Array} keyArray An array of keys to remove
         * @param {Function} [onSuccess] A callback that is called if all operations
         *  were successful.
         * @param {Function} [onError] A callback that is called if an error
         *  occurred during one of the operations.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        removeBatch: function removeBatch(keyArray, onSuccess, onError) {
          var batchData = keyArray.map(function (key) {
            return {
              type: 'remove',
              key: key
            };
          });
          return this.batch(batchData, onSuccess, onError);
        },

        /**
         * Takes an array of keys and fetches matching objects
         *
         * @param {Array} keyArray An array of keys identifying the objects to fetch
         * @param {Function} [onSuccess] A callback that is called if all operations
         *  were successful.
         * @param {Function} [onError] A callback that is called if an error
         *  occurred during one of the operations.
         * @param {String} [arrayType='sparse'] The type of array to pass to the
         *  success handler. May be one of 'sparse', 'dense' or 'skip'. Defaults to
         *  'sparse'. This parameter specifies how to handle the situation if a get
         *  operation did not throw an error, but there was no matching object in
         *  the database. In most cases, 'sparse' provides the most desired
         *  behavior. See the examples for details.
         * @returns {IDBTransaction} The transaction used for this operation.
         * @example
         // given that there are two objects in the database with the keypath
         // values 1 and 2, and the call looks like this:
         myStore.getBatch([1, 5, 2], onError, function (data) { … }, arrayType);
          // this is what the `data` array will be like:
          // arrayType == 'sparse':
         // data is a sparse array containing two entries and having a length of 3:
         [Object, 2: Object]
         0: Object
         2: Object
         length: 3
         // calling forEach on data will result in the callback being called two
         // times, with the index parameter matching the index of the key in the
         // keyArray.
          // arrayType == 'dense':
         // data is a dense array containing three entries and having a length of 3,
         // where data[1] is of type undefined:
         [Object, undefined, Object]
         0: Object
         1: undefined
         2: Object
         length: 3
         // calling forEach on data will result in the callback being called three
         // times, with the index parameter matching the index of the key in the
         // keyArray, but the second call will have undefined as first argument.
          // arrayType == 'skip':
         // data is a dense array containing two entries and having a length of 2:
         [Object, Object]
         0: Object
         1: Object
         length: 2
         // calling forEach on data will result in the callback being called two
         // times, with the index parameter not matching the index of the key in the
         // keyArray.
         */
        getBatch: function getBatch(keyArray, onSuccess, onError, arrayType) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          arrayType || (arrayType = 'sparse');

          if (Object.prototype.toString.call(keyArray) != '[object Array]') {
            onError(new Error('keyArray argument must be of type Array.'));
          } else if (keyArray.length === 0) {
            return onSuccess([]);
          }

          var data = [];
          var count = keyArray.length;
          var hasSuccess = false;
          var result = null;
          var batchTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);

          batchTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          batchTransaction.onabort = onError;
          batchTransaction.onerror = onError;

          var onItemSuccess = function onItemSuccess(event) {
            if (event.target.result || arrayType == 'dense') {
              data.push(event.target.result);
            } else if (arrayType == 'sparse') {
              data.length++;
            }

            count--;

            if (count === 0) {
              hasSuccess = true;
              result = data;
            }
          };

          keyArray.forEach(function (key) {
            var onItemError = function onItemError(err) {
              result = err;
              onError(err);
              batchTransaction.abort();
            };

            var getRequest = batchTransaction.objectStore(this.storeName).get(key);
            getRequest.onsuccess = onItemSuccess;
            getRequest.onerror = onItemError;
          }, this);
          return batchTransaction;
        },

        /**
         * Fetches all entries in the store.
         *
         * @param {Function} [onSuccess] A callback that is called if the operation
         *  was successful. Will receive an array of objects.
         * @param {Function} [onError] A callback that will be called if an error
         *  occurred during the operation.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        getAll: function getAll(onSuccess, onError) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          var getAllTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
          var store = getAllTransaction.objectStore(this.storeName);

          if (store.getAll) {
            this._getAllNative(getAllTransaction, store, onSuccess, onError);
          } else {
            this._getAllCursor(getAllTransaction, store, onSuccess, onError);
          }

          return getAllTransaction;
        },

        /**
         * Implements getAll for IDB implementations that have a non-standard
         * getAll() method.
         *
         * @param {IDBTransaction} getAllTransaction An open READ transaction.
         * @param {IDBObjectStore} store A reference to the store.
         * @param {Function} onSuccess A callback that will be called if the
         *  operation was successful.
         * @param {Function} onError A callback that will be called if an
         *  error occurred during the operation.
         * @private
         */
        _getAllNative: function _getAllNative(getAllTransaction, store, onSuccess, onError) {
          var hasSuccess = false,
              result = null;

          getAllTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          getAllTransaction.onabort = onError;
          getAllTransaction.onerror = onError;
          var getAllRequest = store.getAll();

          getAllRequest.onsuccess = function (event) {
            hasSuccess = true;
            result = event.target.result;
          };

          getAllRequest.onerror = onError;
        },

        /**
         * Implements getAll for IDB implementations that do not have a getAll()
         * method.
         *
         * @param {IDBTransaction} getAllTransaction An open READ transaction.
         * @param {IDBObjectStore} store A reference to the store.
         * @param {Function} onSuccess A callback that will be called if the
         *  operation was successful.
         * @param {Function} onError A callback that will be called if an
         *  error occurred during the operation.
         * @private
         */
        _getAllCursor: function _getAllCursor(getAllTransaction, store, onSuccess, onError) {
          var all = [],
              hasSuccess = false,
              result = null;

          getAllTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          getAllTransaction.onabort = onError;
          getAllTransaction.onerror = onError;
          var cursorRequest = store.openCursor();

          cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor) {
              all.push(cursor.value);
              cursor['continue']();
            } else {
              hasSuccess = true;
              result = all;
            }
          };

          cursorRequest.onError = onError;
        },

        /**
         * Clears the store, i.e. deletes all entries in the store.
         *
         * @param {Function} [onSuccess] A callback that will be called if the
         *  operation was successful.
         * @param {Function} [onError] A callback that will be called if an
         *  error occurred during the operation.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        clear: function clear(onSuccess, onError) {
          onError || (onError = defaultErrorHandler);
          onSuccess || (onSuccess = defaultSuccessHandler);
          var hasSuccess = false,
              result = null;
          var clearTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);

          clearTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          clearTransaction.onabort = onError;
          clearTransaction.onerror = onError;
          var clearRequest = clearTransaction.objectStore(this.storeName).clear();

          clearRequest.onsuccess = function (event) {
            hasSuccess = true;
            result = event.target.result;
          };

          clearRequest.onerror = onError;
          return clearTransaction;
        },

        /**
         * Checks if an id property needs to present on a object and adds one if
         * necessary.
         *
         * @param {Object} dataObj The data object that is about to be stored
         * @private
         */
        _addIdPropertyIfNeeded: function _addIdPropertyIfNeeded(dataObj) {
          if (typeof dataObj[this.keyPath] == 'undefined') {
            dataObj[this.keyPath] = this._insertIdCount++ + Date.now();
          }
        },

        /************
         * indexing *
         ************/

        /**
         * Returns a DOMStringList of index names of the store.
         *
         * @return {DOMStringList} The list of index names
         */
        getIndexList: function getIndexList() {
          return this.store.indexNames;
        },

        /**
         * Checks if an index with the given name exists in the store.
         *
         * @param {String} indexName The name of the index to look for
         * @return {Boolean} Whether the store contains an index with the given name
         */
        hasIndex: function hasIndex(indexName) {
          return this.store.indexNames.contains(indexName);
        },

        /**
         * Normalizes an object containing index data and assures that all
         * properties are set.
         *
         * @param {Object} indexData The index data object to normalize
         * @param {String} indexData.name The name of the index
         * @param {String} [indexData.keyPath] The key path of the index
         * @param {Boolean} [indexData.unique] Whether the index is unique
         * @param {Boolean} [indexData.multiEntry] Whether the index is multi entry
         */
        normalizeIndexData: function normalizeIndexData(indexData) {
          indexData.keyPath = indexData.keyPath || indexData.name;
          indexData.unique = !!indexData.unique;
          indexData.multiEntry = !!indexData.multiEntry;
        },

        /**
         * Checks if an actual index complies with an expected index.
         *
         * @param {IDBIndex} actual The actual index found in the store
         * @param {Object} expected An Object describing an expected index
         * @return {Boolean} Whether both index definitions are identical
         */
        indexComplies: function indexComplies(actual, expected) {
          var complies = ['keyPath', 'unique', 'multiEntry'].every(function (key) {
            // IE10 returns undefined for no multiEntry
            if (key == 'multiEntry' && actual[key] === undefined && expected[key] === false) {
              return true;
            } // Compound keys


            if (key == 'keyPath' && Object.prototype.toString.call(expected[key]) == '[object Array]') {
              var exp = expected.keyPath;
              var act = actual.keyPath; // IE10 can't handle keyPath sequences and stores them as a string.
              // The index will be unusable there, but let's still return true if
              // the keyPath sequence matches.

              if (typeof act == 'string') {
                return exp.toString() == act;
              } // Chrome/Opera stores keyPath squences as DOMStringList, Firefox
              // as Array


              if (!(typeof act.contains == 'function' || typeof act.indexOf == 'function')) {
                return false;
              }

              if (act.length !== exp.length) {
                return false;
              }

              for (var i = 0, m = exp.length; i < m; i++) {
                if (!(act.contains && act.contains(exp[i]) || act.indexOf(exp[i] !== -1))) {
                  return false;
                }
              }

              return true;
            }

            return expected[key] == actual[key];
          });
          return complies;
        },

        /**********
         * cursor *
         **********/

        /**
         * Iterates over the store using the given options and calling onItem
         * for each entry matching the options.
         *
         * @param {Function} onItem A callback to be called for each match
         * @param {Object} [options] An object defining specific options
         * @param {String} [options.index=null] A name of an IDBIndex to operate on
         * @param {String} [options.order=ASC] The order in which to provide the
         *  results, can be 'DESC' or 'ASC'
         * @param {Boolean} [options.autoContinue=true] Whether to automatically
         *  iterate the cursor to the next result
         * @param {Boolean} [options.filterDuplicates=false] Whether to exclude
         *  duplicate matches
         * @param {IDBKeyRange} [options.keyRange=null] An IDBKeyRange to use
         * @param {Boolean} [options.writeAccess=false] Whether grant write access
         *  to the store in the onItem callback
         * @param {Function} [options.onEnd=null] A callback to be called after
         *  iteration has ended
         * @param {Function} [options.onError=throw] A callback to be called
         *  if an error occurred during the operation.
         * @param {Number} [options.limit=Infinity] Limit the number of returned
         *  results to this number
         * @param {Number} [options.offset=0] Skip the provided number of results
         *  in the resultset
         * @param {Boolean} [options.allowItemRejection=false] Allows the onItem
         * function to return a Boolean to accept or reject the current item
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        iterate: function iterate(onItem, options) {
          options = mixin({
            index: null,
            order: 'ASC',
            autoContinue: true,
            filterDuplicates: false,
            keyRange: null,
            writeAccess: false,
            onEnd: null,
            onError: defaultErrorHandler,
            limit: Infinity,
            offset: 0,
            allowItemRejection: false
          }, options || {});
          var directionType = options.order.toLowerCase() == 'desc' ? 'PREV' : 'NEXT';

          if (options.filterDuplicates) {
            directionType += '_NO_DUPLICATE';
          }

          var hasSuccess = false;
          var cursorTransaction = this.db.transaction([this.storeName], this.consts[options.writeAccess ? 'READ_WRITE' : 'READ_ONLY']);
          var cursorTarget = cursorTransaction.objectStore(this.storeName);

          if (options.index) {
            cursorTarget = cursorTarget.index(options.index);
          }

          var recordCount = 0;

          cursorTransaction.oncomplete = function () {
            if (!hasSuccess) {
              options.onError(null);
              return;
            }

            if (options.onEnd) {
              options.onEnd();
            } else {
              onItem(null);
            }
          };

          cursorTransaction.onabort = options.onError;
          cursorTransaction.onerror = options.onError;
          var cursorRequest = cursorTarget.openCursor(options.keyRange, this.consts[directionType]);
          cursorRequest.onerror = options.onError;

          cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor) {
              if (options.offset) {
                cursor.advance(options.offset);
                options.offset = 0;
              } else {
                var onItemReturn = onItem(cursor.value, cursor, cursorTransaction);

                if (!options.allowItemRejection || onItemReturn !== false) {
                  recordCount++;
                }

                if (options.autoContinue) {
                  if (recordCount + options.offset < options.limit) {
                    cursor['continue']();
                  } else {
                    hasSuccess = true;
                  }
                }
              }
            } else {
              hasSuccess = true;
            }
          };

          return cursorTransaction;
        },

        /**
         * Runs a query against the store and passes an array containing matched
         * objects to the success handler.
         *
         * @param {Function} onSuccess A callback to be called when the operation
         *  was successful.
         * @param {Object} [options] An object defining specific options
         * @param {String} [options.index=null] A name of an IDBIndex to operate on
         * @param {String} [options.order=ASC] The order in which to provide the
         *  results, can be 'DESC' or 'ASC'
         * @param {Boolean} [options.filterDuplicates=false] Whether to exclude
         *  duplicate matches
         * @param {IDBKeyRange} [options.keyRange=null] An IDBKeyRange to use
         * @param {Function} [options.onError=throw] A callback to be called
         *  if an error occurred during the operation.
         * @param {Number} [options.limit=Infinity] Limit the number of returned
         *  results to this number
         * @param {Number} [options.offset=0] Skip the provided number of results
         *  in the resultset
         * @param {Function} [options.filter=null] A custom filter function to
         *  apply to query resuts before returning. Must return `false` to reject
         *  an item. Can be combined with keyRanges.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        query: function query(onSuccess, options) {
          var result = [],
              processedItems = 0;
          options = options || {};
          options.autoContinue = true;
          options.writeAccess = false;
          options.allowItemRejection = !!options.filter;

          options.onEnd = function () {
            onSuccess(result, processedItems);
          };

          return this.iterate(function (item) {
            processedItems++;
            var accept = options.filter ? options.filter(item) : true;

            if (accept !== false) {
              result.push(item);
            }

            return accept;
          }, options);
        },

        /**
         *
         * Runs a query against the store, but only returns the number of matches
         * instead of the matches itself.
         *
         * @param {Function} onSuccess A callback to be called if the opration
         *  was successful.
         * @param {Object} [options] An object defining specific options
         * @param {String} [options.index=null] A name of an IDBIndex to operate on
         * @param {IDBKeyRange} [options.keyRange=null] An IDBKeyRange to use
         * @param {Function} [options.onError=throw] A callback to be called if an error
         *  occurred during the operation.
         * @returns {IDBTransaction} The transaction used for this operation.
         */
        count: function count(onSuccess, options) {
          options = mixin({
            index: null,
            keyRange: null
          }, options || {});
          var onError = options.onError || defaultErrorHandler;
          var hasSuccess = false,
              result = null;
          var cursorTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);

          cursorTransaction.oncomplete = function () {
            var callback = hasSuccess ? onSuccess : onError;
            callback(result);
          };

          cursorTransaction.onabort = onError;
          cursorTransaction.onerror = onError;
          var cursorTarget = cursorTransaction.objectStore(this.storeName);

          if (options.index) {
            cursorTarget = cursorTarget.index(options.index);
          }

          var countRequest = cursorTarget.count(options.keyRange);

          countRequest.onsuccess = function (evt) {
            hasSuccess = true;
            result = evt.target.result;
          };

          countRequest.onError = onError;
          return cursorTransaction;
        },

        /**************/

        /* key ranges */

        /**************/

        /**
         * Creates a key range using specified options. This key range can be
         * handed over to the count() and iterate() methods.
         *
         * Note: You must provide at least one or both of "lower" or "upper" value.
         *
         * @param {Object} options The options for the key range to create
         * @param {*} [options.lower] The lower bound
         * @param {Boolean} [options.excludeLower] Whether to exclude the lower
         *  bound passed in options.lower from the key range
         * @param {*} [options.upper] The upper bound
         * @param {Boolean} [options.excludeUpper] Whether to exclude the upper
         *  bound passed in options.upper from the key range
         * @param {*} [options.only] A single key value. Use this if you need a key
         *  range that only includes one value for a key. Providing this
         *  property invalidates all other properties.
         * @return {IDBKeyRange} The IDBKeyRange representing the specified options
         */
        makeKeyRange: function makeKeyRange(options) {
          /*jshint onecase:true */
          var keyRange,
              hasLower = typeof options.lower != 'undefined',
              hasUpper = typeof options.upper != 'undefined',
              isOnly = typeof options.only != 'undefined';

          switch (true) {
            case isOnly:
              keyRange = this.keyRange.only(options.only);
              break;

            case hasLower && hasUpper:
              keyRange = this.keyRange.bound(options.lower, options.upper, options.excludeLower, options.excludeUpper);
              break;

            case hasLower:
              keyRange = this.keyRange.lowerBound(options.lower, options.excludeLower);
              break;

            case hasUpper:
              keyRange = this.keyRange.upperBound(options.upper, options.excludeUpper);
              break;

            default:
              throw new Error('Cannot create KeyRange. Provide one or both of "lower" or "upper" value, or an "only" value.');
          }

          return keyRange;
        }
      };
      /** helpers **/

      var empty = {};

      function mixin(target, source) {
        var name, s;

        for (name in source) {
          s = source[name];

          if (s !== empty[name] && s !== target[name]) {
            target[name] = s;
          }
        }

        return target;
      }

      IDBStore.prototype = proto;
      IDBStore.version = proto.version;
      return IDBStore;
    }, commonjsGlobal);
  });

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
   * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
   */
  /**
   * Prefix all databases
   * @type {String}
   */

  var prefix = 'tao-store-';
  /**
   * Access to the index of known stores.
   * This index is needed to maintain the list of stores created by TAO, in order to apply an auto clean up.
   * @type {Promise}
   */

  var knownStores;
  /**
   * The name of the store that contains the index of known stores.
   * @type {String}
   */

  var knownStoresName = 'index';
  /**
   * The name of the store that contains the store id
   * @type {String}
   */

  var idStoreName = 'id';
  /**
   * Check if we're using the v2 of IndexedDB
   * @type {Boolean}
   */

  var isIndexedDB2 = typeof IDBObjectStore !== 'undefined' && 'getAll' in IDBObjectStore.prototype;
  /**
   * Opens a store
   * @returns {Promise} with store instance in resolve
   */

  var openStore = function openStore(storeName) {
    return new Promise(function (resolve, reject) {
      var store = new idbstore({
        dbVersion: 1,
        storeName: storeName,
        storePrefix: prefix,
        keyPath: 'key',
        autoIncrement: true,
        onStoreReady: function onStoreReady() {
          // auto closes when the changed version reflects a DB deletion
          store.db.onversionchange = function onversionchange(e) {
            if (!e || !e.newVersion) {
              store.db.close();
            }
          };

          resolve(store);
        },
        onError: reject
      });
    });
  };
  /**
   * Sets an entry into a particular store
   * @param store
   * @param key
   * @param value
   * @returns {Promise}
   */


  var setEntry = function setEntry(store, key, value) {
    return new Promise(function (resolve, reject) {
      var entry = {
        key: key,
        value: value
      };

      var success = function success(returnKey) {
        resolve(returnKey === key);
      };

      store.put(entry, success, reject);
    });
  };
  /**
   * Gets an entry from a particular store
   * @param store
   * @param key
   * @returns {Promise}
   */


  var getEntry = function getEntry(store, key) {
    return new Promise(function (resolve, reject) {
      var success = function success(entry) {
        if (!entry || typeof entry.value === 'undefined') {
          return resolve(entry);
        }

        resolve(entry.value);
      };

      store.get(key, success, reject);
    });
  };
  /**
   * Get entries from a store
   * @param store
   * @returns {Promise<Object>} entries
   */


  var getEntries = function getEntries(store) {
    return new Promise(function (resolve, reject) {
      var success = function success(entries) {
        if (!_.isArray(entries)) {
          return resolve({});
        }

        resolve(_.reduce(entries, function (acc, entry) {
          if (entry.key && entry.value) {
            acc[entry.key] = entry.value;
          }

          return acc;
        }, {}));
      };

      store.getAll(success, reject);
    });
  };
  /**
   * Remove an entry from a particular store
   * @param store
   * @param key
   * @param value
   * @returns {Promise}
   */


  var removeEntry = function removeEntry(store, key) {
    return new Promise(function (resolve, reject) {
      var success = function success(result) {
        resolve(result !== false);
      };

      store.remove(key, success, reject);
    });
  };
  /**
   * Gets access to the store that contains the index of known stores.
   * @returns {Promise}
   */


  var getKnownStores = function getKnownStores() {
    if (!knownStores) {
      knownStores = openStore(knownStoresName);
    }

    return knownStores;
  };
  /**
   * Adds a store into the index of known stores.
   * @param {String} storeName
   * @returns {Promise}
   */


  var registerStore = function registerStore(storeName) {
    return getKnownStores().then(function (store) {
      return setEntry(store, storeName, {
        name: storeName,
        lastOpen: Date.now()
      });
    });
  };
  /**
   * Removes a store from the index of known stores.
   * @param {String} storeName
   * @returns {Promise}
   */


  var unregisterStore = function unregisterStore(storeName) {
    return getKnownStores().then(function (store) {
      return removeEntry(store, storeName);
    });
  };
  /**
   * Deletes a store, then removes it from the index of known stores.
   * @param store
   * @param storeName
   * @returns {Promise}
   */


  var deleteStore = function deleteStore(store, storeName) {
    return new Promise(function (resolve, reject) {
      var success = function success() {
        unregisterStore(storeName).then(function () {
          resolve(true);
        }).catch(reject);
      }; //with old implementation, deleting a store is
      //either unsupported or buggy


      if (isIndexedDB2) {
        store.deleteDatabase(success, reject);
      } else {
        store.clear(success, reject);
      }
    });
  };
  /**
   * Open and access a store
   * @param {String} storeName - the store name to open
   * @returns {Object} the store backend
   * @throws {TypeError} without a storeName
   */


  var indexDbBackend = function indexDbBackend(storeName) {
    //keep a ref of the running store
    var innerStore;
    /**
     * Get the store
     * @returns {Promise} with store instance in resolve
     */

    var getStore = function getStore() {
      if (!innerStore) {
        innerStore = openStore(storeName).then(function (store) {
          return registerStore(storeName).then(function () {
            return Promise.resolve(store);
          });
        });
      }

      return innerStore;
    }; //keep a ref to the promise actually writing


    var writePromise;
    /**
     * Ensure write promises are executed in series
     * @param {Function} getWritingPromise - the function that run the promise
     * @returns {Promise} the original one
     */

    var ensureSerie = function ensureSerie(getWritingPromise) {
      //first promise, keep the ref
      if (!writePromise) {
        writePromise = getWritingPromise();
        return writePromise;
      } //create a wrapping promise


      return new Promise(function (resolve, reject) {
        //run the current request
        var runWrite = function runWrite() {
          var p = getWritingPromise();
          writePromise = p; //and keep the ref

          p.then(resolve).catch(reject);
        }; //wait the previous to resolve or fail and run the current one


        writePromise.then(runWrite).catch(runWrite);
      });
    };

    if (_.isEmpty(storeName) || !_.isString(storeName)) {
      throw new TypeError('The store name is required');
    }
    /**
     * The store
     */


    return {
      /**
       * Get an item with the given key
       * @param {String} key
       * @returns {Promise} with the result in resolve, undefined if nothing
       */
      getItem: function getItem(key) {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return getEntry(store, key);
          });
        });
      },

      /**
       * Set an item with the given key
       * @param {String} key - the item key
       * @param {*} value - the item value
       * @returns {Promise} with true in resolve if added/updated
       */
      setItem: function setItem(key, value) {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return setEntry(store, key, value);
          });
        });
      },

      /**
       * Remove an item with the given key
       * @param {String} key - the item key
       * @returns {Promise} with true in resolve if removed
       */
      removeItem: function removeItem(key) {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return removeEntry(store, key);
          });
        });
      },

      /**
       * Get all store items
       * @returns {Promise<Object>} with a collection of items
       */
      getItems: function getItems() {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return getEntries(store);
          });
        });
      },

      /**
       * Clear the current store
       * @returns {Promise} with true in resolve once cleared
       */
      clear: function clear() {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return new Promise(function (resolve, reject) {
              var success = function success() {
                resolve(true);
              };

              store.clear(success, reject);
            });
          });
        });
      },

      /**
       * Delete the database related to the current store
       * @returns {Promise} with true in resolve once cleared
       */
      removeStore: function removeStore() {
        return ensureSerie(function getWritingPromise() {
          return getStore().then(function (store) {
            return deleteStore(store, storeName);
          });
        });
      }
    };
  };
  /**
   * Removes all storage
   * @param {Function} [validate] - An optional callback that validates the store to delete
   * @param {Function} [backend] - An optional storage handler to use
   * @returns {Promise} with true in resolve once cleaned
   */


  indexDbBackend.removeAll = function removeAll(validate) {
    if (!_.isFunction(validate)) {
      validate = null;
    }

    return getKnownStores().then(function (store) {
      return new Promise(function (resolve, reject) {
        function cleanUp(entries) {
          var all = [];

          _.forEach(entries, function (entry) {
            var storeName = entry && entry.key;

            if (storeName) {
              all.push(openStore(storeName).then(function (storeToRemove) {
                if (!validate || validate(storeName, entry.value)) {
                  return deleteStore(storeToRemove, storeName);
                }
              }));
            }
          });

          Promise.all(all).then(resolve).catch(reject);
        }

        store.getAll(cleanUp, reject);
      });
    });
  };
  /**
   * Get all storage
   * @param {Function} [validate] - An optional callback that validates the store to delete
   * @param {Function} [backend] - An optional storage handler to use
   * @returns {Promise} with true in resolve once cleaned
   */


  indexDbBackend.getAll = function getAll(validate) {
    if (!_.isFunction(validate)) {
      validate = function valid() {
        return true;
      };
    }

    return getKnownStores().then(function (store) {
      return new Promise(function (resolve, reject) {
        store.getAll(function (entries) {
          var storeNames = _(entries).filter(function (entry) {
            return entry && entry.key && validate(entry.key, entry.value);
          }).map(function (entry) {
            return entry.key;
          }).value();

          return resolve(storeNames);
        }, reject);
      });
    });
  };
  /**
   * Get the identifier of the storage
   * @returns {Promise} that resolves with the store identifier
   */


  indexDbBackend.getStoreIdentifier = function getStoreIdentifier() {
    return openStore(idStoreName).then(function (store) {
      return getEntry(store, idStoreName).then(function (id) {
        if (!_.isEmpty(id)) {
          return id;
        }

        id = uuid();
        return setEntry(store, idStoreName, id).then(function () {
          return id;
        });
      });
    });
  };

  return indexDbBackend;

});
