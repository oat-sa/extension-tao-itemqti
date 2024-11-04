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

namespace oat\taoQtiItem\model\UniqueId\Listener;

use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\generis\model\data\event\ResourceCreated;
use oat\generis\model\data\Ontology;
use oat\oatbox\event\Event;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\event\ItemDuplicatedEvent;
use oat\taoQtiItem\model\event\ItemImported;
use oat\taoQtiItem\model\qti\identifierGenerator\IdentifierGenerator;
use oat\taoQtiItem\model\qti\Service;

class ItemCreatedEventListener
{
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private Ontology $ontology;
    private IdentifierGenerator $identifierGenerator;
    private Service $qtiItemService;

    public function __construct(
        FeatureFlagCheckerInterface $featureFlagChecker,
        Ontology $ontology,
        IdentifierGenerator $identifierGenerator,
        Service $qtiItemService
    ) {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->ontology = $ontology;
        $this->identifierGenerator = $identifierGenerator;
        $this->qtiItemService = $qtiItemService;
    }

    public function generateUniqueId(Event $event): void
    {
        if (
            !$event instanceof ItemCreatedEvent
            && !$event instanceof ItemImported
            && !$event instanceof ItemDuplicatedEvent
        ) {
            return;
        }

        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            return;
        }

        $identifier = $this->identifierGenerator->generate();

        $item = $this->getEventItem($event);
        $item->editPropertyValues(
            $this->ontology->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER),
            $identifier
        );

        $itemData = $this->qtiItemService->getDataItemByRdfItem($item);

        if (!$itemData) {
            return;
        }

        $itemData->setAttribute('identifier', $identifier);
        $this->qtiItemService->saveDataItemToRdfItem($itemData, $item);
    }

    private function getEventItem(Event $event): core_kernel_classes_Resource
    {
        if ($event instanceof ItemCreatedEvent) {
            return $this->ontology->getResource($event->getItemUri());
        }

        if ($event instanceof ItemImported) {
            return $event->getRdfItem();
        }

        if ($event instanceof ItemDuplicatedEvent) {
            return $this->ontology->getResource($event->getCloneUri());
        }

        throw new InvalidArgumentException('Cannot retrieve event item: event %s is not supported', get_class($event));
    }
}