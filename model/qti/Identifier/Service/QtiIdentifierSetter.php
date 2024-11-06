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

namespace oat\taoQtiItem\model\qti\Identifier\Service;

use oat\tao\model\Translation\Service\AbstractQtiIdentifierSetter;
use oat\taoQtiItem\model\qti\Service;
use Psr\Log\LoggerInterface;

class QtiIdentifierSetter extends AbstractQtiIdentifierSetter
{
    private Service $qtiItemService;

    public function __construct(Service $qtiItemService, LoggerInterface $logger)
    {
        parent::__construct($logger);

        $this->qtiItemService = $qtiItemService;
    }

    protected function applyIdentifier(array $options): void
    {
        $item = $this->getResource($options);
        $itemData = $this->qtiItemService->getDataItemByRdfItem($item);

        if (!$itemData) {
            return;
        }

        $itemData->setAttribute('identifier', $this->getIdentifier($options));
        $this->qtiItemService->saveDataItemToRdfItem($itemData, $item);
    }
}
