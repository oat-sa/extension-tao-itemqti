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

namespace oat\taoQtiItem\model\Translation\Listener;

use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\model\Translation\Service\QtiIdentifierRetriever;
use Psr\Log\LoggerInterface;

class ItemUpdatedEventListener
{
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private Ontology $ontology;
    private QtiIdentifierRetriever $qtiIdentifierRetriever;
    private LoggerInterface $logger;

    public function __construct(
        FeatureFlagCheckerInterface $featureFlagChecker,
        Ontology $ontology,
        QtiIdentifierRetriever $qtiIdentifierRetriever,
        LoggerInterface $logger
    ) {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->ontology = $ontology;
        $this->qtiIdentifierRetriever = $qtiIdentifierRetriever;
        $this->logger = $logger;
    }

    public function populateTranslationProperties(ItemUpdatedEvent $event): void
    {
        if (!$this->featureFlagChecker->isEnabled('FEATURE_TRANSLATION_ENABLED')) {
            return;
        }

        $uniqueIdProperty = $this->ontology->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER);
        $item = $this->ontology->getResource($event->getItemUri());

        if (!empty((string) $item->getOnePropertyValue($uniqueIdProperty))) {
            $this->logger->info(
                sprintf(
                    'The property "%s" for the item "%s" has already been set.',
                    $uniqueIdProperty->getUri(),
                    $item->getUri()
                )
            );

            return;
        }

        $identifier = $this->qtiIdentifierRetriever->retrieve($item);

        if ($identifier) {
            $item->setPropertyValue($uniqueIdProperty, $identifier);
        }
    }
}
