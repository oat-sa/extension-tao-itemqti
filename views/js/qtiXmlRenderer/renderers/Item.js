define(['lodash', 'tpl!taoQtiXmlRenderer/tpl/item'], function(_, tpl){
    return {
        qtiClass : 'assessmentItem',
        template : tpl,
        getData : function(item, data){
            
            var ns = _.clone(item.namespaces);
            delete ns[''];
            delete ns['xsi'];
            delete ns['xml'];
            
            var defaultData = {
                responses : [],
                outcomes : [],
                stylesheets : [],
                namespaces : ns,
                responseProcessing : item.responseProcessing ? item.responseProcessing.render() : ''
            };

            _.each(item.responses, function(response){
                defaultData.responses.push(response.render());
            });
            _.each(item.outcomes, function(outcome){
                defaultData.outcomes.push(outcome.render());
            });
            _.each(item.stylesheets, function(stylesheet){
                defaultData.stylesheets.push(stylesheet.render());
            });
            
            return _.merge(data || {}, defaultData);
        }
    };
});