<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\controller;

use oat\oatbox\event\EventManager;
use oat\oatbox\session\SessionService;
use oat\tao\model\ClientLibConfigRegistry;
use oat\tao\model\featureFlag\WProofreaderClientConfigHandler;
use oat\tao\model\tenantConfiguration\Service\ConfigurationService;
use oat\tao\model\user\TaoRoles;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\model\CreatorConfig;
use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;

class QtiCreatorTest extends TestCase
{
    public function testEditorReceivesTenantSpellcheckConfiguration(): void
    {
        $configurationService = $this->createMock(ConfigurationService::class);
        $configurationService->expects(self::once())->method('fetch')
            ->with('spellchecker.external_providers', 'tenant-id')
            ->willReturn([[
                'providerName' => 'wproofreader',
                'enabled' => true,
                'config' => ['serviceId' => 'tenant-service-id'],
            ]]);
        $session = $this->createMock(\common_session_Session::class);
        $session->method('getUserRoles')->willReturn([TaoRoles::BACK_OFFICE]);
        $sessionService = $this->createMock(SessionService::class);
        $sessionService->method('getCurrentSession')->willReturn($session);
        $sessionService->method('getTenantId')->willReturn('tenant-id');
        $handler = new WProofreaderClientConfigHandler($configurationService, $sessionService);
        $registry = $this->createMock(ClientLibConfigRegistry::class);
        $registry->method('getMap')->willReturn([
            'tao/ckeditor/wproofreaderBootstrap' => ['spellCheckConfig' => ['providerId' => 'native']],
        ]);
        $container = $this->createMock(ContainerInterface::class);
        $container->method('get')->willReturnMap([
            [WProofreaderClientConfigHandler::class, $handler],
            [ClientLibConfigRegistry::class, $registry],
        ]);
        $subject = $this->getMockBuilder(QtiCreator::class)->disableOriginalConstructor()->onlyMethods([
            'hasRequestParameter', 'getRequestParameter', 'getCreatorConfig', 'getPsrContainer',
            'setData', 'setView', 'getEventManager',
        ])->getMock();
        $subject->method('hasRequestParameter')->with('instance')->willReturn(true);
        $subject->method('getRequestParameter')->with('instance')
            ->willReturn(\tao_helpers_Uri::encode('https://example.test/item'));
        $subject->method('getCreatorConfig')->willReturn(new CreatorConfig([], []));
        $subject->method('getPsrContainer')->willReturn($container);
        $subject->method('getEventManager')->willReturn($this->createMock(EventManager::class));
        $subject->expects(self::once())->method('setData')->with(
            'config',
            self::callback(static fn (array $config): bool => $config['properties']['spellCheckConfig'] === [
                'enabled' => true,
                'providerId' => 'wproofreader',
                'providerConfig' => ['serviceId' => 'tenant-service-id'],
            ])
        );

        $subject->index();
    }
}
