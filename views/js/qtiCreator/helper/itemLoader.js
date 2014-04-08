define([
    'jquery',
    'helpers',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'json!taoQtiItem/qtiItem/../../../test/samples/json/ALL.json'
], function($, helpers, Loader, Item, qtiClasses, DATA) {

    var _generateIdentifier = function(uri) {
        var pos = uri.lastIndexOf('#');
        return uri.substr(pos);
    };

    var creatorLoader = {
        loadItem: function(config, callback) {

            if (config.uri) {
                $.ajax({
                    url: helpers._url('getItemData', 'QtiCreator', 'taoQtiItem'),
                    dataType: 'json',
                    data: {
                        uri: config.uri
                    }
                }).done(function(data) {

                    if (data.itemData && data.itemData.qtiClass === 'assessmentItem') {

                        var loader = new Loader().setClassesLocation(qtiClasses),
                            itemData = data.itemData;

                        itemData = DATA['choice'].full;

                        loader.loadItemData(itemData, function(item) {
                            callback(item, this.getLoadedClasses());
                        });
                    } else {

                        var item = new Item().id(_generateIdentifier(config.uri));
                        item.createResponseProcessing();
                        callback(item);
                    }

                });
            }
        }
    };

    return creatorLoader;
});