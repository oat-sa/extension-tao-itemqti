<?php

/**
 * @author Christophe Noël
 */
namespace oat\taoQtiItem\test\itemUpdater;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\scripts\itemUpdater\ResponseProcessingUpdater;

// launch with
// phpunit taoQtiItem/test --filter ResponseProcessingUpdaterTest

class ResponseProcessingUpdaterTest extends TaoPhpUnitTestRunner
{
    public function test() {
        $responseProcessingUpdater = new ResponseProcessingUpdater();
        $this->assertTrue($responseProcessingUpdater->updateItem(), "true should be true !!!!");
    }
}