<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\scripts\tools\accessControl\SetRolesAccess;
use oat\taoItems\model\user\TaoItemsRoles;

final class Version202107270952231101_taoQtiItem extends AbstractMigration
{
    private const CONFIG = [
        SetRolesAccess::CONFIG_RULES => [
            TaoItemsRoles::ITEM_CONTENT_CREATOR => [
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'index'],
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'saveItem'],
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getItemData'],
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getFile'],
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getMediaSources'],
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCssAuthoring', 'act' => 'load']
            ],
        ]
    ];

    public function getDescription(): string
    {
        return 'Item content creator role to author existing item';
    }

    public function up(Schema $schema): void
    {
        $setRolesAccess = $this->propagate(new SetRolesAccess());
        $setRolesAccess(
            [
                '--' . SetRolesAccess::OPTION_CONFIG,
                self::CONFIG,
            ]
        );
    }

    public function down(Schema $schema): void
    {
        $setRolesAccess = $this->propagate(new SetRolesAccess());
        $setRolesAccess([
            '--' . SetRolesAccess::OPTION_REVOKE,
            '--' . SetRolesAccess::OPTION_CONFIG, self::CONFIG,
        ]);
    }
}
