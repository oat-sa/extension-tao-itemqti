<?php

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\taoQtiItem\model\qti\metadata\extractors\ontology\LiteralPropertyExtractor;

class LomExtractor extends OntologyMetadataExtractor
{
    public function __construct()
    {
        $this->addRule(new LiteralPropertyExtractor(array(
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
            ),
            RDFS_LABEL
        ));

    }
}