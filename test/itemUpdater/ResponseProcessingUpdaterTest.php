<?php

/**
 * @author Christophe Noël
 */
namespace oat\taoQtiItem\test\itemUpdater;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\scripts\itemUpdater\ResponseProcessingUpdater;

use \FilesystemIterator;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;


// launch with :
// phpunit taoQtiItem/test --filter ResponseProcessingUpdaterTest

class ResponseProcessingUpdaterTest extends TaoPhpUnitTestRunner
{
    const DIR_CORRECT_TESTS = __DIR__ . "/data/correct";

    const DIR_BROKEN_TESTS = __DIR__ . "/data/broken";
    const DIR_FIXED_TESTS = self::DIR_BROKEN_TESTS . "/fixed";

    protected function setUp() {
    }

    private function getFilesFrom($directory) {
        // todo review iterator options
        $directoryItr = new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS);
        return new RecursiveIteratorIterator($directoryItr);
    }

    private function getQtiItemFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->load($pathname);

        $parser = new ParserFactory($xml);
        return $parser->load();
    }

    public function testDetectsValidItems() {
        foreach ($this->getFilesFrom(self::DIR_CORRECT_TESTS) as $file) {
            $qtiItem = $this->getQtiItemFrom($file->getPathname());

            $responseProcessingUpdater = new ResponseProcessingUpdater($qtiItem);

            $this->assertFalse(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as broken : " . $file->getFilename());
        }
    }

    public function testDetectsBrokenItems() {
        foreach ($this->getFilesFrom(self::DIR_BROKEN_TESTS) as $file) {
            $qtiItem = $this->getQtiItemFrom($file->getPathname());

            $responseProcessingUpdater = new ResponseProcessingUpdater($qtiItem);

            $this->assertTrue(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as valid : " . $file->getFilename());
        }
    }

//    public function testCorrectsBrokenItems() {
//        foreach ($this->getFilesFrom(self::DIR_BROKEN_TESTS) as $file) {
//            $qtiItem = $this->getQtiItemFrom($file->getPathname());
//
//            $responseProcessingUpdater = new ResponseProcessingUpdater($qtiItem);
//
//            $expectedXml = file_get_contents(self::DIR_FIXED_TESTS . '/' . $file->getFilename());
//
//            $this->assertEquals(
//                $expectedXml,
//                $responseProcessingUpdater->getFixedXml();
//            );
//        }
//    }
}