<?php

namespace oat\taoQtiItem\test\unit\model\flyExporter\simpleExporter;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\Export\QTIPackedItem22Exporter;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use ZipArchive;
use function Webmozart\Assert\Tests\StaticAnalysis\true;

class ItemExporterTest extends TestCase
{
    public function testGetDataByItem()
    {
        $extractor = $this->getMockBuilder(\oat\taoQtiItem\model\flyExporter\extractor\Extractor::class)
            ->getMock();
        $extractor2 = $this->getMockBuilder(\oat\taoQtiItem\model\flyExporter\extractor\Extractor::class)
            ->getMock();

        $extractor2->expects($this->once())->method('getData')->willReturn([
            'foo' => 'bar',
        ]);
        $extractor->expects($this->once())->method('getData')->willReturn([
            '5d1b29d040d15' => [
                'type' => 'Choice',
                'nb choice' => 3,
            ],
            '5d1b29d040daf' => [
                'type' => 'Associate',
                'nb choice' => 2,
            ],
        ]);

        $exporter = new ItemExporter([
            'extractors' => [
                'QtiExtractor' => $extractor,
                'MetaDataOntologyExtractor' => $extractor2,
            ],
            'fileLocation' => 'tmp',
            'columns' => [
                'choiceInteraction' => [
                    'extractor' => 'QtiExtractor',
                ],
            ]
        ]);
        $item = new \core_kernel_classes_Resource('foo');
        $data = $exporter->getDataByItem($item);
        //both interactions have metadata
        $this->assertEquals(array_column($data, 'foo'), ['bar', 'bar']);
    }

    public function testSetCorrectQTIVersion()
    {
        $input = file_get_contents(dirname(__FILE__) . '/../../../samples/export/item_qti_input.xml');
        $expectedOutputV21 = file_get_contents(dirname(__FILE__) . '/../../../samples/export/exported_item_2_1.xml');
        $expectedOutputV22 = file_get_contents(dirname(__FILE__) . '/../../../samples/export/exported_item_2_2.xml');

        $coreKernelClassStub = $this->createStub(core_kernel_classes_Resource::class);
        $zipArchiveStub = $this->createStub(ZipArchive::class);

        // To be able to test protected method
        $exporterV21 = new class($coreKernelClassStub, $zipArchiveStub) extends QTIPackedItemExporter {
            public function setCorrectQTIVersion(string $itemQTI): string
            {
                return parent::setCorrectQTIVersion($itemQTI);
            }
        };

        $outputV21 = $exporterV21->setCorrectQTIVersion($input);
        $this->assertEquals($expectedOutputV21, $outputV21);

        $exporterV22 = new class($coreKernelClassStub, $zipArchiveStub) extends QTIPackedItem22Exporter {
            public function setCorrectQTIVersion(string $itemQTI): string
            {
                return parent::setCorrectQTIVersion($itemQTI);
            }
        };

        $outputV22 = $exporterV22->setCorrectQTIVersion($input);
        $this->assertEquals($expectedOutputV22, $outputV22);
    }
}
