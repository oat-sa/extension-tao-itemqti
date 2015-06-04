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
 * Copyright (c) 2013-2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 */

namespace oat\taoQtiItem\model\apip;

use oat\taoQtiItem\helpers\Apip;
use \tao_models_classes_Service;
use \taoItems_models_classes_ItemsService;
use \core_kernel_classes_Resource;
use DOMDocument;

/**
 * ApipService offers apip item content manipulation functions
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @author Sam <sam@taotesting.com>
 */
class ApipService extends tao_models_classes_Service
{

    /**
     * Split the QTI APIP XML Document into the QTI item part and the APIP item part
     * 
     * @param core_kernel_classes_Resource $item
     * @param DOMDocument $originalDoc
     */
    public function storeApipAccessibilityContent(core_kernel_classes_Resource $item, DOMDocument $originalDoc)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();

        if (($apipContent = Apip::extractApipAccessibility($originalDoc)) !== null) {
            // Call ApipService to store the data separately.
            $finalLocation = $itemService->getItemFolder($item).'apip.xml';
            file_put_contents($finalLocation, $apipContent->saveXML());

            \common_Logger::i("APIP content stored at '${finalLocation}'.");
        }
    }

    /**
     * Get the accessibility node for an rdf item
     * 
     * @param core_kernel_classes_Resource $item
     * @return \DOMDocument
     */
    public function getApipAccessibilityContent(core_kernel_classes_Resource $item)
    {
        $apipContent = null;

        $itemService   = taoItems_models_classes_ItemsService::singleton();
        $finalLocation = $itemService->getItemFolder($item).'apip.xml';

        if (is_readable($finalLocation) === true) {
            $apipContent = new DOMDocument('1.0', 'UTF-8');
            $apipContent->load($finalLocation);

            \common_Logger::i("APIP content retrieved at '${finalLocation}'.");
        }

        return $apipContent;
    }

    /**
     * Get the default ApipAccessbility node
     * 
     * @return \DOMDocument
     */
    public function getDefaultApipAccessibilityContent()
    {
        // $item not in used but will be. Namespaces might depend on the APIP version in use.
        $content = new DOMDocument('1.0', 'UTF-8');
        $content->loadXML('<apipAccessibility xmlns="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0" xmlns:apip="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0"/>');
        return $content;
    }

    /**
     * Get the DOMDocument representing the merged item with both QTI and APIP contents
     * 
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @return \DOMDocument
     */
    public function getMergedApipItemContent(core_kernel_classes_Resource $item, $lang = '')
    {

        $itemService = taoItems_models_classes_ItemsService::singleton();
        $qtiContent  = $itemService->getItemContent($item, $lang);

        $apipContentDoc = $this->getApipAccessibilityContent($item);
        if ($apipContentDoc === null) {
            $apipContentDoc = $this->getDefaultApipAccessibilityContent($item);
        }

        $qtiItemDoc = new DOMDocument('1.0', 'UTF-8');
        $qtiItemDoc->loadXML($qtiContent);

        //merge QTI and APIP Accessibility
        Apip::mergeApipAccessibility($qtiItemDoc, $apipContentDoc);
        return $qtiItemDoc;
    }
}