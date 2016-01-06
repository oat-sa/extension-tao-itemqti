define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element', 'taoQtiItem/qtiItem/helper/container'], function(tpl, containerHelper){
    
    var classPrefix = 'x-tao-relatedOutcome-';
    
    function encodeOutcomeInfo(fb){
        
        var relatedResponse = fb.data('relatedResponse');
        var oldRelatedOutcomeInfo = '', $fbBody, matches;

        //encode the related outcome into a css class
        if(relatedResponse && relatedResponse.attr('identifier')){

            //find the old one (if applicable)
            $fbBody = containerHelper.getBodyDom(fb);
            if($fbBody && $fbBody.length && $fbBody.attr('class')){
                var regex = new RegExp(classPrefix+'([a-zA-Z0-9\-._]*)');
                matches = $fbBody.attr('class').match(regex);
                if(matches){
                    oldRelatedOutcomeInfo = matches[0];
                }
            }
            //set the new one
            containerHelper.setBodyDomClass(fb, classPrefix+relatedResponse.attr('identifier'), oldRelatedOutcomeInfo);
        }
    }
    
    return {
        qtiClass : 'modalFeedback',
        template : tpl,
        getData : function getData(fb, data){
            
            encodeOutcomeInfo(fb);
            data.body = fb.body();
            
            return data;
        }
    };
});