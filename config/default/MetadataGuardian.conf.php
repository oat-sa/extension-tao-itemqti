<?php

use oat\taoQtiItem\model\qti\metadata\guardians\MetadataGuardian;

return new MetadataGuardian([
    MetadataGuardian::OPTION_EXPECTED_PATH => [
        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
    ],
    MetadataGuardian::OPTION_PROPERTY_URI => 'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
]);
