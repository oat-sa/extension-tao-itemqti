<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\scripts\tools\accessControl\SetRolesAccess;
use oat\taoItems\model\user\TaoItemsRoles;

final class Version202108030712441101_taoQtiItem extends AbstractMigration
{
    private const CONFIG = [
        SetRolesAccess::CONFIG_RULES => [
            TaoItemsRoles::ITEM_RESOURCE_CREATOR => [
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'createItem'],                
            ],
        ]
    ];

    public function getDescription(): string
    {
        return 'Item resource creator role to create item';
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
