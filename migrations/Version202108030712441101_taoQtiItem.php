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
            TaoItemsRoles::ITEM_CONTENT_CREATOR => [
                ['ext' => 'taoQtiItem', 'mod' => 'QtiCssAuthoring', 'act' => 'save'],
            ],
            TaoItemsRoles::ITEM_IMPORTER => [
                ['ext' => 'taoQtiItem', 'mod' => 'ItemImportSampleDownload', 'act' => 'downloadTemplate'],
            ],
        ]
    ];

    public function getDescription(): string
    {
        return 'Give permissions for Item resource creator, content creator and importer role';
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
