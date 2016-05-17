<?php
namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\taoItems\model\media\LocalItemSource;

class LocalAssetHandler extends AssetHandler
{
    /**
     * @var LocalItemSource
     */
    protected $itemSource;

    public function __construct($itemSource)
    {
        if (!$itemSource instanceof LocalItemSource) {
            throw new \common_Exception('LocalAssetHandler expects item source to be a valid LocalItemSource');
        }
        $this->itemSource = $itemSource;
        return $this;
    }

    public function handle($absolutePath, $relativePath)
    {
        // store locally, in a safe directory
        $safePath = '';
        if (dirname($relativePath) !== '.') {
            $safePath = str_replace('../', '', dirname($relativePath)) . '/';
        }
        \common_Logger::i($absolutePath);
        \common_Logger::i(basename($absolutePath));
        \common_Logger::i($safePath);
        $info = $this->itemSource->add($absolutePath, basename($absolutePath), $safePath);
        \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' copied.');
        return $info;
    }
}