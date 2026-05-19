<?php

use oat\generis\model\OntologyRdfs;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemLabelMetadataGuardian;

return new ItemLabelMetadataGuardian([
    ItemLabelMetadataGuardian::OPTION_EXPECTED_PATHS => [
        [OntologyRdfs::RDFS_LABEL],
        [
            'http://ltsc.ieee.org/xsd/LOM#lom',
            OntologyRdfs::RDFS_LABEL,
        ],
    ],
    ItemLabelMetadataGuardian::OPTION_PROPERTY_URI => OntologyRdfs::RDFS_LABEL,
]);
