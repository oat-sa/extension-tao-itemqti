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
 * Copyright (c) 2019  (original work) Open Assessment Technologies SA;
 *
 * @author Oleksandr Zagovorychev <zagovorichev@gmail.com>
 */

namespace oat\taoQtiItem\test\unit\model;

use common_exception_Error;
use core_kernel_classes_Resource;
use Exception;
use oat\generis\test\TestCase;
use oat\tao\model\service\ServiceFileStorage;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
use PHPUnit_Framework_TestResult;
use ReflectionClass;
use ReflectionException;

class QtiJsonItemCompilerTest extends TestCase
{

    /**
     * @return array
     */
    public function xmlAttributesData()
    {
        return [
            // simple data returns as it is
            [
                [
                    [
                        'data'
                    ]
                ],
                ['data'],
            ],
            [
                [
                    '<p>text</p>'
                ],
                '<p>text</p>'
            ],
            // xml parsed
            [
                [
                    [
                        'core' => [
                            'apipAccessibility' => '<p>text</p>',
                        ],
                    ]
                ],
                [
                    'core' => [
                        'apipAccessibility' => [
                            'text'
                        ],
                    ]
                ]
            ],
            // empty tags left on their place
            [
                [
                    [
                        'core' => [
                            'apipAccessibility' => '<div><p>text</p><p></p><br/></div>',
                        ],
                    ]
                ],
                [
                    'core' => [
                        'apipAccessibility' => [
                            'p' => [
                                'text',
                                []
                            ],
                            'br' => [],
                        ],
                    ]
                ]
            ]
        ];
    }

    /**
     * @return array
     */
    public function xmlBadAttributesData()
    {
        return [
            // xml validation
            [
                [
                    [
                        'core' => [
                            'apipAccessibility' => 'just a string',
                        ]
                    ]
                ],
                [
                    'exception' => [
                        'class' => common_exception_Error::class,
                        'message' => 'Start tag expected, \'<\' not found [1]'
                    ]
                ]
            ],
            // no root element
            [
                [
                    [
                        'core' => [
                            'apipAccessibility' => '<p>text</p><p></p><br/><a> </a>',
                        ],
                    ]
                ],
                [
                    'exception' => [
                        'class' => common_exception_Error::class,
                        'message' => 'Extra content at the end of the document [1]'
                    ]
                ]
            ]
        ];
    }

    /**
     * @param array $data
     * @return mixed|PHPUnit_Framework_TestResult
     * @throws ReflectionException
     */
    protected function invokeMethod($data)
    {
        $class = new ReflectionClass(QtiJsonItemCompiler::class);
        $method = $class->getMethod('convertXmlAttributes');
        $method->setAccessible(true);
        /** @var core_kernel_classes_Resource $resource */
        $resource = $this->createMock(core_kernel_classes_Resource::class);
        /** @var ServiceFileStorage $storage */
        $storage = $this->createMock(ServiceFileStorage::class);
        $obj = new QtiJsonItemCompiler($resource, $storage);
        return $method->invokeArgs($obj, $data);
    }

    /**
     * @dataProvider xmlAttributesData
     * @param $data
     * @param $expected
     * @throws ReflectionException
     */
    public function testConvertXmlAttributes($data, $expected)
    {
        $result = $this->invokeMethod($data);
        $this->assertSame($expected, $result);
    }

    /**
     * @dataProvider xmlBadAttributesData
     * @param $data
     * @param $expected
     */
    public function testExceptionsConvertXmlAttributes($data, $expected)
    {
        try {
            $this->invokeMethod($data);
        } catch (Exception $e) {
            $this->assertSame($expected['exception']['class'], get_class($e));
            $this->assertSame($expected['exception']['message'], $e->getMessage());
        }
    }
}
