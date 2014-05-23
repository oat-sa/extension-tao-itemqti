define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCommonRenderer/renderers/ModalFeedback',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeFinder',
    'jquery',
    'ui/modal'
], function(stateFactory, Active, commonRenderer, sizeFinder, $){

    var _maxWidth = 800;

    /**
     * handle z-indices of sidebar and ckeditor
     */
    var indices = (function(){

        var selectors = {
            sidebar : '#item-editor-item-widget-bar',
            cke : '.cke',
            ckeBase : '.cke_inner',
            ckeNose : '.cke_nose',
            ckeToolbar : '.cke_toolbar'
        };

        var raised = false,
            selector,
            elements = {};

        return {
            raise : function(baseIndex){

                var $elem, index;

                baseIndex = parseInt(baseIndex, 10);

                for(selector in selectors){

                    $elem = $(selectors[selector]);

                    index = parseInt($elem.css('z-index'), 10);
                    if(isNaN(index)){
                        index = 100;
                    }

                    elements[selector] = {
                        element : $elem,
                        index : index
                    };

                    $elem.css('z-index', elements[selector].index + baseIndex);
                }
            },
            reset : function(){
                if(!raised){
                    return;
                }
                for(selector in elements){
                    elements[selector].element.css('z-index', elements[selector].index);
                }
            }
        }
    }());

    var _ckeIsReady = function($editable){
        
        var dfd = new $.Deferred(),
            iteration = 0;

        var poll = function(){
            
            var editor = $editable.data('editor')
            
            if(iteration > 20){
                return;
            }
            
            if(editor){
                dfd.resolve();
            }else{
                setTimeout(poll, 200);
            }
            
        };
        poll();

        return dfd.promise();
    };

    var StaticStateActive = stateFactory.extend(Active, function(){

        var _widget = this.widget,
            $container = this.widget.$container,
            $editable = $container.find('[data-html-editable]');

        sizeFinder.measure($container, null, function(size){

            $container.modal({startClosed : true, width : Math.min(size.width, commonRenderer.maxWidth)});
            $container.modal('open');

            $.when(_ckeIsReady($editable)).then(function(){
                indices.raise($container.css('z-index'));
            });

            $container.on('closed.modal', function(){
                _widget.changeState('sleep');
            });

        });

    }, function(){

        var $container = this.widget.$container;

        $container.off('opened.modal');
        $container.modal('close');

        // reset ck and sidebar
        indices.reset();
        
        //close ck tlb
        $container.find('.tlb-button.active[data-role=cke-launcher]').click();
    });

    return StaticStateActive;
});