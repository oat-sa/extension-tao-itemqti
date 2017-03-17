<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 16/03/17
 * Time: 17:44
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest;


use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class LomIdentifierExtractor extends ImsManifestMetadataExtractor
{
    public function extract($manifest)
    {
        $values = parent::extract($manifest);
        $newValues = array();

        $expectedPath = array(
            'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
            'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
            'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
        );

        foreach ($values as $resourceIdentifier => $metadataValueCollection) {
            $classificationMetadataValue = null;

            /** @var SimpleMetadataValue $metadataValue */
            foreach ($metadataValueCollection as $metadataValue) {
                $path = $metadataValue->getPath();

                if ($path === $expectedPath) {
                    $newValues[$resourceIdentifier][] = $metadataValue;
                    \common_Logger::i(print_r($metadataValue, true));
                }
            }
        }

        return $newValues;
    }
}