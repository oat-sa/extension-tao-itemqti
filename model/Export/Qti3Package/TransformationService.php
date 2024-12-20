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

namespace oat\taoQtiItem\model\Export\Qti3Package;

use DOMDocument;
use DOMElement;

class TransformationService
{
    private Qti3XsdValidator $validator;

    public function __construct(Qti3XsdValidator $validator)
    {
        $this->validator = $validator;
    }

    public function transformChildren(DOMElement $oldElement, DOMElement $newParent, DOMDocument $newDom): void
    {
        foreach ($oldElement->childNodes as $child) {
            if ($child instanceof DOMElement) {
                $newName = $this->createQtiElementName($child->nodeName);

                if (!$this->validator->isQtiElementName($newName)) {
                    $newName = $child->nodeName;
                }

                $newElement = $newDom->createElement($newName);

                $this->transformAttributes($child, $newElement);

                if ($child->childNodes->length === 1 && $child->firstChild->nodeType === XML_TEXT_NODE) {
                    $newElement->textContent = $child->textContent;
                } else {
                    $this->transformChildren($child, $newElement, $newDom);
                }

                $newParent->appendChild($newElement);
            } elseif ($child->nodeType === XML_TEXT_NODE && trim($child->nodeValue) !== '') {
                $newParent->appendChild($newDom->createTextNode($child->nodeValue));
            }
        }
    }

    public function transformAttributes(DOMElement $sourceElement, DOMElement $targetElement): void
    {
        if (!$sourceElement->hasAttributes()) {
            return;
        }

        foreach ($sourceElement->attributes as $attribute) {
            if (
                !str_starts_with($attribute->nodeName, 'xmlns')
                && $attribute->nodeName !== 'xsi:schemaLocation'
            ) {
                $attrName = $this->camelToHyphen($attribute->nodeName);
                if (!empty($attrName)) {
                    $targetElement->setAttribute($attrName, $attribute->value);
                }
            }
        }
    }

    public function createQtiElementName(string $nodeName): string
    {
        return sprintf('qti-%s', $this->camelToHyphen($nodeName));
    }

    private function camelToHyphen(string $string): string
    {
        $string = preg_replace('/([a-z])([A-Z])/', '$1-$2', $string);
        $string = str_replace('_', '-', $string);
        $string = strtolower($string);
        return ltrim($string, '-');
    }
}
