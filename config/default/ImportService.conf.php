<?php

/**
 * Default config header created during install
 */

use oat\taoQtiItem\model\qti\ImportService;

return new ImportService([
    ImportService::CONFIG_VALIDATE_RESPONSE_PROCESSING => false,
    ImportService::OPTION_IMPORT_LOCK_TTL => 60,
]);
