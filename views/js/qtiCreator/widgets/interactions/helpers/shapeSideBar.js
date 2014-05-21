/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 'lodash', 
    'tpl!taoQtiItem/qtiCreator/tpl/graphicInteraction/sidebar'
], function($, _, sidebarTmpl){

    /**
     * @exports qtiCreator/widgets/interaction/helpers/shapeSideBar
     */
    var shapeSideBar  = {

        create : function create($container){

            var $imageEditor = $container.find('.image-editor');
            var $imageBox = $('.main-image-box', $imageEditor);
            var $sideBar = $(sidebarTmpl()).insertBefore($imageEditor);
            var $forms = $('li[data-type]', $sideBar);
            var $bin = $('li.bin', $sideBar);
            var newWidth = parseInt($imageBox.width(), 10) - parseInt($sideBar.outerWidth(), 10) - 2;
            
            $imageBox.width(newWidth);
            $imageEditor.width(newWidth);

            $sideBar.on('enablebin.qti-widget', function(){
               $bin.removeClass('disabled')
                    .on('click', function(e){
                        e.preventDefault();
                        $sideBar.trigger('bin.qti-widget');
                    });
            });
            $sideBar.on('disablebin.qti-widget', function(){
               $bin.addClass('disabled')
                    .off('click'); 
            });

            $forms.click(function(e){
                e.preventDefault();
        
                var $form = $(this);

                if(!$form.hasClass('active')){
                    $forms.removeClass('active');
                    $form.addClass('active');

                    $sideBar.trigger('shapeactive.qti-widget', [$form, $form.data('type')]);
                } else {
                    $forms.removeClass('active');
                    $sideBar.trigger('shapedeactive.qti-widget');
                }
            }); 
       
             
            $container.on('resize.qti-widget', function(){
                $sideBar.find('.forms').height($imageEditor.innerHeight());
            });    
            $container.trigger('resize.qti-widget', newWidth);    

            return $sideBar;
        },

        remove : function remove($container){
            var $sideBar = $('.image-sidebar', $container);
            var $imageEditor = $container.find('.image-editor');
            var $imageBox = $('.main-image-box', $imageEditor);
            if($sideBar.length){
                $sideBar.remove();
                $imageBox.css('width', 'auto');
                $imageEditor.css('width', 'auto');

                $container.trigger('resize');    
            }
        }
    };


    return shapeSideBar;
});
