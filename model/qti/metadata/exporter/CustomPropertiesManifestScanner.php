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

namespace oat\taoQtiItem\model\qti\metadata\exporter;

use DOMDocument;
use DOMNodeList;
use DOMXPath;

class CustomPropertiesManifestScanner
{
    public function getCustomPropertyByUri(DOMDocument $manifest, string $scaleUri): DOMNodeList
    {
        $xpath = new DOMXPath($manifest);
        // Register namespaces
        $xpath->registerNamespace('default', 'http://www.imsglobal.org/xsd/imscp_v1p1');
        $xpath->registerNamespace('imsmd', 'http://ltsc.ieee.org/xsd/LOM');

        $query = '//*[local-name()="customProperties"]/*[local-name()="property"][*[local-name()="uri"]="'
            . $scaleUri
            . '"]';

        return $xpath->query($query);
    }

    public function getCustomProperties(DOMDocument $manifest): DOMNodeList
    {
        $xpath = new DOMXPath($manifest);
        $this->registerAllNamespaces($xpath, $manifest);
        $query = '//*//*[local-name()="customProperties"]';
        return $xpath->query($query);
    }

    private function registerAllNamespaces(DOMXPath $xpath, DOMDocument $manifest)
    {
        $rootElement = $manifest->documentElement;
        if (!$rootElement) {
            return;
        }

        // Register default namespace
        $defaultNamespace = $rootElement->lookupNamespaceUri(null);
        if ($defaultNamespace) {
            $xpath->registerNamespace('default', $defaultNamespace);
        }

        // Register all namespaces
        if ($rootElement->hasAttributes()) {
            foreach ($rootElement->attributes as $attribute) {
                if (strpos($attribute->nodeName, 'xmlns:') === 0) {
                    $prefix = substr($attribute->nodeName, 6);
                    $xpath->registerNamespace($prefix, $attribute->nodeValue);
                }
            }
        }
    }
}
