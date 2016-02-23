<?php

/**
 * @author Christophe Noël
 */
namespace oat\taoQtiItem\test\itemUpdater;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\scripts\itemUpdater\ResponseProcessingUpdater;

use \FilesystemIterator;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;


// launch with :
// phpunit taoQtiItem/test --filter ResponseProcessingUpdaterTest

class ResponseProcessingUpdaterTest extends TaoPhpUnitTestRunner
{
    private $responseProcessingUpdater;

    protected function setUp() {
        $this->responseProcessingUpdater = new ResponseProcessingUpdater();
    }
    private function getFilesFrom($directory) {
        $directoryItr = new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS);
        return new RecursiveIteratorIterator($directoryItr);
    }

    public function testUpdaterDoesntChangeValidItems() {
        foreach ($this->getFilesFrom(__DIR__ . '/data/correct/') as $file) {
            $itemXml = new \SimpleXMLElement($file->getPathname(), null, true);

            $this->assertFalse(
                $this->responseProcessingUpdater->hasBrokenResponseProcessing($itemXml),
                "This file has been incorrectly flagged as broken : " . $file->getFilename());
        }
    }

    public function testUpdaterCorrectsBrokenItems() {
        foreach ($this->getFilesFrom(__DIR__ . '/data/incorrect/before/') as $file) {
            $itemXml = new \SimpleXMLElement($file->getPathname(), null, true);

            $this->assertTrue(
                $this->responseProcessingUpdater->hasBrokenResponseProcessing($itemXml),
                "This file has been incorrectly flagged as correct : " . $file->getFilename());
        }

    }
}