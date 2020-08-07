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
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\ElementReferences;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\QtiObject;
use oat\taoQtiItem\model\qti\XInclude;
use oat\taoQtiItem\model\qti\Img;

class ElementReferencesExtractor extends ConfigurableService
{
    /** @var string[] */
    private $elementReferences;

    public function extract(Item $qtiItem, string $elementClass, string $attributeName): array
    {
        $this->elementReferences = [];

        /** @var Element $element */
        foreach ($qtiItem->getComposingElements($elementClass) as $element) {
            $this->elementReferences[] = $element->attr($attributeName);
        }

        return array_unique($this->elementReferences);
    }

    public function extractAll(Item $qtiItem): ElementReferences
    {
        return new ElementReferences(
            $this->extract($qtiItem, XInclude::class, 'href'),
            $this->extract($qtiItem, QtiObject::class, 'data'),
            $this->extract($qtiItem, Img::class, 'src')
        );
    }
}
