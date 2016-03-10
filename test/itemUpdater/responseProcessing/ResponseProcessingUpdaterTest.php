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
    private $dirCorrectTests;
    private $dirBrokenTests;
    private $dirFixedTests;
    private $dirTemp;
    
    protected function setUp() {
        $this->dirCorrectTests    =  __DIR__ . "/data/correct";
        $this->dirBrokenTests     =  __DIR__ . "/data/broken";
        $this->dirFixedTests      =  __DIR__ . "/data/fixed";
        $this->dirTemp            =  __DIR__ . "/data/temp";
        
        // create or clean temp directory
        if (!is_dir($this->dirTemp)) {
            mkdir($this->dirTemp);
        } else {
            foreach ($this->getFilesFrom($this->dirTemp) as $file) {
                unlink($file->getPathname());
            }
        }
    }

    private function getFilesFrom($directory) {
        $directoryItr = new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS);
        return new RecursiveIteratorIterator($directoryItr);
    }

    private function getXmlStringFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->formatOutput = true;
        $xml->preserveWhiteSpace = false;
        $xml->load($pathname);
        return $xml->saveXml();
    }

    private function getQtiItemFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->load($pathname);

        $parser = new ParserFactory($xml);
        return $parser->load();
    }

    public function testDetectsValidItems() {
        foreach ($this->getFilesFrom($this->dirCorrectTests) as $file) {
            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $this->assertFalse(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as broken : " . $file->getFilename());
        }
    }

    public function testDetectsBrokenItems() {
        foreach ($this->getFilesFrom($this->dirBrokenTests) as $file) {
            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $this->assertTrue(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as valid : " . $file->getFilename());
        }
    }


    public function testCorrectsBrokenItems() {
        foreach ($this->getFilesFrom($this->dirBrokenTests) as $file) {
            $expectedPathname = $this->dirFixedTests . '/' . $file->getFilename();

            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            $actualPathname = $this->dirTemp . '/' . $file->getFilename();
            file_put_contents(
                $actualPathname,
                $responseProcessingUpdater->getFixedXml()
            );

            $this->assertEquals(
                $this->getComparableResponseProcessingFrom($expectedPathname),
                $this->getComparableResponseProcessingFrom($actualPathname)
            );

            $this->assertEquals(
                $this->getXmlStringFrom($expectedPathname),
                $this->getXmlStringFrom($actualPathname));
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
