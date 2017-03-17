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

        \common_Logger::i(print_r($values, true));

        foreach ($values as $resourceIdentifier => $metadataValueCollection) {
            $i = 0;
            $classificationMetadataValue = null;
            $classificationArray = array();

            /** @var SimpleMetadataValue $metadataValue */
            foreach ($metadataValueCollection as $metadataValue) {
                $path = $metadataValue->getPath();

                if ($path === $expectedPath) {
                    $newValues[$resourceIdentifier][] = $metadataValue;
                    \common_Logger::i(print_r($metadataValue, true));

//                    // LOM Classification case.
//                    if (isset($metadataValueCollection[$i + 1])) {
//
//                        $entryPath = $metadataValueCollection[$i + 1]->getPath();
//
//                        if ($entryPath === $expectedEntryPath) {
//
//                            $actualKey = $metadataValue->getValue();
//                            $actualValue = $metadataValueCollection[$i + 1]->getValue();
//
//                            if ($actualValue !== '' && $actualKey !== '') {
//                                // Generate classification value if necessary...
//                                $classificationMetadataValue = (empty($classificationMetadataValue)) ? self::cloneMetadataValue($metadataValue) : $classificationMetadataValue;
//
//                                $actualValue = trim(str_replace(array('#', '|'), '', $actualValue));
//                                $actualKey = trim(str_replace(array('#', '|'), '', $actualKey));
//
//                                $classificationArray[$actualKey] = $actualValue;
//                            }
//                        }
//                    }
                }
//                else if ($path !== $expectedEntryPath) {
//                    if (!isset($newValues[$resourceIdentifier])) {
//                        $newValues[$resourceIdentifier] = array();
//                    }
//                    $newValues[$resourceIdentifier][] = $metadataValue;
//                }
//
//                $i++;
            }

            return $newValues;
        }
    }
}