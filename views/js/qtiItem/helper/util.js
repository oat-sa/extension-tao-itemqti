/**
 * Common basic util functions
 */
define(['lodash'], function(_){
    var util = {
        buildSerial : function buildSerial(prefix){
            var id = prefix || '';
            var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            for(var i = 0; i < 22; i++){
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        },
        fullpath : function fullpath(src, baseUrl){

            src = src || '';
            baseUrl = baseUrl || '';

            if(src){

                src = src.replace(/^\//, '');
                
                var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                //if src is base64 encoded or a http request do not touch it
                if(!pattern.test(src) || !/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/.test(src) || src.indexOf('/') === -1){

                    if(baseUrl && !baseUrl.match(/\/$/)){
                        baseUrl += '/';
                    }

                    src = baseUrl + src;
                }
            }

            return src;
        },
        findInCollection : function findInCollection(element, collectionNames, searchedSerial){

            var found = null;

            if(_.isString(collectionNames)){
                collectionNames = [collectionNames];
            }

            if(_.isArray(collectionNames)){

                _.each(collectionNames, function(collectionName){

                    //get collection to search in (resolving case like interaction.choices.0
                    var collection = element;
                    _.each(collectionName.split('.'), function(nameToken){
                        collection = collection[nameToken];
                    });
                    var elt = collection[searchedSerial];

                    if(elt){
                        found = {'parent' : element, 'element' : elt};
                        return false;//break the each loop
                    }

                    //search inside each elements:
                    _.each(collection, function(elt){

                        if(_.isFunction(elt.find)){
                            found = elt.find(searchedSerial);
                            if(found){
                                return false;//break the each loop
                            }
                        }

                    });

                    if(found){
                        return false;//break the each loop
                    }

                });

            }else{

                throw new Error('invalid argument : collectionNames must be an array or a string');
            }

            return found;
        },
        addMarkupNamespace : function addMarkupNamespace(markup, ns){
            if(ns) {
                markup = markup.replace(/<(\/)?([a-z:]+)(\s?)([^><]*)>/g, function($0, $1, $2, $3, $4){
                    if($2.indexOf(':')>0){
                        return $0;
                    }
                    $1 = $1 || '';
                    $3 = $3 || '';
                    return '<'+ $1 + ns + ':'+$2+$3+$4+'>';
                });
                return markup;
            }
            return markup;

        },
        removeMarkupNamespaces : function removeMarkupNamespace(markup){
            return markup.replace(/<(\/)?(\w*):([^>]*)>/g, '<$1$3>');
        },
        getMarkupUsedNamespaces : function getMarkupUsedNamespaces(markup){
            var namespaces = [];
            markup.replace(/<(\/)?(\w*):([^>]*)>/g, function(original, slash, ns, node){
                namespaces.push(ns);
                return '<'+slash+node+'>';
            });
            return _.uniq(namespaces);
        }
    };

    return util;
});