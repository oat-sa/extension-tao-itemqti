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

use core_kernel_classes_Resource;
use oat\taoQtiItem\model\qti\Service;
use Psr\Log\LoggerInterface;
use Throwable;

class QtiLanguageRetriever
{
    private Service $qtiItemService;
    private LoggerInterface $logger;

    public function __construct(Service $qtiItemService, LoggerInterface $logger)
    {
        $this->qtiItemService = $qtiItemService;
        $this->logger = $logger;
    }

    public function __invoke(core_kernel_classes_Resource $item): ?string
    {
        try {
            $itemData = $this->qtiItemService->getDataItemByRdfItem($item);
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

        return $itemData && $itemData->hasAttribute('xml:lang')
            ? $itemData->getAttributeValue('xml:lang')
            : null;
    }
}
