define([
    'jquery',
    'helpers',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'json!taoQtiItem/qtiItem/../../../test/samples/json/ALL.json'
], function($, helpers, Loader, Item, qtiClasses, data){
    
    var _generateIdentifier = function(uri){
        var pos = uri.lastIndexOf('#');
        return uri.substr(pos);
    };
    
    var Loader = {
        loadItem : function(config, callback){

            if(config.uri){
                $.ajax({
                    url : helpers._url('getItemData', 'QtiCreator', 'taoQtiItem'),
                }).done(function(data){

                    if(data.item && data.item.qtiClass === 'assessmentItem'){
                        var loader = new Loader().setClassesLocation(qtiClasses);
                        loader.loadItemData(data.item, function(item){
                            callback(item, this.getLoadedClasses());
                        });

                    }else{
                        var item = new Item().id(_generateIdentifier(config.uri));
                        item.createResponseProcessing();
                        callback(item);
                    }

                });
            }
        }
    };

    return Loader;
});