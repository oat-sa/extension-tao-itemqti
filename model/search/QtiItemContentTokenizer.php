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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\search;

use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\search\tokenizer\ResourceTokenizer;
use oat\taoQtiItem\model\qti\Service;
use taoItems_models_classes_ItemsService;

class QtiItemContentTokenizer implements ResourceTokenizer
{
    use OntologyAwareTrait;

    /**
     * Get tokens as string[] extracted from a QTI file
     * XML inside qti.xml is parsed and all text is tokenized
     *
     * @param \core_kernel_classes_Resource $resource
     * @return array
     */
    public function getStrings(\core_kernel_classes_Resource $resource)
    {
        try {
            $ontologyFiles = $resource->getPropertyValues($this->getProperty(taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT));
            if (empty($ontologyFiles)) {
                return [];
            }
        } catch (\core_kernel_classes_EmptyProperty $e) {
            return [];
        }

        $file = $this->getFileReferenceSerializer()
            ->unserializeDirectory(reset($ontologyFiles))
            ->getFile(Service::QTI_ITEM_FILE);
        
        if (! $file->exists()) {
            return [];
        }

        $content = $file->read();
        if (empty($content)) {
            return [];
        }

        $dom = new \DOMDocument();
        $dom->loadXML($content);
        $xpath = new \DOMXPath($dom);

        $textNodes = $xpath->query('//text()');
        unset($xpath);

        $contentStrings = array();
        foreach ($textNodes as $textNode) {
            if (ctype_space($textNode->wholeText) === false) {
                $contentStrings[] = trim($textNode->wholeText);
            }
        }

        return $contentStrings;
    }

    /**
     * @return FileReferenceSerializer
     */
    protected function getFileReferenceSerializer()
    {
        return ServiceManager::getServiceManager()->get(FileReferenceSerializer::SERVICE_ID);
    }
}