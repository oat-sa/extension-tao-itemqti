<?php

namespace oat\taoQtiItem\model\qti\metadata\extractor;

use oat\taoQtiItem\model\qti\metadata\MetadataExtractor;

interface LomMetadataExtractor extends MetadataExtractor
{
    public function getPath();
}