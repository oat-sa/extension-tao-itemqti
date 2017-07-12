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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata;

use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataExtractor;
use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class ImsManifestClassificationMetadataExtractor extends ImsManifestMetadataExtractor
{
    /**
     * @var array Map of property-uri => map-value to extract from classification metadata
     */
    protected $classification = [];

    /**
     * Set the association between property uri and value to find into classification metadata source
     *
     * @param $propertyUri
     * @param $classificationValue
     * @throws MetadataExtractionException
     */
    public function setClassificationMapping($propertyUri, $classificationValue)
    {
        if (empty($propertyUri) || ! is_string($propertyUri)) {
            throw new MetadataExtractionException(__('PropertyUri to map has to a valid uri'));
        }
        if (empty($classificationValue) || ! is_string($classificationValue)) {
            throw new MetadataExtractionException(__('Classification value to map has to a string'));
        }
        $this->classification[$propertyUri] = $classificationValue;
    }

    /**
     * @see ImsManifestDataExtractor::extract()
     */
    public function extract($manifest)
    {
        $values = parent::extract($manifest);
        $newValues = array();

        foreach ($values as $resourceIdentifier => $metadataValueCollection) {
            $i = 0;
            $classificationMetadataValue = null;

            /** @var ImsManifestMetadataValue $metadataValue */
            foreach ($metadataValueCollection as $metadataValue) {

                foreach ($this->getClassificationMetadata() as $property => $sourceValue) {

                    if ($metadataValue->getValue() === ''
                        || $metadataValue->getValue() != $sourceValue
                        || $metadataValue->getPath() !== $this->getSourcePath()
                    ) {
                        continue;
                    }

                    // LOM Classification case.
                    if (isset($metadataValueCollection[$i + 1])) {
                        /** @var MetadataValue $metadata */
                        $metadata = $metadataValueCollection[$i + 1];

                        if ($metadata->getPath() === $this->getEntryPath()) {
                            if ($metadata->getValue() !== '') {
                                $newValues[$resourceIdentifier][] = new SimpleMetadataValue(
                                    $resourceIdentifier,
                                    array('http://ltsc.ieee.org/xsd/LOM#lom', $property),
                                    $metadata->getValue()
                                );
                            }
                        }
                    }

                }

                $i++;
            }
        }

        return $newValues;
    }

    /**
     * Get an array to map classification metadata to extract
     *
     * @return array
     * @throws MetadataExtractionException
     */
    protected function getClassificationMetadata()
    {
        if (empty($this->classification)) {
            throw new MetadataExtractionException(__('Classification metadata is required to be extracted.'));
        }
        return $this->classification;
    }

    /**
     * Get default source path into DomDocument
     *
     * @return array
     */
    protected function getSourcePath()
    {
        return [
            'http://ltsc.ieee.org/xsd/LOM#lom',
            'http://ltsc.ieee.org/xsd/LOM#classification',
            'http://ltsc.ieee.org/xsd/LOM#taxonPath',
            'http://ltsc.ieee.org/xsd/LOM#source',
            'http://ltsc.ieee.org/xsd/LOM#string'
        ];
    }

    /**
     * Get default entry path into DomDocument
     *
     * @return array
     */
    protected function getEntryPath()
    {
        return [
            'http://ltsc.ieee.org/xsd/LOM#lom',
            'http://ltsc.ieee.org/xsd/LOM#classification',
            'http://ltsc.ieee.org/xsd/LOM#taxonPath',
            'http://ltsc.ieee.org/xsd/LOM#taxon',
            'http://ltsc.ieee.org/xsd/LOM#entry',
            'http://ltsc.ieee.org/xsd/LOM#string'
        ];
    }

}





