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

    private const ELEMENT_MAPPINGS = [
        'assessmentItem' => 'qti-assessment-item',
        'responseDeclaration' => 'qti-response-declaration',
        'outcomeDeclaration' => 'qti-outcome-declaration',
        'responseProcessing' => 'qti-response-processing',
        'itemBody' => 'qti-item-body',
        'defaultValue' => 'qti-default-value',
        'value' => 'qti-value',
        'choiceInteraction' => 'qti-choice-interaction',
        'simpleChoice' => 'qti-simple-choice',
    ];
    private const QTI_ELEMENT_PREFIXES = [
        'response',
        'outcome',
        'item',
        'choice',
        'simple',
        'default',
        'value'
    ];
    private const ATTRIBUTES_MAPPINGS = [
        'responseIdentifier' => 'response-identifier',
        'baseType' => 'base-type',
        'timeDependent' => 'time-dependent',
        'maxChoices' => 'max-choices',
        'minChoices' => 'min-choices',
        'navigationMode' => 'navigation-mode',
        'submissionMode' => 'submission-mode',
        'maxAttempts' => 'max-attempts',
        'showFeedback' => 'show-feedback',
        'allowReview' => 'allow-review',
        'showSolution' => 'show-solution',
        'allowComment' => 'allow-comment',
        'allowSkipping' => 'allow-skipping',
        'validateResponses' => 'validate-responses'
    ];
    private const QTI_ELEMENT_SUFFIXES = [
        'Response',
        'Interaction',
        'Choice',
        'Declaration',
        'Processing',
        'Value'
    ];

    public function transformAttributes(DOMElement $sourceElement, DOMElement $targetElement): void
    {
        if (!$sourceElement->hasAttributes()) {
            return;
        }

        foreach ($sourceElement->attributes as $attribute) {
            if (!str_starts_with($attribute->nodeName, 'xmlns') &&
                $attribute->nodeName !== 'xsi:schemaLocation') {

                $attrName = self::ATTRIBUTES_MAPPINGS[$attribute->nodeName] ?? $this->camelToHyphen($attribute->nodeName);

                if (!empty($attrName)) {
                    $targetElement->setAttribute($attrName, $attribute->value);
                }
            }
        }
    }

    public function transformChildren(DOMElement $oldElement, DOMElement $newParent, DOMDocument $newDom): void
    {
        foreach ($oldElement->childNodes as $child) {
            if ($child instanceof DOMElement) {
                $newName = self::ELEMENT_MAPPINGS[$child->nodeName] ?? ($this->isQtiElement($child->nodeName)
                    ? 'qti-' . $this->camelToHyphen($child->nodeName)
                    : $child->nodeName);

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


    public function getElementName(?DOMElement $oldRoot): string
    {
        return self::ELEMENT_MAPPINGS[$oldRoot->nodeName] ?? 'qti-' . $this->camelToHyphen($oldRoot->nodeName);
    }

    public function cleanNamespaces(string $content): string
    {
        $content = preg_replace('/xmlns[^=]*="[^"]*"/i', '', $content);
        $content = preg_replace('/<[a-z0-9]+:([^>]+)>/i', '<$1>', $content);
        return (string)preg_replace('/<\/[a-z0-9]+:([^>]+)>/i', '</$1>', $content);
    }

    private function isQtiElement(string $nodeName): bool
    {
        foreach (self::QTI_ELEMENT_PREFIXES as $prefix) {
            if (str_starts_with($nodeName, $prefix)) {
                return true;
            }
        }

        foreach (self::QTI_ELEMENT_SUFFIXES as $suffix) {
            if (str_ends_with($nodeName, $suffix)) {
                return true;
            }
        }

        return false;
    }

    private function camelToHyphen(string $string): string
    {
        $string = preg_replace('/([a-z])([A-Z])/', '$1-$2', $string);
        $string = str_replace('_', '-', $string);
        $string = strtolower($string);
        return ltrim($string, '-');
    }
}
