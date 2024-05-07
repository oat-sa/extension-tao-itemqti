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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationExtractor as GenericExtractor;
use oat\taoQtiItem\model\qti\metadata\ontology\LabelBasedLomOntologyClassificationExtractor as LabelExtractor;

class ReplaceMetadataExtractor extends InstallAction
{
    public function __invoke($params)
    {
        /** @var MetadataExporter $metadataExporter */
        $metadataService = $this->getServiceManager()->get(MetadataService::SERVICE_ID);
        $metadataExporter = $metadataService->getOption('export');
        $exportExtractors = $metadataExporter->getOption('extractors');
        if (($key = array_search(GenericExtractor::class, $exportExtractors)) !== false) {
            $exportExtractors[$key] = LabelExtractor::class;
            $metadataExporter->setOption('extractors', $exportExtractors);
        }

        $metadataService->setOption('export', $metadataExporter);

        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }
}
