define(['IMSGlobal/jquery_2_1_1', 'OAT/util/html'], function($, html){

    function renderChoices(id, $container, config){

        var $li,
            level = parseInt(config.level) || 5,
            $ul = $container.find('ul.likert');
        
        //ensure that renderChoices() is idempotent
        $ul.empty();
        
        //add levels
        for(var i = 1; i <= level; i++){

            $li = $('<li>', {'class' : 'likert'});
            $li.append($('<input>', {type : 'radio', name : id, value : i}));

            $ul.append($li);
        }
    }

    function renderLabels(id, $container, config, assetManager){

        var $ul = $container.find('ul.likert');
        var $labelMin = $('<span>', {'class' : 'likert-label likert-label-min'}).html(config['label-min']);
        var $labelMax = $('<span>', {'class' : 'likert-label likert-label-max'}).html(config['label-max']);
        
        $labelMin.append($('<img>', {src: assetManager.resolve('samplePci/runtime/assets/ThumbDown.png')}).css({top: 6, marginLeft:12}));
        $labelMax.prepend($('<img>', {src: assetManager.resolve('samplePci/runtime/assets/ThumbUp.png')}).css({top: 2, marginRight:12}));
        
        $ul.before($labelMin);
        $ul.after($labelMax);
    }

    return {
        render : function(id, container, config, assetManager){

            var $container = $(container);

            renderChoices(id, $container, config);
            renderLabels(id, $container, config, assetManager);
            
            //render rich text content in prompt
            html.render($container.find('.prompt'));
        },
        renderChoices : function(id, container, config){
            renderChoices(id, $(container), config);
        }
    };
});