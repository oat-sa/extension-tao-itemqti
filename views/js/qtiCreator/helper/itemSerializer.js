/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['lodash'], function(_){
    'use strict';

    /**
     * Clean up item values from values that are not data and may be cyclic dependencies
     * @private
     * @param {*} value - the property/item value
     */
    var cleanUpItem = function cleanUpItem(value){
        if (_.isObject(value) && !_.isFunction(value)){
            
            if(value.relatedItem){
                delete value.relatedItem;
            }
            if(value.renderer){
                delete value.renderer;
            }
            if(value.widget){
                delete value.widget;
            }
            if(value._super){
                delete value._super;
            }
            if(value.metaData){
                delete value.metaData;
            }

            //recursiv call
            _.forEach(value, cleanUpItem);
        }
    };

    /**
     * Helps you to create a JSON representation of an item
     * @exports taoQtiItem/qtiCreator/helper/itemSerializer
     */
    var itemSerializer = {

        /**
         * Serialize an item object to JSON
         * @param {Object} item - the {@link taoQtiItem/qtiCreator/model/Item} to serialize
         * @returns {String} the JSON string
         */
        serialize : function(item){
           var serialized = ''; 
           if(item){
               try {
                    //clone and serialize the cleaned up value 
                    serialized = JSON.stringify(
                                _.forEach( _.cloneDeep(item), cleanUpItem )
                             );
                } catch(e){
                    console.error(e);
                }
            }
            return serialized;
        }
    };

    return itemSerializer;
});
