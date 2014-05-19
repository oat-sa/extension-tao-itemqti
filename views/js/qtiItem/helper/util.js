/**
 * Common basic util functions
 */
define(['lodash'], function(_){
    return {
        buildSerial : function buildSerial(prefix){
            var id = prefix || '';
            var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            for(var i = 0; i < 22; i++){
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        },
        fullpath : function(src, baseUrl){

            src = src || '';
            baseUrl = baseUrl || '';

            if(src){

                src = src.replace(/^\//, '');

                if(!src.match(/^http/i)){

                    if(baseUrl && !baseUrl.match(/\/$/)){
                        baseUrl += '/';
                    }

                    src = baseUrl + src;
                }
            }

            return src;
        },
        findInCollection : function(element, collectionNames, searchedSerial){

            var found = null;

            if(_.isString(collectionNames)){
                collectionNames = [collectionNames];
            }

            if(_.isArray(collectionNames)){

                _.each(collectionNames, function(elementCollection){

                    var elt = element[elementCollection][searchedSerial];

                    if(elt){
                        found = {'parent' : element, 'element' : elt};
                        return false;//break the each loop
                    }

                    //search inside each elements:
                    _.each(element[elementCollection], function(elt){
                        found = elt.find(searchedSerial);
                        if(found){
                            return false;//break the each loop
                        }
                    });

                    if(found){
                        return false;//break the each loop
                    }

                });

            }else{

                throw new Error('invalid argument : colllectionNames must be an array or a string');
            }

            return found;

        }
    }
});