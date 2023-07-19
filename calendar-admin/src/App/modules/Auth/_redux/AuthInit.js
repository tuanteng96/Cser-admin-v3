import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutSplashScreen } from "../../../../layout/_core/SplashScreen";
import { isDevCode } from "../../../../helpers/DevHelpers";
import { setConfig } from "./jsonSlice";
import { setInfo } from "./authSlice";

function checkInfo(fn) {
  if (window.top.Info && window.top.GlobalConfig) {
    fn();
  } else {
    setTimeout(() => {
      checkInfo(fn);
    }, 50);
  }
}

function AuthInit({ isConfig, children }) {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const dispatch = useDispatch();

  const { Token } = useSelector(({ Auth }) => ({
    Token: Auth?.token,
  }));

  useEffect(() => {
    async function requestUser() {
      if (isDevCode()) {
        window.Info = {
          User: {
            FullName: "Admin System",
            UserName: "admin",
            ID: 1,
          },
          Stocks: [
            {
              ID: 778,
              Title: "Quản lý cơ sở",
              ParentID: 0,
            },
            {
              ID: 8975,
              Title: "Cser Hà Nội",
              ParentID: 778,
            },
            {
              ID: 10053,
              Title: "Cser Hồ Chí Minh",
              ParentID: 778,
            },
          ],
          CrStockID: 8975, //8975
          rightsSum: {
            pos: {
              hasRight: true,
              stocks: [{ ID: 8975, Title: "Cser Hà Nội" }],
              IsAllStock: false,
            },
            tele: {
              hasRight: true,
              stocks: [
                { ID: 8975, Title: "Cser Hà Nội" },
                { ID: 10053, Title: "Cser Hồ Chí Minh" },
              ],
              IsAllStock: false,
            },
            teleAdv: {
              hasRight: true,
              stocks: [{ ID: 10053, Title: "Cser Hồ Chí Minh" }],
              IsAllStock: false,
            },
          },
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwMzc4NCIsIm5iZiI6MTY4OTczMzM2NSwiZXhwIjoxNjkwMzM4MTY1LCJpYXQiOjE2ODk3MzMzNjV9.nQZgqf_HrVOXq5xRu7mslPYGzP-Qx379wdqaU95GOWY",
        };
        window.GlobalConfig = {
          APP: {
            Working: {
              TimeClose: "21:00:00",
              TimeOpen: "10:00:00",
            },
          },
          Admin: {
            kpiFinish: "Khách đến làm dịch vụ",
            kpiCancel: "Khách hủy",
            kpiCancelFinish: "Khách không đến",
            kpiSuccess: "Đặt lịch thành công"
          },
        };
      }
      checkInfo(() => {
        dispatch(setConfig(window.top.GlobalConfig));
        dispatch(setInfo(window.top.Info));
        setShowSplashScreen(false);
      });
      // AuthCrud.getJsonConfig()
      //   .then((data) => {
      //     checkInfo(() => {
      //       dispatch(setConfig(data));
      //       dispatch(setInfo(window.top.Info));
      //       setShowSplashScreen(false);
      //     });
      //   })
      //   .catch((error) => console.log(error));
    }

    if (Token) {
      setShowSplashScreen(false);
    } else {
      requestUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Token]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
}

export default AuthInit;
