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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Qti3Package;

use oat\taoQtiItem\model\ValidationService;
use RuntimeException;
use SimpleXMLElement;

class Qti3XsdValidator
{
    private const QTI3_NAMESPACE = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';

    private ?array $qtiElementNames = null;
    private ValidationService $validationService;

    public function __construct(ValidationService $validationService = null)
    {
        $this->validationService = $validationService ?? new ValidationService();
    }

    public function isQtiElementName(string $elementName): bool
    {
        if ($this->qtiElementNames === null) {
            $this->qtiElementNames = $this->loadQtiElementNames();
        }

        return in_array($elementName, $this->qtiElementNames, true);
    }

    public function loadQtiElementNames(): array
    {
        $schemaFiles = $this->validationService->getContentValidationSchema(self::QTI3_NAMESPACE);

        if (empty($schemaFiles)) {
            throw new RuntimeException('QTI3 XSD schema files not found');
        }

        $mainSchema = $schemaFiles[0]; // Use the first schema file

        if (!file_exists($mainSchema)) {
            throw new RuntimeException(
                sprintf(
                    'QTI3 XSD schema file not found at path: %s',
                    $mainSchema
                )
            );
        }

        $xml = new SimpleXMLElement(file_get_contents($mainSchema));
        $xml->registerXPathNamespace('xs', 'http://www.w3.org/2001/XMLSchema');

        $elements = $xml->xpath('//xs:element[@name]');

        $qtiElementNames = [];
        foreach ($elements as $element) {
            $name = (string)$element['name'];
            if (str_starts_with($name, 'qti-')) {
                $qtiElementNames[] = $name;
            }
        }

        return $qtiElementNames;
    }
}
