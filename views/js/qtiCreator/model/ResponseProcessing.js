define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/ResponseProcessing',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(editable, ResponseProcessing, xmlRenderer){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        setProcessingType : function(processingType, xml){

            if(this.processingType !== processingType){

                if(this.processingType === 'custom'){

                    //change all response template to default : "correct"
                    this.getRootElement().getResponses().forEach(r => {
                        r.setTemplate('MATCH_CORRECT');
                    });
                }

                if (processingType === 'custom') {
                    // set current response processing as default
                    this.xml = xml || xmlRenderer.render(this.getRootElement().responseProcessing, { notAllowTemplate: true });

                    // change all response template "custom"
                    this.getRootElement().getResponses().forEach(r => {
                        r.setTemplate('CUSTOM');
                    });
                }

                this.processingType = processingType;
            }

        }
    });

    return ResponseProcessing.extend(methods);
});
