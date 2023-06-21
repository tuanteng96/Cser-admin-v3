import React, { useEffect, useState } from "react";
import { LayoutSplashScreen } from "../../../layout/_core/EzsSplashScreen";

function AuthInit(props) {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  // We should request user by authToken before rendering the application

  useEffect(() => {
    if (Number("1") !== 1) {
      // Xử lí
      setShowSplashScreen(true);
    } else {
      setShowSplashScreen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return showSplashScreen ? <LayoutSplashScreen /> : <>{props.children}</>;
}

export default AuthInit;
