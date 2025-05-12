<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\exporter;

use ArrayIterator;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMNodeList;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use oat\oatbox\log\LoggerService;
use oat\tao\model\Lists\Business\Service\RemoteSource;
use oat\taoQtiItem\model\qti\metadata\exporter\CustomPropertiesManifestScanner;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use PHPUnit\Framework\TestCase;

class ScalePreprocessorTest extends TestCase
{
    private const SCALE_COLLECTION = [
        [
            'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1',
            'label' => 'A2-B1',
            'values' => [
                "1" => "A2-B1-1",
                "3" => "A2-B1-2",
                "5" => "A2-B1-3",
            ]
        ],
        [
            'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B2',
            'label' => 'A2-B2',
            'values' => [
                "1" => "A2-B2-1",
                "6" => "A2-B2-2",
                "7" => "A2-B2-3",
            ]
        ]
    ];

    public function setUp(): void
    {
        $this->manifest = new DOMDocument();
        $this->manifest->loadXML($this->readSampleFile('manifestSample.xml'));
        $this->testDoc = new DOMDocument();
        $this->testDoc->loadXML($this->readSampleFile('testSample.xml'));
        $this->remoteSource = $this->createMock(RemoteSource::class);
        $this->manifestScanner = $this->createMock(CustomPropertiesManifestScanner::class);
        $this->loggerMock = $this->createMock(LoggerService::class);
        $this->subject = new ScalePreprocessor(
            $this->remoteSource,
            $this->manifestScanner,
            $this->loggerMock,
            'http://ScaleUrl.example.com/scale.json'
        );
    }

    /**
     * @dataProvider invalidRemoteListScaleCollection
     */
    public function testIncludeScaleObjectInvalid(array $collection)
    {

        $this->remoteSource
            ->expects($this->once())
            ->method('fetchByContext')
            ->willReturn(new ArrayIterator($collection));

        $this->subject->includeScaleObject($this->manifest, $this->testDoc);
    }

    public function testIncludeScaleObjectChangeManifest()
    {
        $this->remoteSource
            ->expects($this->once())
            ->method('fetchByContext')
            ->willReturn(new ArrayIterator(self::SCALE_COLLECTION));

        $nodeListMock = $this->createMock(DOMNodeList::class);

        $nodeListWithOneElement = $this->createCustomProperties()->item(0)->getElementsByTagName('property');
        $nodeListWithNoElement = $this->createCustomProperties()->item(0)->getElementsByTagName('NoProperty');
        $domElementMock = $this->createMock(DOMElement::class);

        $nodeListMock->expects($this->once())
            ->method('item')
            ->willReturn($domElementMock);

        $domElementMock->expects($this->once())
            ->method('appendChild');

        $this->manifestScanner
            ->expects($this->once())
            ->method('getCustomProperties')
            ->willReturn($nodeListMock);

        $this->manifestScanner
            ->expects($this->exactly(2))
            ->method('getCustomPropertyByUri')
            ->willReturnOnConsecutiveCalls(
                $nodeListWithOneElement,
                $nodeListWithNoElement
            );

        $domNodeMock = $this->createMock(DOMNode::class);

        $nodeListMock->expects($this->once())
            ->method('item')
            ->willReturn($domNodeMock);

        $domNodeMock
            ->method('appendChild');

        $this->subject->includeScaleObject($this->manifest, $this->testDoc);
    }

    private function readSampleFile(string $filename): string
    {

        $adapter = new LocalFilesystemAdapter(
            dirname(__FILE__, 2)
        );

        $filesystem = new Filesystem($adapter);
        return $filesystem->read('samples/' . $filename);
    }

    public function invalidRemoteListScaleCollection()
    {
        return [
            'empty array' => [
                'collection' => [],
            ],
            'missing url' => [
                [
                    [
                        'label' => 'A2-B1',
                        'values' => [
                            "1" => "A2-B1-1",
                            "2" => "A2-B1-2",
                            "3" => "A2-B1-3",
                        ]
                    ],
                    [
                        'label' => 'A2-B2',
                        'values' => [
                            "1" => "A2-B2-1",
                            "2" => "A2-B2-2",
                            "3" => "A2-B2-3",
                        ]
                    ]
                ]
            ],
            'missing label' => [
                [
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1',
                        'values' => [
                            "1" => "A2-B1-1",
                            "2" => "A2-B1-2",
                            "3" => "A2-B1-3",
                        ]
                    ],
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B2',
                        'values' => [
                            "1" => "A2-B2-1",
                            "2" => "A2-B2-2",
                            "3" => "A2-B2-3",
                        ]
                    ]
                ]
            ],
            'missing values' => [
                [
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1',
                        'label' => 'A2-B1',
                    ],
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B2',
                        'label' => 'A2-B2',
                    ]
                ]
            ],
            'values not an array' => [
                [
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1',
                        'label' => 'A2-B1',
                        'values' => 'A2-B1-1'
                    ],
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B2',
                        'label' => 'A2-B2',
                        'values' => 123
                    ]
                ]
            ],
            'values are illegal' => [
                [
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1',
                        'label' => 'A2-B1',
                        'values' => [
                            "1" => "A2-B1-1",
                            "2" => 123,
                            "3" => "A2-B1-3",
                        ]
                    ],
                    [
                        'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B2',
                        'label' => 'A2-B2',
                        'values' => [
                            "1" => "A2-B2-1",
                            "2" => "A2-B2-2",
                            "3" => 123
                        ]
                    ]
                ]
            ]
        ];
    }

    private function createCustomProperties(): DOMNodeList
    {
        $dom = new DOMDocument();
        $dom->loadXML('
<customProperties>
    <property>
        <uri>http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1</uri>
        <label>CERF</label>
        <domain>http://www.tao.lu/Ontologies/TAO.rdf#Scale</domain>
    </property>
</customProperties>
');
        return $dom->getElementsByTagName('customProperties');
    }

    private function getCustomProperty(DOMDocument $manifest)
    {

    }
}
