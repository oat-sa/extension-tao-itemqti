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

use core_kernel_classes_Resource;
use core_kernel_persistence_ResourceInterface;
use InvalidArgumentException;
use JsonException;
use oat\generis\model\data\Ontology;
use oat\generis\model\data\RdfsInterface;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\input\UpdateMetadataInput;
use oat\taoQtiItem\model\presentation\web\UpdateMetadataRequestHandler;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;

class UpdateMetadataRequestHandlerTest extends TestCase
{
    use ServiceManagerMockTrait;

    private UpdateMetadataRequestHandler $sut;

    private MockObject $request;
    private MockObject $resourceImplementationMock;
    private ServiceManager $serviceManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sut = new UpdateMetadataRequestHandler();
        $this->request = $this->createMock(ServerRequestInterface::class);

        $ontologyMock = $this->createMock(Ontology::class);
        $this->serviceManager = ServiceManager::getServiceManager();
        ServiceManager::setServiceManager(
            $this->getServiceManagerMock(
                [
                    Ontology::SERVICE_ID => $ontologyMock
                ]
            )
        );

        $this->resourceImplementationMock = $this->createMock(
            core_kernel_persistence_ResourceInterface::class
        );

        $rdfsMock = $this->createMock(RdfsInterface::class);
        $rdfsMock->method('getResourceImplementation')
            ->willReturn(
                $this->resourceImplementationMock
            );

        $ontologyMock->method('getRdfsInterface')
            ->willReturn($rdfsMock);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        ServiceManager::setServiceManager(
            $this->serviceManager
        );
    }

    public function testValidRequestBody(): void
    {
        $this->resourceImplementationMock->expects($this->exactly(2))
            ->method('getTypes')
            ->willReturn(['itemType']);


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

    public function testInvalidResourceUri(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage(
            'Resource with id INVALID does not exist'
        );

        $this->resourceImplementationMock->expects($this->exactly(1))
            ->method('getTypes')
            ->willReturn([]);


        $this->request->expects($this->once())->method('getBody')
            ->willReturn(
                '{
                            "resourceUri": "INVALID",
                            "propertyUri": "https://test.local/tao.rdf#pr-id",
                            "value": "test"
                     }'
            );

        $this->sut->handle($this->request);
    }

    public function testInvalidPropertyUri(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage(
            'Property with id INVALID does not exist'
        );

        $this->resourceImplementationMock->expects($this->at(0))
            ->method('getTypes')
            ->willReturn(['itemType']);

        $this->resourceImplementationMock->expects($this->at(1))
            ->method('getTypes')
            ->willReturn([]);


        $this->request->expects($this->once())->method('getBody')
            ->willReturn(
                '{
                            "resourceUri": "https://test.local/tao.rdf#rs-id",
                            "propertyUri": "INVALID",
                            "value": "test"
                     }'
            );

        $this->sut->handle($this->request);
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
