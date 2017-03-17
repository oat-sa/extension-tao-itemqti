<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 16/03/17
 * Time: 15:01
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest;


use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMapping;
use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataInjector;

class LomInjector extends ImsManifestMetadataInjector
{
    public function __construct()
    {
        $mappings = [];
        $mappings[] = new ImsManifestMapping(
            'http://www.imsglobal.org/xsd/imsmd_v1p2',
            'imsmd',
            'http://www.imsglobal.org/xsd/imsmd_v1p2p2.xsd'
        );
        parent::__construct($mappings);
    }

}