<?php

use oat\taoQtiItem\model\qti\metadata\guardians\ItemMetadataGuardian;

return new ItemMetadataGuardian([
    ItemMetadataGuardian::OPTION_EXPECTED_PATH => [
        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
    ],
    ItemMetadataGuardian::OPTION_PROPERTY_URI => 'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
]);
