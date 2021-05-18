<?php

namespace oat\taoQtiItem\test\unit\model\flyExporter\simpleExporter;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;

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
}
