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
use oat\taoQtiItem\model\qti\metadata\LomMetadata;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class GenericLomManifestClassificationExtractor extends ImsManifestMetadataExtractor
{
    /**
     * @see ImsManifestDataExtractor::extract()
     *
     * @param mixed $manifest
     * @return array
     */
    public function extract($manifest)
    {
        $values = parent::extract($manifest);
        $newValues = [];

        foreach ($values as $resourceIdentifier => $metadataValueCollection) {

            /** @var ImsManifestMetadataValue $metadataValue */
            foreach ($metadataValueCollection as $key => $metadataValue) {
                // If metadata is not a source or is empty then skip
                if (
                    $metadataValue->getValue() === ''
                    || $metadataValue->getPath() !== ClassificationSourceMetadataValue::getSourcePath()
                ) {
                    continue;
                }

                // If next metadata does not exist then skip
                if (! isset($metadataValueCollection[$key + 1])) {
                    continue;
                }

                /** @var MetadataValue $entryMetadata */
                $entryMetadata = $metadataValueCollection[$key + 1];

                // Handle metadata if it is an entry and is not empty
                if (
                    $entryMetadata->getPath() === ClassificationEntryMetadataValue::getEntryPath()
                    && $entryMetadata->getValue() !== ''
                ) {
                    $newValues[$resourceIdentifier][] = new SimpleMetadataValue(
                        $resourceIdentifier,
                        [LomMetadata::LOM_NAMESPACE . '#lom', $metadataValue->getValue()],
                        $entryMetadata->getValue()
                    );
                }
            }
        }

        return $newValues;
    }
}
