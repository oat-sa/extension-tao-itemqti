/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'util/image',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/selectPoint'
], function($, _, imageUtil, stateFactory, Question, formElement, interactionFormElement,  identifierHelper, formTpl){

    
    /**
     * The question state for the selectPoint interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Question
     */
    var SelectPointInteractionStateQuestion = stateFactory.extend(Question);

    /**
     * Initialize the form linked to the interaction
     */
    SelectPointInteractionStateQuestion.prototype.initForm = function(){

        //var _widget = this.widget,
            //$form = _widget.$form,
            //interaction = _widget.element;

        //$form.html(formTpl({
            //maxChoices : parseInt(interaction.attr('maxChoices')),
            //minChoices : parseInt(interaction.attr('minChoices'))
       //}));

        //formElement.initWidget($form);
        
        ////init data change callbacks
        //var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices');
        //formElement.initDataBinding($form, interaction, callbacks);
        
        //interactionFormElement.syncMaxChoices(_widget);

        // ---------------------------


        var _widget = this.widget,
            options = _widget.options,
            $form = _widget.$form,
            $uploadTrigger,
            $src, $width, $height,
            interaction = _widget.element;

        $form.html(formTpl({
            baseUrl         : options.baseUrl,
            maxChoices      : parseInt(interaction.attr('maxChoices')),
            minChoices      : parseInt(interaction.attr('minChoices')),
            data            : interaction.object.attributes.data,
            width           : interaction.object.attributes.width,
            height          : interaction.object.attributes.height
        }));

        $uploadTrigger = $form.find('[data-role="upload-trigger"]');
        $src = $form.find('input[name=data]');
        $width = $form.find('input[name=width]');
        $height = $form.find('input[name=height]');

        $uploadTrigger.on('click', function(){
            $uploadTrigger.resourcemgr({
                appendContainer : options.mediaManager.appendContainer,
                root : '/',
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    filters : 'image/jpeg,image/png,image/gif'
                },
                pathParam : 'path',
                select : function(e, files){
                    if(files.length > 0){ 
                        imageUtil.getSize(options.baseUrl + files[0].file, function(size){
                            
                            if(size && size.width >= 0){
                                $width.val(size.width).trigger('change');
                                $height.val(size.height).trigger('change');
                            }
                            $src.val(files[0].file).trigger('change');
                        });
                    }
                }
            });
        });

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices');
        callbacks.data = function(inteaction, value){
            interaction.object.attr('data', value);
            _widget.rebuild({
                ready:function(widget){
                    widget.changeState('question');
                }
            });
        };
        callbacks.width = function(inteaction, value){
            interaction.object.attr('width', value);
        };
        callbacks.height = function(inteaction, value){
            interaction.object.attr('height', value);
        };
        formElement.initDataBinding($form, interaction, callbacks);
        
        interactionFormElement.syncMaxChoices(_widget);
    };

    return SelectPointInteractionStateQuestion;
});
