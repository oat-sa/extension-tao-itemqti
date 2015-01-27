define([
    'taoQtiItem/qtiCreator/renderers/Renderer',
    'helpers',
    'jquery',
    'lodash',
    'util/dom'
], function(Renderer, helpers, $, _, dom){

    //configure and instanciate once only:
    var _creatorRenderer = null;
    
    /**
     * Get a preconfigured renderer singleton
     * 
     * @param {Boolean} reset
     * @param {Object} config
     * @returns {Object} - a configured instance of creatorRenderer
     */
    var get = function(reset, config){
        if(!_creatorRenderer || reset){

            var $bodyEltForm = _creatorRenderer ? _creatorRenderer.getOption('bodyElementOptionForm') : null;
            var mediaSources = config.properties.mediaSources || [];
            if(reset
                || !$bodyEltForm
                || !$bodyEltForm.length
                || !dom.contains($bodyEltForm)){

                _creatorRenderer = new Renderer({
                    baseUrl : '',
                    lang : '',
                    uri : '',
                    shuffleChoices : false,
                    itemOptionForm : $('#item-editor-item-property-bar .panel'),
                    interactionOptionForm : $('#item-editor-interaction-property-bar .panel'),
                    choiceOptionForm : $('#item-editor-choice-property-bar .panel'),
                    responseOptionForm : $('#item-editor-response-property-bar .panel'),
                    bodyElementOptionForm : $('#item-editor-body-element-property-bar .panel'),
                    textOptionForm : $('#item-editor-text-property-bar .panel'),
                    modalFeedbackOptionForm : $('#item-editor-modal-feedback-property-bar .panel'),
                    mediaManager : {
                        appendContainer : '#mediaManager',
                        browseUrl : helpers._url('files', 'ItemContent', 'taoItems'),
                        uploadUrl : helpers._url('upload', 'ItemContent', 'taoItems'),
                        deleteUrl : helpers._url('delete', 'ItemContent', 'taoItems'),
                        downloadUrl : helpers._url('download', 'ItemContent', 'taoItems'),
                        fileExistsUrl : helpers._url('fileExists', 'ItemContent', 'taoItems'),
                        mediaSources : mediaSources
                    }
                });

            }
        }

        return _creatorRenderer;
    };


    return {
        get : function(reset, config){
            return get(reset, config);
        },
        setOption : function(name, value){
            return get().setOption(name, value);
        },
        setOptions : function(options){
            return get().setOptions(options);
        },
        load : function(qtiClasses, done){
            return get().load(function(){
                if(_.isFunction(done)){
                    done.apply(this, arguments);
                }
            }, qtiClasses);
        }
    };

});
