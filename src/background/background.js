import "./modules/InstallUpgrade.js";
import "./modules/AutoRemoteFollow.js";

import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";

// disable caching for AddonSettings
AddonSettings.setCaching(false);
