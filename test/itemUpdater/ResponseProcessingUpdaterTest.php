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
    const DIR_FIXTURES      = __DIR__ . "/data";
    const DIR_CORRECT_TESTS = self::DIR_FIXTURES . "/correct";
    const DIR_BROKEN_TESTS  = self::DIR_FIXTURES . "/broken";
    const DIR_FIXED_TESTS   = self::DIR_FIXTURES . "/fixed";
    const DIR_TEMP          = self::DIR_FIXTURES . "/temp";

    protected function setUp() {
        // create or clean temp directory
        if (!is_dir(self::DIR_TEMP)) {
            mkdir(self::DIR_TEMP);
        } else {
            foreach ($this->getFilesFrom(self::DIR_TEMP) as $file) {
                unlink($file->getPathname());
            }
        }
    }

    private function getFilesFrom($directory) {
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
            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $this->assertFalse(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as broken : " . $file->getFilename());
        }
    }

    public function testDetectsBrokenItems() {
        foreach ($this->getFilesFrom(self::DIR_BROKEN_TESTS) as $file) {
            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $this->assertTrue(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as valid : " . $file->getFilename());
        }
    }


    /**
     * we only test responseProcessing as other part of the XML (meaning the assessmentItem attributes) changes during
     * the process (!)
     */
    public function testCorrectsBrokenItems() {
        foreach ($this->getFilesFrom(self::DIR_BROKEN_TESTS) as $file) {
            $expectedPathname = self::DIR_FIXED_TESTS . '/' . $file->getFilename();

            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $actualPathname = self::DIR_TEMP . '/' . $file->getFilename();
            file_put_contents(
                $actualPathname,
                $responseProcessingUpdater->getFixedXml()
            );

            $this->assertEquals(
                $this->getComparableResponseProcessingFrom($expectedPathname),
                $this->getComparableResponseProcessingFrom($actualPathname)
            );
        }
    }

    private function getComparableResponseProcessingFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->formatOutput = true;
        $xml->preserveWhiteSpace = false;
        $xml->load($pathname);

        $responseProcessingList = $xml->getElementsByTagName('responseProcessing');
        $responseProcessing = $responseProcessingList->item(0);

        return $responseProcessing->ownerDocument->saveXML($responseProcessing);
    }

}