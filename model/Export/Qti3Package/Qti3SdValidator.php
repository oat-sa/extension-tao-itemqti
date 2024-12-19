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

use SimpleXMLElement;

class Qti3SdValidator
{
    private const LOCAL_XSD_PATH = __DIR__ . '/../../qti/data/qtiv3p0/imsqti_asiv3p0_v1p0.xsd';
    const SCHEMA = 'http://www.w3.org/2001/XMLSchema';

    private ?array $qtiElementNames = null;

    public function isQtiElementName(string $elementName): bool
    {
        if ($this->qtiElementNames === null) {
            $this->loadQtiElementNames();
        }

        return in_array($elementName, $this->qtiElementNames, true);
    }

    private function loadQtiElementNames(): void
    {
        $xml = new SimpleXMLElement(file_get_contents(self::LOCAL_XSD_PATH));
        $xml->registerXPathNamespace('xs', self::SCHEMA);

        $elements = $xml->xpath('//xs:element[@name]');

        $this->qtiElementNames = [];
        foreach ($elements as $element) {
            $name = (string)$element['name'];
            if (str_starts_with($name, 'qti-')) {
                $this->qtiElementNames[] = $name;
            }
        }
    }
}
