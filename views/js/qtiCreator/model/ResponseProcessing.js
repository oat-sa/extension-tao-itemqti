define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/ResponseProcessing',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(_, editable, ResponseProcessing, xmlRenderer){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        setProcessingType : function(processingType){

            if(this.processingType !== processingType){

                if(this.processingType === 'custom'){

                    //change all response template to default : "correct"
                    _.forEach(this.getRootElement().getResponses(), function(r){
                         r.setTemplate('MATCH_CORRECT');
                    });
                }

                if (processingType === 'custom') {
                    // set current response processing as default
                    this.xml = xmlRenderer.render(this.getRootElement().responseProcessing, { notAllowTemplate: true });

                    // change all response template "custom"
                    _.forEach(this.getRootElement().getResponses(), function(r){
                        r.setTemplate('CUSTOM');
                    });
                }

                this.processingType = processingType;
            }

        }
    });

    return ResponseProcessing.extend(methods);
});
