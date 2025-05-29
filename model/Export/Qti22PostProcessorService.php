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

namespace oat\taoQtiItem\model\Export;

use DOMDocument;
use DOMNodeList;
use DOMXPath;

class Qti22PostProcessorService
{
       /**
     * @var array<string, string[]>  XPath expression => list of attributes to remove
     */
    protected array $removalRules = [
        '//*[local-name()="img"][@type]'                         => ['type'],
        '//*[local-name()="gapText"][@fixed]'                    => ['fixed'],
        '//*[local-name()="gap"][@fixed]'                        => ['fixed'],
        '//*[local-name()="gapImg"][@fixed]'                     => ['fixed'],
        '//*[local-name()="associableHotspot"][@fixed]'          => ['fixed'],
        '//qh5:figure[@showFigure]'                                => ['showFigure'],
    ];

    /**
     * @var array<string,string>  namespace URI => schemaLocation URL
     */
    protected array $schemaLocationMapping = [
        'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0'
            => 'https://purl.imsglobal.org/spec/qti/v2p2/schema/xsd/imsqtiv2p2p4_html5_v1p0.xsd',
        'http://www.w3.org/1998/Math/MathML'
            => 'http://www.w3.org/Math/XMLSchema/mathml2/mathml2.xsd',
    ];

    /**
     * Post-processes a QTI item XML string and returns the cleaned XML along with configs.
     */
    public function itemContentPostProcessing(string $content): string
    {
        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput       = true;
        $dom->loadXML($content);

        $xpath = new DOMXPath($dom);
        $this->registerAllNamespaces($dom, $xpath);

        // Apply removal rules
        foreach ($this->removalRules as $expr => $attrs) {
            $nodes = $xpath->query($expr);
            if ($nodes instanceof DOMNodeList) {
                foreach ($nodes as $node) {
                    foreach ($attrs as $attr) {
                        if ($node->hasAttribute($attr)) {
                            $node->removeAttribute($attr);
                        }
                    }
                }
            }
        }

        // Update xsi:schemaLocation entries
        $this->updateSchemaLocation($dom);

        return $dom->saveXML();
    }

    /**
     * Registers all xmlns:* (including default) from root into XPath
     */
    protected function registerAllNamespaces(DOMDocument $dom, DOMXPath $xpath): void
    {
        $root = $dom->documentElement;
        foreach ($root->attributes as $attr) {
            if (strpos($attr->nodeName, 'xmlns') === 0) {
                $prefix = ($attr->prefix === 'xmlns') ? $attr->localName : '';
                $xpath->registerNamespace($prefix, $attr->nodeValue);
            }
        }
        $xpath->registerNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    }

    /**
     * Merges existing xsi:schemaLocation with configured mappings
     */
    protected function updateSchemaLocation(DOMDocument $dom): void
    {
        $root     = $dom->documentElement;
        $existing = $root->getAttributeNS(
            'http://www.w3.org/2001/XMLSchema-instance',
            'schemaLocation'
        );
        $parts = preg_split('/\s+/', trim($existing)) ?: [];
        $map = [];
        for ($i = 0; $i + 1 < count($parts); $i += 2) {
            $map[$parts[$i]] = $parts[$i + 1];
        }
        // Merge with mappings
        foreach ($this->schemaLocationMapping as $ns => $xsd) {
            $map[$ns] = $xsd;
        }

        $schemaList = '';
        foreach ($map as $nsUri => $xsdUri) {
            $schemaList .= $nsUri . ' ' . $xsdUri . ' ';
        }
        $root->setAttributeNS(
            'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation',
            trim($schemaList)
        );
    }
}
