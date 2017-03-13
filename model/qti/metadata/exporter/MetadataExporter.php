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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\exporter;

use oat\taoQtiItem\model\qti\metadata\AbstractMetadataService;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

/**
 * Class MetadataExporter
 * Export metadata service
 *
 * @package oat\taoQtiItem\model\qti\metadata\exporter
 */
class MetadataExporter extends AbstractMetadataService
{
    public function export(\core_kernel_classes_Resource $resource, \DOMDocument $imsManifest)
    {
        $this->setMetadataValues($this->extract($resource));
        foreach (array_keys($this->getMetadataValues()) as $identifier) {
            $this->inject($identifier, $imsManifest);
        }
        return $imsManifest;
    }

    /**
     * Extract metadata value form a resource
     *
     * {@inheritdoc}
     */
    public function extract(\core_kernel_classes_Resource $resource)
    {
        return parent::extract($resource);
    }

    /**
     * Inject an identified metadata value to a dom IMS manifest
     *
     * {@inheritdoc}
     */
    public function inject($identifier, \DOMDocument $imsManifest)
    {
        parent::inject($identifier, $imsManifest);
    }

    /**
     * Allow to register, into the config, the current exporter service
     */
    protected function registerService()
    {
        $metadataService = $this->getServiceLocator()->get(MetadataService::SERVICE_ID);
        $metadataService->setOption(MetadataService::EXPORTER_KEY, $this);
        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }
}