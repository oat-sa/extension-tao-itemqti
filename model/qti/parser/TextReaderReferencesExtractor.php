<?php

/*
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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\parser;

use DOMDocument;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;

class TextReaderReferencesExtractor extends ConfigurableService
{
    private const TEXT_READER_TYPE_IDENTIFIER = 'textReaderInteraction';

    public function extract(Item $qtiItem): array
    {
        $references = [];

        foreach ($this->getTextReaderInteractions($qtiItem) as $interaction) {
            $references = array_merge($references, $this->extractFromInteraction($interaction));
        }

        return array_values(array_unique($references));
    }

    /**
     * @return array<int, PortableCustomInteraction|ImsPortableCustomInteraction>
     */
    public function getTextReaderInteractions(Item $qtiItem): array
    {
        $interactions = array_merge(
            $qtiItem->getComposingElements(PortableCustomInteraction::class),
            $qtiItem->getComposingElements(ImsPortableCustomInteraction::class)
        );

        return array_values(
            array_filter(
                $interactions,
                static fn ($interaction): bool => (
                    ($interaction instanceof PortableCustomInteraction
                        || $interaction instanceof ImsPortableCustomInteraction)
                    && $interaction->getTypeIdentifier() === self::TEXT_READER_TYPE_IDENTIFIER
                )
            )
        );
    }

    public function extractFromInteraction(
        PortableCustomInteraction|ImsPortableCustomInteraction $interaction
    ): array {
        $properties = $interaction->getProperties();
        $pages = $this->normalizePagesProperty($properties['pages'] ?? null);
        if ($pages === []) {
            return [];
        }

        $references = [];

        foreach ($pages as $page) {
            if (!isset($page['content']) || !is_array($page['content'])) {
                continue;
            }

            $references = array_merge($references, $this->extractImageSourcesFromContent($page['content']));
        }

        return array_values(array_unique($references));
    }

    private function extractImageSourcesFromContent(array $content): array
    {
        $references = [];
        $previousState = libxml_use_internal_errors(true);

        try {
            foreach ($content as $element) {
                if (!is_string($element) || $element === '') {
                    continue;
                }

                $dom = new DOMDocument();
                $dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $element);
                libxml_clear_errors();

                foreach ($dom->getElementsByTagName('img') as $image) {
                    $src = $image->getAttribute('src');
                    if ($src !== '') {
                        $references[] = $src;
                    }
                }
            }
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousState);
        }

        return $references;
    }

    private function normalizePagesProperty($pages): array
    {
        if (is_array($pages)) {
            return $pages;
        }

        if (!is_string($pages) || $pages === '') {
            return [];
        }

        $decoded = json_decode($pages, true);

        return is_array($decoded) ? $decoded : [];
    }
}
