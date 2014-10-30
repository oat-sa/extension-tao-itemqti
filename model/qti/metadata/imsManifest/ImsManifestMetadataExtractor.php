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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest;

use \DOMDocument;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractor;

/**
 * A MetadataExtractor implementation
 * This implementation simply iterate through nodes and create an array of MetadataSimpleInstance object
 *
 * @author Antoine Robin <antoine.robin@vesperiagroup.com>
 */
class ImsManifestMetadataExtractor implements MetadataExtractor 
{

    private $base;
    private $identifier;
    private $type;
    private $href;

    /**
     * @see MetadataExtractor::extract()
     */
    public function extract($manifest)
    {
        if ($manifest instanceof DOMDocument) {
            $values = $this->getRecursiveMetadata($manifest);
            $finalValues = array();
            
            // @todo do it better!
            foreach ($values as $v) {
                $identifier = $v->getResourceIdentifier();
                if (!isset($identifier)) {
                    $finalValues[$identifier] = array();
                }
                $finalValues[$identifier][] = $v;
            }
            
            return $finalValues;
        } else {
            throw new MetadataExtractionException(__('The parameter must be an instance of DOMDocument'));
        }
    }

    /**
     * Find all metadata recursively from an xml document
     * 
     * @param DOMDocument $manifest
     * @param array $currentPath
     * @return \oat\taoQtiItem\model\metadata\simple\MetadataSimpleInstance array
     * @throws \oat\taoQtiItem\model\metadata\MetadataExtractionException
     */
    private function getRecursiveMetadata($manifest, $currentPath = array())
    {
        $metadata = array();
        $i = 0;
        /** @var $node \DOMElement */
        foreach ($manifest->childNodes as $node) {

            // get the base for paths
            if ($node->nodeName === 'manifest') {
                $pattern = '/xmlns:((?!xsi)\w+)=/';
                if (preg_match_all($pattern, $node->C14N(), $matches)) {
                    foreach ($matches[1] as $namespace) {
                        $this->base[$namespace] = $node->getAttribute('xmlns:'.$namespace);
                    }
                }
            }

            // get the resource related values
            if ($node->nodeName === 'resource') {
                $this->identifier = $node->getAttribute('identifier');
                $this->type = $node->getAttribute('type');
                $this->href = $node->getAttribute('href');
            }

            // get the current path
            $pattern = "/^(.+):(.+)/";
            $matches = array();
            $path = '';
            if (preg_match($pattern, $node->nodeName, $matches) && isset($this->base[$matches[1]])) {
                $path = $this->base[$matches[1]] . '#' . $matches[2];
            }

            // if we already write a path in this loop we have to pop the last element of currentPath
            if ($path !== '') {
                if ($i > 0) {
                    array_pop($currentPath);
                }
                $currentPath[] = $path;
                $i++;

            }

            // while not on a leaf node continue deeply
            if ($node->hasChildNodes() && $node->childNodes->length > 1) {
                $metadata = array_merge($metadata,$this->getRecursiveMetadata($node, $currentPath));
            } else {
                // create an instance if we are in metadata value (leaf node)
                $pattern = "/^(.+):(.+)/";
                $matches = array();
                if (preg_match($pattern, $node->nodeName, $matches) && isset($this->base[$matches[1]])) {
                    $metadataInstance = new ImsManifestMetadataValue();
                    $metadataInstance->setPath($currentPath);
                    $metadataInstance->setResourceIdentifier($this->identifier);
                    $metadataInstance->setResourceType($this->type);
                    $metadataInstance->setResourceHref($this->href);
                    $metadataInstance->setValue($node->nodeValue);

                    // it is the language info
                    if ($matches[2] === 'langstring') {
                        $metadataInstance->setLanguage($node->getAttribute('xml:lang'));
                    }
                    
                    $metadata[] = $metadataInstance;
                }
            }
        }

        return $metadata;
    }
}