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

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\parser;

use Exception;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\media\MediaService;
use oat\tao\model\media\TaoMediaResolver;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use tao_helpers_Uri;

class ElementIdsExtractor extends ConfigurableService
{
    private const MEDIA_MANAGER_SCHEMA = MediaService::SCHEME_NAME . '://mediamanager';

    /** @var string[] */
    private $ids;

    /** @var TaoMediaResolver */
    private $mediaResolver;

    /** @var TaoMediaResolver */
    private $onlyMediaManager;

    /**
     * @throws Exception
     */
    public function extract(Item $qtiItem, string $elementClass, string $attributeName): array
    {
        $this->ids = [];

        foreach ($qtiItem->getComposingElements($elementClass) as $element) {
            $rawId = $element->attr($attributeName);

            if ($this->onlyMediaManager && !$this->isMediaManagerMedia($rawId)) {
                continue;
            }

            $id = $this->getMediaResolver()
                ->resolve($rawId)
                ->getMediaIdentifier();

            $this->ids[] = tao_helpers_Uri::decode($id);
        }

        return array_unique($this->ids);
    }

    public function withOnlyMediaManager(): self
    {
        $this->onlyMediaManager = true;

        return $this;
    }

    public function withMediaResolver(TaoMediaResolver $mediaResolver): self
    {
        $this->mediaResolver = $mediaResolver;

        return $this;
    }

    private function getMediaResolver(): TaoMediaResolver
    {
        if (!$this->mediaResolver) {
            $this->mediaResolver = new ItemMediaResolver(null, '');
        }

        return $this->mediaResolver;
    }

    private function isMediaManagerMedia(string $id)
    {
        return strpos($id, self::MEDIA_MANAGER_SCHEMA) !== false;
    }
}
