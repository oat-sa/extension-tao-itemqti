<?php
/**
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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *               2013-2016 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

namespace oat\taoQtiItem\model\Export;

class QTIPackedItem22Exporter extends QTIPackedItemExporter {
    
    protected function renderManifest(array $options, array $qtiItemData)
    {
        $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $tpl = $dir . 'model/qti/templates/imsmanifestQti22.tpl.php';
        
        $templateRenderer = new \taoItems_models_classes_TemplateRenderer($tpl, array(
            'qtiItems' 				=> array($qtiItemData),
            'manifestIdentifier'    => 'MANIFEST-' . \tao_helpers_Display::textCleaner(uniqid('tao', true), '-')
        ));
            
        $renderedManifest = $templateRenderer->render();
        $newManifest = new \DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($renderedManifest);
        
        return $newManifest;
    }
    
    protected function itemContentPostProcessing($content)
    {
        $content = str_replace(
            'http://www.imsglobal.org/xsd/imsqti_v2p1',
            'http://www.imsglobal.org/xsd/imsqti_v2p2',
            $content
        );
        
        $content = str_replace(
            'http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd',
            'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2p1.xsd',
            $content
        );
        
        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct',
            'http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct',
            $content
        );
        
        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
            'http://www.imsglobal.org/question/qti_v2p2/rptemplates/map_response',
            $content
        );
        
        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point',
            'http://www.imsglobal.org/question/qti_v2p2/rptemplates/map_response_point',
            $content
        );
        
        return $content;
    }
}
