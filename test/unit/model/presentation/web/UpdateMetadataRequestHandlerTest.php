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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\presentation\web;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use InvalidArgumentException;
use JsonException;
use oat\taoQtiItem\model\input\UpdateMetadataInput;
use oat\taoQtiItem\model\presentation\web\UpdateMetadataRequestHandler;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;

class UpdateMetadataRequestHandlerTest extends TestCase
{
    private UpdateMetadataRequestHandler $sut;

    private MockObject $request;
    private MockObject $resourceMock;
    private MockObject $propertyMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sut = new UpdateMetadataRequestHandler();
        $this->request = $this->createMock(ServerRequestInterface::class);
    }

    public function testValidRequestBody(): void
    {
        $this->request->expects($this->once())->method('getBody')
            ->willReturn(
                '{
                            "resourceUri": "https://test.local/tao.rdf#rs-id",
                            "propertyUri": "https://test.local/tao.rdf#pr-id",
                            "value": "test"
                     }'
            );

        $input = $this->sut->handle($this->request);

        self::assertInstanceOf(UpdateMetadataInput::class, $input);
        self::assertEquals(
            new UpdateMetadataInput(
                new core_kernel_classes_Resource('https://test.local/tao.rdf#rs-id'),
                new SimpleMetadataValue(
                    'https://test.local/tao.rdf#rs-id',
                    ['https://test.local/tao.rdf#pr-id'],
                    'test'
                )
            ),
            $input
        );
    }

    /**
     * @dataProvider provideInvalidRequestBodies
     */
    public function testInvalidRequestBody(string $exceptionClass, string $exceptionMessage, string $requestBody): void
    {
        $this->expectException($exceptionClass);
        $this->expectExceptionMessage(
            $exceptionMessage
        );

        $this->request->expects($this->once())->method('getBody')
            ->willReturn($requestBody);

        $this->sut->handle($this->request);
    }

    public function provideInvalidRequestBodies(): array
    {
        return [
            'without-required-property' => [
                'exceptionClass' => InvalidArgumentException::class,
                'exceptionMessage' => sprintf(
                    "The properties %s, %s and %s are mandatory",
                    ...UpdateMetadataInput::VALID_PROPERTIES
                ),
                'requestBody' => '{
                            "propertyUri": "https://test.local/tao.rdf#pr-id",
                            "value": "test"
                     }',
            ],
            'invalid-property' => [
                'exceptionClass' => InvalidArgumentException::class,
                'exceptionMessage' => sprintf(
                    "Valid properties are propertyUri, resourceUri, value"
                ),
                'requestBody' => '{
                            "resourceUri": "https://test.local/tao.rdf#pr-id",
                            "propertyUri": "https://test.local/tao.rdf#pr-id",
                            "value": "test",
                            "invalid": "test"
                     }',
            ],
            'invalid-type' => [
                'exceptionClass' => InvalidArgumentException::class,
                'exceptionMessage' => sprintf(
                    "The property value must be string"
                ),
                'requestBody' => '{
                            "resourceUri": "https://test.local/tao.rdf#pr-id",
                            "propertyUri": "https://test.local/tao.rdf#pr-id",
                            "value": true
                     }',
            ],
            'invalid-content-type' => [
                'exceptionClass' => JsonException::class,
                'exceptionMessage' => sprintf(
                    "Syntax error"
                ),
                'requestBody' => '<xml></xml>',
            ],
        ];
    }
}
