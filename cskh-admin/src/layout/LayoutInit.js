import React, { useLayoutEffect } from "react";
import { EZSUtil } from "../_assets/js/components/util";
import EZSLayoutAsideMenu from "../_assets/js/layout/base/aside-menu";
import EZSLayoutAsideToggle from "../_assets/js/layout/base/aside-toggle";
import EZSLayoutBrand from "../_assets/js/layout/base/brand";
import EZSLayoutSocial from "../_assets/js/layout/base/social";

export default function LayoutInit() {
  useLayoutEffect(() => {
    EZSUtil.ready(() => {
      // Init Aside Menu Toggle
      EZSLayoutAsideToggle.init('ezs_aside_toggle');
      // Init Brand Panel For Logo
      EZSLayoutBrand.init("ezs_brand");
      // Init Brand Panel For Social
      EZSLayoutSocial.init("ezs_social");
      // Init Aside Menu
      EZSLayoutAsideMenu.init("kt_aside_menu");
    });
  });
  return <></>;
}
