<?php

/**
 * @author Christophe Noël
 */
namespace oat\taoQtiItem\test\itemUpdater;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\scripts\itemUpdater\GhostResponseDeclarationRemover;

use \FilesystemIterator;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;


// launch with :
// phpunit taoQtiItem/test --filter GhostResponseDeclarationRemoverTest


class GhostResponseDeclarationRemoverTest extends TaoPhpUnitTestRunner
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

    public function testDetectsValidItems() {
        foreach ($this->getFilesFrom( $this->dirCorrectTests) as $file) {
            $responseProcessingUpdater = new GhostResponseDeclarationRemover($file->getPathname());

            $this->assertFalse(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as broken : " . $file->getFilename());
        }
    }

    public function testDetectsBrokenItems() {
        foreach ($this->getFilesFrom($this->dirBrokenTests) as $file) {
            $responseProcessingUpdater = new GhostResponseDeclarationRemover($file->getPathname());

            $this->assertTrue(
                $responseProcessingUpdater->isBroken(),
                "This file has been incorrectly flagged as valid : " . $file->getFilename());
        }
    }

    public function testCorrectsBrokenItems() {
        foreach ($this->getFilesFrom($this->dirBrokenTests) as $file) {
            $expectedPathname = $this->dirFixedTests . '/' . $file->getFilename();

            $responseProcessingUpdater = new GhostResponseDeclarationRemover($file->getPathname());

            $actualPathname = $this->dirTemp . '/' . $file->getFilename();
            file_put_contents(
                $actualPathname,
                $responseProcessingUpdater->getFixedXml()
            );
            $this->assertEquals(
                $this->getXmlStringFrom($expectedPathname),
                $this->getXmlStringFrom($actualPathname));
        }
    }

    private function getXmlStringFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->formatOutput = true;
        $xml->preserveWhiteSpace = false;
        $xml->load($pathname);
        return $xml->saveXml();
    }

}
