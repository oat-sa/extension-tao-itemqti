<?php
/**
 * Default config header created during install
 */

use oat\taoQtiItem\model\search\Filter\HasValueFilter;
use oat\taoQtiItem\model\search\Filter\NotBase64ContentFilter;
use oat\taoQtiItem\model\search\Filter\NotJsonFilter;
use oat\taoQtiItem\model\search\QtiItemContentTokenizer;

return new oat\taoQtiItem\model\search\QtiItemContentTokenizer(
    [
        QtiItemContentTokenizer::OPTION_FILTERS => [
            new NotJsonFilter(),
            new HasValueFilter(),
            new NotBase64ContentFilter(),
        ]
    ]
);
