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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Qti3Package;

use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMText;

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

                if ($this->validator->isMathElementName($child->nodeName)) {
                    $newName = substr($newName, 2);  
                }

                $newElement = $newDom->createElement($newName);

                $this->transformAttributes($child, $newElement);

                if ($newName === 'math') {
                    $newElement->setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
                }

                if ($child->childNodes->length === 1 && $child->firstChild->nodeType === XML_TEXT_NODE) {
                    $newElement->textContent = $child->textContent;
                } else {
                    $this->transformChildren($child, $newElement, $newDom);
                }

                $newParent->appendChild($newElement);
            } elseif ($child->nodeType === XML_TEXT_NODE && trim($child->nodeValue) !== '') {
                $newParent->appendChild($newDom->createTextNode($child->nodeValue));
            } elseif ($child->nodeType === XML_CDATA_SECTION_NODE) {
                $newParent->appendChild($newDom->createCDATASection($child->nodeValue));
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
                    if ($sourceElement->nodeName === 'extendedTextInteraction') {
                        $this->addClassFromAttribute($attribute, 'expectedLines', 'qti-height-lines-');
                        if ($attribute->nodeName === 'expectedLines') {
                            continue;
                        }
                    } elseif ($sourceElement->nodeName === 'textEntryInteraction') {
                        $this->addClassFromAttribute($attribute, 'expectedLength', 'qti-input-width-');
                        if ($attribute->nodeName === 'expectedLength') {
                            continue;
                        }
                    } elseif ($sourceElement->nodeName === 'choiceInteraction' && $attribute->nodeName === 'class') {
                        if (strpos($attribute->value, 'list-style-') === 0) {
                            $listStyleValue = str_replace('list-style-', '', $attribute->value);
                            $finalClass = '';

                            if (preg_match('/^(.*)-(parenthesis|period)$/', $listStyleValue, $matches)) {
                                $baseStyle = $matches[1];
                                $suffixStyle = $matches[2];

                                $finalClass = 'qti-labels-' . $baseStyle . ' ' . 'qti-labels-suffix-' . $suffixStyle;
                            } else {
                                $finalClass = 'qti-labels-' . $listStyleValue;
                            }

                            $targetElement->setAttribute($attrName, $finalClass);
                            continue;
                        }
                    }

                    $targetElement->setAttribute($attrName, $attribute->value);
                }
            }
        }
    }

    public function createQtiElementName(string $nodeName): string
    {
        return sprintf('qti-%s', $this->camelToHyphen($nodeName));
    }

    private function addClassFromAttribute(DOMAttr $node, string $expectedName, string $classPrefix): void
    {
        if ($node->nodeName !== $expectedName) {
            return;
        }

        $parent = $node->parentNode;
        $classAttr = $parent->attributes->getNamedItem('class');
        $classValue = $classPrefix . $node->nodeValue;

        if ($classAttr === null) {
            $parent->setAttribute('class', $classValue);
        } else {
            $classAttr->nodeValue .= ' ' . $classValue;
        }
    }

    private function camelToHyphen(string $string): string
    {
        $string = preg_replace('/([a-z])([A-Z])/', '$1-$2', $string);
        $string = str_replace('_', '-', $string);
        $string = strtolower($string);
        return ltrim($string, '-');
    }
}
