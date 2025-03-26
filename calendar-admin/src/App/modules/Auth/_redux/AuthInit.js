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
              ID: 11520,
              Title: "Cser Hà Nội",
              KeySEO: "[05:00;20:00;60]{CN;10:00;21:00;120}{T2;09:00;18:30}",
              ParentID: 778,
            },
            {
              ID: 11451,
              Title: "Cser Hồ Chí Minh",
              KeySEO: "",
              ParentID: 778,
            },
          ],
          StockRights: [
            {
              ID: 11520,
              Title: "Cser Hà Nội",
              KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
              ParentID: 778,
            },
            {
              ID: 11451,
              Title: "Cser Hồ Chí Minh",
              KeySEO: "",
              ParentID: 778,
            },
          ],
          CrStockID: 11520, //8975
          rightsSum: {
            pos: {
              hasRight: true,
              stocks: [
                [
                  {
                    ID: 11450,
                    Title: "Cser Hà Nội",
                    KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                    ParentID: 778,
                  },
                  {
                    ID: 11451,
                    Title: "Cser Hồ Chí Minh",
                    KeySEO: "",
                    ParentID: 778,
                  },
                ],
              ],
              IsAllStock: false,
            },
            tele: {
              hasRight: true,
              stocks: [
                {
                  ID: 11450,
                  Title: "Cser Hà Nội",
                  KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                  ParentID: 778,
                },
                {
                  ID: 11451,
                  Title: "Cser Hồ Chí Minh",
                  KeySEO: "",
                  ParentID: 778,
                },
              ],
              IsAllStock: false,
            },
            teleAdv: {
              hasRight: true,
              stocks: [
                {
                  ID: 11450,
                  Title: "Cser Hà Nội",
                  KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                  ParentID: 778,
                },
                {
                  ID: 11451,
                  Title: "Cser Hồ Chí Minh",
                  KeySEO: "",
                  ParentID: 778,
                },
              ],
              IsAllStock: false,
            },
          },
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEyMjEzMzEyMjUyNyIsIm5iZiI6MTc0MjYyOTM0NSwiZXhwIjoxODI5MDI5MzQ1LCJpYXQiOjE3NDI2MjkzNDV9.a3yJEfRkP3PeJJc1PkS4zp5duj3wq-H0UNi3Tidsn-U",
        };
        window.GlobalConfig = {
          APP: {
            Working: {
              TimeClose: "21:00:00",
              TimeOpen: "8:00:00",
            },
            SL_khach: true,
          },
          Admin: {
            kpiFinish: "Khách đến làm dịch vụ",
            kpiCancel: "Khách hủy",
            kpiCancelFinish: "Khách không đến",
            kpiSuccess: "Đặt lịch thành công",
            isRooms: true,
            isAdminBooks: false,
          },
        };
      }
      checkInfo(() => {
        dispatch(setConfig(window.top.GlobalConfig));
        dispatch(setInfo(window.top.Info));
        setShowSplashScreen(false);
      });
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
