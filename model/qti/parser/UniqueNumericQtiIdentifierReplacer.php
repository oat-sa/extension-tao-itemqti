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

namespace oat\taoQtiItem\model\qti\parser;

use DOMXPath;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\taoQtiItem\helpers\QtiXmlLoader;

class UniqueNumericQtiIdentifierReplacer
{
    private FeatureFlagChecker $featureFlagChecker;
    private QtiXmlLoader $qtiXmlLoader;

    public function __construct(FeatureFlagChecker $featureFlagChecker, QtiXmlLoader $qtiXmlLoader)
    {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->qtiXmlLoader = $qtiXmlLoader;
    }
    public function replace(string $qti): string
    {
        if (!$this->featureFlagChecker->isEnabled(FeatureFlagChecker::FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER)) {
            return $qti;
        }
        $doc = $this->qtiXmlLoader->load($qti);

        $xpath = new DOMXpath($doc);
        $xpath->registerNamespace('qti', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        $identifierNodes = $xpath->query('//qti:assessmentItem/@identifier');

        foreach ($identifierNodes as $identifierNode) {
            $identifierNode->nodeValue = $this->getNumericIdentifier();
        }

        return $doc->saveXML();
    }

    private function getNumericIdentifier(): string
    {
        return substr((string)floor(time() / 1000), 0, 7)
            . substr((string)floor(mt_rand(10, 100)), 0, 2);
    }
}
