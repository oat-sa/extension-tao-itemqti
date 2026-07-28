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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\helpers;

use DOMDocument;
use DOMElement;
use DOMXPath;

/**
 * Keep UMFI / scoring-model feature data-* on the first textEntryInteraction
 * in document order (required after insert-before in the creator).
 */
class UmfiTextEntryXmlAttributes
{
    public const FEATURE_DATA_ATTRS = [
        'data-item-type',
        'data-umfi-values',
        'data-case-sensitive',
        'data-allow-lexical-fields-on-scoring',
        'data-scoring-model',
    ];

    /**
     * Move feature data-* onto the first textEntryInteraction in document order.
     * Safe no-op when XML cannot be parsed or no feature attrs exist.
     */
    public static function relocateFeatureDataAttrsToFirstTextEntry(string $xml): string
    {
        if ($xml === '') {
            return $xml;
        }

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = true;
        $previous = libxml_use_internal_errors(true);

        try {
            if ($dom->loadXML($xml) === false) {
                return $xml;
            }
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        $xpath = new DOMXPath($dom);
        $nodes = $xpath->query('//*[local-name()="textEntryInteraction"]');

        if ($nodes === false || $nodes->length === 0) {
            return $xml;
        }

        /** @var array<string, string> $collected */
        $collected = [];

        foreach ($nodes as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }

            foreach (self::FEATURE_DATA_ATTRS as $name) {
                if (isset($collected[$name]) || !$node->hasAttribute($name)) {
                    continue;
                }

                $collected[$name] = $node->getAttribute($name);
            }
        }

        if ($collected === []) {
            return $xml;
        }

        $isFirst = true;

        foreach ($nodes as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }

            foreach (self::FEATURE_DATA_ATTRS as $name) {
                $node->removeAttribute($name);
            }

            if ($isFirst) {
                foreach (self::FEATURE_DATA_ATTRS as $name) {
                    if (!isset($collected[$name])) {
                        continue;
                    }

                    $node->setAttribute($name, $collected[$name]);
                }

                $isFirst = false;
            }
        }

        $saved = $dom->saveXML();

        return is_string($saved) ? $saved : $xml;
    }
}
