/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define(['OAT/handlebars'], function(handlebars){
    
    /**
     * Find and compile templates found in the $container
     */
    function loadTemplates($container){
        
        var templates = {};
        var $templates = $($container.find('[type="text/x-template-manifest"]').html());
        $templates.each(function(){
            
            var $template = $(this),
                id = $template.data('template-id'),
                tplBody = $template.html();
                
            if(id && tplBody){
                templates[id] = handlebars.compile();
            }    
        });
        
        return templates;
    }
    
    function tpl($container){
        
        var templates = loadTemplates($container);
        
        return {
            exists : function exists(templateId){
                return (templateId && templates[templateId]);
            },
            render : function render(templateId, data){
                if(templateId && templates[templateId]){
                    return templates[templateId](data || {});
                }else{
                    throw 'no valid template found for the id ' + templateId;
                }
            }
        };
    }
    
    return tpl;
});