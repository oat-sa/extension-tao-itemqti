define(['jquery', 'tpl!taoQtiItem/qtiCreator/editor/blockAdder/tpl/addColumnRow'], function($, adderTpl){
    
    var _ns = '.block-adder';
    
    function create($container){
        
        $container.find('.widget-box').each(function(){
            var $widget = $(this);
            $widget.append(adderTpl());
        });
        
        console.log($container.find('.add-block-element .circle'));
        //bind add event
        $container.on('mousedown', '.add-block-element .circle', function(e){
            debugger;
            e.preventDefault();
            e.stopPropagation();
            console.log('insert below here');
        });
    }
    
    return {
        create: create
    };
});