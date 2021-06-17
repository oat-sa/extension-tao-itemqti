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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\search;

use core_kernel_classes_Resource;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\search\tokenizer\ResourceTokenizer;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\search\Filter\TokenFilterInterface;
use taoItems_models_classes_ItemsService;

class QtiItemContentTokenizer extends ConfigurableService implements ResourceTokenizer
{
    use OntologyAwareTrait;

    public const SERVICE_ID = 'taoQtiItem/QtiItemContentTokenizer';
    public const OPTION_FILTERS = 'data_filters';

    /**
     * Get tokens as string[] extracted from a QTI file
     * XML inside qti.xml is parsed and all text is tokenized
     *
     * @return array
     */
    public function getStrings(core_kernel_classes_Resource $resource)
    {
        try {
            $ontologyFiles = $resource->getPropertyValues(
                $this->getProperty(taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT)
            );
            if (empty($ontologyFiles)) {
                return [];
            }
        } catch (\core_kernel_classes_EmptyProperty $e) {
            return [];
        }

        $file = $this->getFileReferenceSerializer()
            ->unserializeDirectory(reset($ontologyFiles))
            ->getFile(Service::QTI_ITEM_FILE);

        if (!$file->exists()) {
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

        $contentStrings = [];
        foreach ($textNodes as $textNode) {
            if ($this->applyFilters($textNode->wholeText)) {
                $contentStrings[] = trim($textNode->wholeText);
            }
        }

        return $contentStrings;
    }

    protected function getFileReferenceSerializer(): FileReferenceSerializer
    {
        return $this->getServiceManager()->get(FileReferenceSerializer::SERVICE_ID);
    }

    protected function applyFilters($data): bool
    {
        /** @var TokenFilterInterface $filter */
        foreach ($this->getOption(self::OPTION_FILTERS, []) as $filter) {
            if (!$filter->filter($data)) {
                return false;
            }
        }
        return true;
    }
}
