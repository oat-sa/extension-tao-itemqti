define([
    'lodash',
    'jquery',
    'taoQtiItem/core/Loader',
    'taoQtiItem/core/Element',
    'taoQtiCommonRenderer/renderers/Renderer',
    'json!taoQtiItem/../../../test/samples/json/ALL.json'
], function(_, $, Loader, Element, Renderer, data){

    var CL = console.log;

    var _responseEqual = function(actual, expected, ordered){
        ordered = ordered || false;
        var responseStr = JSON.stringify(expected);
        if(actual.base || actual.list && ordered){
            deepEqual(actual, expected, 'response matches : ' + responseStr);
        }else if(actual.list && expected.list){
            var _isListEqual = function(actualList, expectedList){
                var ret = true;
                for(var i in actualList){
                    if(typeof(actualList[i]) === 'object'){
                        ret = _isListEqual(actualList[i], expectedList[i]);
                    }else{
                        ret = (!_.difference(actual.list[i], expected.list[i]).length);
                    }
                    if(!ret){
                        break;
                    }
                }
                return ret;
            };
            ok(_isListEqual(actual.list, expected.list), 'unordered listed response matches :' + responseStr);
        }else{
            deepEqual(actual, expected, 'special reponse format matching : ' + responseStr);
        }
    };
    
    var _responseTypeEqual = function(interaction){
        var response = interaction.getResponse(),
            responseStr = JSON.stringify(response),
            typesEquality = false,
            baseType = interaction.getResponseDeclaration().attr('baseType'),
            responseType = '';

        var _getValueType = function(value){
            if(typeof value === 'number'){
                if(!!(value%1)){
                    return 'float';
                }else{
                    return 'integer';
                }
            }else{
                return typeof value;
            }
        }

        if(baseType == 'identifier'){
            var identifierExists = (response.base && response.base.identifier) || (response.list && response.list.identifier);

//            ok(identifierExists, 'response type matches : identifier');
        } else if(response.base && response.base[baseType]){
            responseType = _getValueType(response.base[baseType]);
            typesEquality = responseType === baseType;
            
//            ok(typesEquality, 'response type matches : ' + responseType);
        } else if(response.list && response.list[baseType]) {
            for(var i in response.list[baseType]){
                responseType = _getValueType(response.list[baseType][i]);
                typesEquality = responseType === baseType;
                if(!typesEquality) break;
            }
            
//            ok(typesEquality, 'response type matches : ' + responseType);
        } else {
            console.log('reponse format does not match :  ' + responseStr);
        }
    };

    var Test = {
        testRender : function(itemIdentifier, attributes, responses){

            if(data[itemIdentifier]){

                test('render', function(){

                    var loader = new Loader();
                    var renderer = new Renderer({
                        runtimeContext : {
                            runtime_base_www : '/taoQTI/test/samples/test_base_www/',
                            root_url : '',
                            debug : true
                        }
                    });

                    stop();//wait for the next start()

                    loader.loadItemData(data[itemIdentifier].full, function(item){
                        
                        ok(Element.isA(item, 'assessmentItem'), itemIdentifier + ' item loaded');
                        
                        //count interaction number:
                        var interactions = item.getInteractions();
                        ok(interactions.length, 'has ' + interactions.length + ' interaction(s)');

                        //test only the last interaction:
                        var interaction = interactions.pop();
                        interaction.attr(attributes);//overwrite attributes for test purpose:
                        
                        //append item placeholder and render it:
                        var $placeholder = $('<div>', {id : 'qtiItem-' + item.id()});
                        var $title = $('<h2>', {text : 'identifier : ' + item.id()});
                        $("#qunit-fixture").after($placeholder.before($title));

                        renderer.load(function(){

                            start();

                            //set renderer
                            item.setRenderer(this);

                            //render tpl:
                            try{
                                item.render({}, $placeholder);
                            }catch(e){
                                CL('error in template rendering', e);
                            }

                            //check item container:
                            ok(item.getContainer().length, 'rendered container found');

                            //post render:
                            try{
                                item.postRender();
                            }catch(e){
                                CL('error in post rendering', e);
                            }

                            if(_.isArray(responses)){
                                //test responses set() and get():
                                _.each(responses, function(response){
                                    interaction.setResponse({});//reset response
                                    interaction.setResponse(response.set);//assign the given value
                                    _responseEqual(interaction.getResponse(), response.get);//test the assigned value
                                    _responseTypeEqual(interaction);//test the response type
                                });
                            }

                        }, this.getLoadedClasses());

                    });


                });
            }else{
                throw new Error('item sample not found : ' + itemIdentifier);
            }

        }
    };

    return Test;
});
