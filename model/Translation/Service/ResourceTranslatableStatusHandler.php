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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Translation\Service;

use oat\generis\model\data\Ontology;
use oat\tao\model\Translation\Entity\ResourceTranslatableStatus;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use Psr\Log\LoggerInterface;
use Throwable;

class ResourceTranslatableStatusHandler
{
    private Service $qtiItemService;
    private LoggerInterface $logger;
    private Ontology $ontology;

    public function __construct(Service $qtiItemService, LoggerInterface $logger, Ontology $ontology)
    {
        $this->qtiItemService = $qtiItemService;
        $this->logger = $logger;
        $this->ontology = $ontology;
    }

    public function __invoke(ResourceTranslatableStatus $status): void
    {
        try {
            $item = $this->ontology->getResource($status->getUri());

            $itemData = $this->qtiItemService->getDataItemByRdfItem($item);

            $status->setEmpty(!$itemData || $itemData->isEmpty());
        } catch (Throwable $exception) {
            $this->logger->error(
                sprintf(
                    'An error occurred while retrieving item data: %s. Trace: %s',
                    $exception->getMessage(),
                    $exception->getTraceAsString()
                )
            );

            throw $exception;
        }
    }
}
