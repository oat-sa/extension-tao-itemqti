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

namespace oat\taoQtiItem\model\qti\metaMetadata;


use oat\oatbox\service\ConfigurableService;

class Importer extends ConfigurableService
{
    public function extract($manifest): array
    {
        if ($manifest instanceof \DOMDocument === false) {
            throw new \InvalidArgumentException(
                __('Metadata import requires an instance of DomManifest to extract metadata')
            );
        }

        $xpath = new \DOMXPath($manifest);
        $xpath->registerNamespace('imsmd', 'http://ltsc.ieee.org/xsd/LOM');
        $xpath->registerNamespace('def', 'http://www.imsglobal.org/xsd/imscp_v1p1');

        $metaMetadata = [];

        $properties  = $xpath->query('//imsmd:metaMetadata/def:extension/def:customProperties/def:property');
        foreach ($properties as $property) {
            $uri = $xpath->evaluate('string(def:uri)', $property);
            $alias = $xpath->evaluate('string(def:alias)', $property);
            $label = $xpath->evaluate('string(def:label)', $property);
            $multiple = $xpath->evaluate('string(def:multiple)', $property);
            $checksum = $xpath->evaluate('string(def:checksum)', $property);

            if (strlen($uri) === 0 || strlen($label) === 0) {
                continue;
            }

            $metaMetadata[] = [
                'uri' => trim($uri),
                'alias' => trim($alias),
                'label' => trim($label),
                'multiple' => trim($multiple),
                'checksum' => trim($checksum),
            ];
        }

        return $metaMetadata;
    }
}
