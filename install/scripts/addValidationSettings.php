<?php

namespace oat\taoQtiItem\install\scripts;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\ValidationService;

class addValidationSettings extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {

        $this->setServiceLocator(ServiceManager::getServiceManager());
        $serviceManager = $this->getServiceManager();
        $manifestValidation = array(
            'default' => array(
                __DIR__.'/../../model/qti/data/imscp_v1p1.xsd',
                __DIR__.'/../../model/qti/data/apipv1p0/Core_Level/Package/apipv1p0_imscpv1p2_v1p0.xsd'
            )
        );

        $contentValidation = array(
            'http://www.imsglobal.org/xsd/imsqti_v2p0' => array(
                __DIR__.'/../../model/qti/data/qtiv2p0/imsqti_v2p0.xsd'
            ),
            'http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p1' => array(
                __DIR__.'/../../model/qti/data/apipv1p0/Core_Level/Package/apipv1p0_qtiitemv2p1_v1p0.xsd'
            ),
            'default' => array(
                __DIR__.'/../../model/qti/data/qtiv2p1/imsqti_v2p1.xsd',
            )
        );

        $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
        if($ext->hasConfig('contentValidation')){
            $contentValidation = $ext->getConfig('contentValidation');
            $ext->unsetConfig('contentValidation');
        }

        if($ext->hasConfig('manifestValidation')){
            $manifestValidation = $ext->getConfig('manifestValidation');
            $ext->unsetConfig('manifestValidation');
        }
        //Set Validation service
        $validationService = new ValidationService(array('contentValidation' => $contentValidation, 'manifestValidation' => $manifestValidation));
        $validationService->setServiceManager($serviceManager);
        $serviceManager->register(ValidationService::SERVICE_ID, $validationService);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Validation service has been successfully set up');
    }
}