define([
    'jquery',
    'helpers',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses'
], function($, helpers, Loader, Item, qtiClasses){

    var _generateIdentifier = function(uri){
        var pos = uri.lastIndexOf('#');
        return uri.substr(pos + 1);
    };

    var creatorLoader = {
        loadItem : function(config, callback){

            if(config.uri){
                $.ajax({
                    url : helpers._url('getItemData', 'QtiCreator', 'taoQtiItem'),
                    dataType : 'json',
                    data : {
                        uri : config.uri
                    }
                }).done(function(data){

                    if(data.itemData && data.itemData.qtiClass === 'assessmentItem'){

                        var loader = new Loader().setClassesLocation(qtiClasses),
                            itemData = data.itemData;

                        loader.loadItemData(itemData, function(item){
                            callback(item, this.getLoadedClasses());
                        });
                    }else{

                        var item = new Item().id(_generateIdentifier(config.uri));
                        item.createOutcomeDeclaration({
                            identifier : 'SCORE',
                            cardinality : 'single',
                            baseType : 'float'
                        });
                        item.createResponseProcessing();
                        callback(item);
                    }

                });
            }
        }
    };

    return creatorLoader;
});
