define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/responseDeclaration'], function(tpl){
    return {
        qtiClass : 'responseDeclaration',
        template : tpl,
        getData : function(responseDeclaration, data){
            var defaultData = {
                empty: !Object.keys(responseDeclaration.mapEntries).length &&
                    !Object.keys(responseDeclaration.correctResponse).length &&
                    !Object.keys(responseDeclaration.defaultValue).length,
                correctResponse: Object.values(responseDeclaration.correctResponse),
                isAreaMapping: (responseDeclaration.attributes.baseType === "point"),
                mappingAttributes: responseDeclaration.mappingAttributes,
                hasMapEntries: Object.keys(responseDeclaration.mapEntries).length > 0,
                mapEntries: responseDeclaration.mapEntries,
                defaultValue: responseDeclaration.defaultValue,
                isRecord: responseDeclaration.attributes.cardinality === 'record'
            };

            return Object.assign({}, defaultData, data || {});
        }
    };
});