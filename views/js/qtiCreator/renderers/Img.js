define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Img',
    'taoQtiItem/qtiCreator/widgets/static/img/Widget'
], function(_, Renderer, Widget){

    var CreatorImg = _.clone(Renderer);

    CreatorImg.render = function(img, options){
        
        return Widget.build(
            img,
            Renderer.getContainer(img),
            this.getOption('bodyElementOptionForm'),
            options
        );
    };

    return CreatorImg;
});