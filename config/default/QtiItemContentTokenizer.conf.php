<?php
/**
 * Default config header created during install
 */

use oat\taoQtiItem\model\search\Tokenizer\Filter\HasValueFilter;
use oat\taoQtiItem\model\search\Tokenizer\Filter\NotBase64ContentFilter;
use oat\taoQtiItem\model\search\Tokenizer\Filter\NotJsonFilter;
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
