define(['lodash'], function(_){
    
   var templateNames = {
        'MATCH_CORRECT' : 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct',
        'MAP_RESPONSE' : 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
        'MAP_RESPONSE_POINT' : 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point'
    };
    
   return {
       isUsingTemplate : function(response, tpl){
            if(_.isString(tpl)){
                if(tpl === response.template || templateNames[tpl] === response.template){
                    return true;
                }
            }
            return false;
        }
   };
});