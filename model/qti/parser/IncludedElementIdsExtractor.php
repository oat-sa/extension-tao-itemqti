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

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\media\TaoMediaResolver;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XInclude;
use tao_helpers_Uri;

class IncludedElementIdsExtractor extends ConfigurableService
{
    /** @var string[] */
    private $ids;

    /** @var TaoMediaResolver */
    private $mediaResolver;

    public function extract(Item $qtiItem): array
    {
        $this->ids = [];

        foreach ($qtiItem->getComposingElements(XInclude::class) as $element) {
            $id = $this->getMediaResolver()
                ->resolve($element->attr('href'))
                ->getMediaIdentifier();

            $this->ids[] = tao_helpers_Uri::decode($id);
        }

        return array_unique($this->ids);
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
}
