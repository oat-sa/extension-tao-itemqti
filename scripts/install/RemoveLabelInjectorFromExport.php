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
use oat\taoQtiItem\model\qti\metadata\MetadataService;

class RemoveLabelInjectorFromExport extends InstallAction
{
    public function __invoke($params)
    {
        $metadataService = $this->getServiceManager()->get(MetadataService::SERVICE_ID);
        $exportOption = $metadataService->getOption(MetadataService::EXPORTER_KEY);
        $extractors = $exportOption->getOption('extractors');

        $classToRemove = 'oat\taoQtiItem\model\qti\metadata\ontology\LabelBasedLomOntologyClassificationExtractor';

        if (($key = array_search($classToRemove, $extractors)) !== false) {
            unset($extractors[$key]);
            $extractors = array_values($extractors);

            $exportOption->setOption('extractors', $extractors);
            $metadataService->setOption(MetadataService::EXPORTER_KEY, $exportOption);
            $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
        }
    }
}
