define([], function(){
    "use strict";
    return {
        removeChoice : function(response, choice){

            var escapedIdentifier = choice.id().replace(/([.-])/g, '\\$1'),
                regex = new RegExp('([^a-z_\-\d\.]*)(' + escapedIdentifier + ')([^a-z_\-\d\.]*)');

            response.correctResponse = response.correctResponse.filter(entry => !entry.match(regex));

            var mapEntries = {};
            Object.entries(response.mapEntries).forEach(([mapKey, value]) => {
                if (!mapKey.match(regex)) {
                    mapEntries[mapKey] = value;
                }
            });
            response.mapEntries = mapEntries;

        }
    };
});