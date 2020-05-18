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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\parser;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\Item;
use tao_helpers_Uri;

class IncludedElementIdsExtractor extends ConfigurableService
{
    /** @var string[] */
    private $ids;

    public function extract(Item $qtiItem): array
    {
        $this->ids = [];

        $this->incrementIds($this->getItemBody($qtiItem));

        return array_unique($this->ids);
    }

    private function getItemBody(Item $qtiItem): array
    {
        return json_decode(json_encode($qtiItem->toArray()['body']), true);
    }

    private function incrementIds($haystack): void
    {
        foreach ($haystack as $key => $value) {
            if (!is_array($value)) {
                continue;
            }

            if ('elements' !== $key) {
                $this->incrementIds($value);

                continue;
            }

            foreach ($value as $element) {
                $this->incrementIdByElement((array)$element);
            }
        }
    }

    private function incrementIdByElement(array $element): void
    {
        if ($this->hasIncludedElement($element)) {
            $this->ids[] = $this->formatElementId($element['attributes']['href']);
        }

        $this->incrementIds($element);
    }

    private function hasIncludedElement(array $element): bool
    {
        return ($element['qtiClass'] ?? '') === 'include' && !empty($element['attributes']['href']);
    }

    private function formatElementId(string $id): string
    {
        return tao_helpers_Uri::decode(substr($id, strpos($id, 'http')));
    }
}
