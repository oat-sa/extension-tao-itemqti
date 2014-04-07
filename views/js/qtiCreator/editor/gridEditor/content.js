define([], function(){

    var contentHelper = {};

    contentHelper.serializeElements = function($el){

        $el.find('.widget-box').each(function(){

            var $qtiElementWidget = $(this);

            if($qtiElementWidget.data('serial')){

                //an existing qti element:
                var serial = $qtiElementWidget.data('serial');
                $qtiElementWidget.replaceWith('{{' + serial + '}}');

            }else if($qtiElementWidget.data('new') && $qtiElementWidget.data('qti-class')){

                //a newly inserted qti element
                var qtiClass = $qtiElementWidget.data('qti-class');
                $qtiElementWidget.replaceWith('{{' + qtiClass + ':new}}');
            }else{

                throw 'unknown qti-widget type';
            }

        });

    };

    return contentHelper;
});