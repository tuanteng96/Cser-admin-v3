import React, { useEffect } from "react";
import axios from "axios";
import { toDomainUrl } from "./helpers/DomainHelper";
import { isIOS, isMacOs, isAndroid, isWindows } from "react-device-detect";

function App(props) {
  const getConfig = () => {
    axios
      .get(
        toDomainUrl(
          "/api/v3/config?cmd=getnames&names=chung.link.appstore,chung.link.chplay"
        )
      )
      .then(({ data }) => {
        const linkAppStore = data?.data[0]?.ValueText;
        const linkCHPlay = data?.data[1]?.ValueText;
        if (isIOS || isMacOs) {
          window.location.href = linkAppStore;
        }
        if (isAndroid || isWindows) {
          window.location.href = linkCHPlay;
        }
      });
  };

  useEffect(() => {
    getConfig();
  }, []);

  return <div></div>;
}

export default App;
