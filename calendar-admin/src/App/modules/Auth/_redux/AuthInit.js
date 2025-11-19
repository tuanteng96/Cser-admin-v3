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
          AllGroups: [
            {
              StockID: 11617,
              Users: [
                {
                  ID: 11407,
                  FullName: "Lo Ngọc Hà",
                },
                {
                  ID: 11406,
                  FullName: "Nguyễn Thị Phượng",
                },
              ],
            },
          ],
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
              ID: 11617,
              Title: "Cser Hà Nội",
              KeySEO:
                "{T2;08:00;18:00;30}{T3;08:00;18:00;30}{T4;08:00;18:00;30}{T5;08:00;18:00;30}{T6;08:00;18:00;30}{T7;08:00;18:00;30}{CN;08:00;18:00;30}",
              ParentID: 778,
            },
            {
              ID: 11542,
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
              ID: 11542,
              Title: "Cser Hồ Chí Minh",
              KeySEO: "",
              ParentID: 778,
            },
          ],
          CrStockID: 11617, //8975
          rightsSum: {
            pos: {
              hasRight: true,
              stocks: [
                [
                  {
                    ID: 11340,
                    Title: "Cser Hà Nội",
                    KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                    ParentID: 778,
                  },
                  {
                    ID: 11542,
                    Title: "Cser Hồ Chí Minh",
                    KeySEO: "",
                    ParentID: 778,
                  },
                ],
              ],
              IsAllStock: true,
            },
            tele: {
              hasRight: true,
              stocks: [
                {
                  ID: 11340,
                  Title: "Cser Hà Nội",
                  KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                  ParentID: 778,
                },
                {
                  ID: 11542,
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
                  ID: 11340,
                  Title: "Cser Hà Nội",
                  KeySEO: "[18:20;20:20]{T6;10:20;18:30}{CN;10:20;18:30}",
                  ParentID: 778,
                },
                {
                  ID: 11542,
                  Title: "Cser Hồ Chí Minh",
                  KeySEO: "",
                  ParentID: 778,
                },
              ],
              IsAllStock: false,
            },
          },
          rightTree: {
            groups: [
              {
                group: "Chức năng khác",
                rights: [
                  {
                    IsAllStock: true,
                    hasRight: true,
                    name: "adminTools",
                    subs: [
                      {
                        IsAllStock: true,
                        hasRight: true,
                        name: "adminTools_byStock",
                        name_and_group: "adminTools_byStock_adminTools",
                        stocks: "",
                        text: "Công cụ hệ thống - Điểm",
                        stocksList: [
                          {
                            ID: 11340,
                            Title: "Cser Beauty Hà Nội",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjExMjQ2MTAxMDE5MDAwMDEiLCJuYmYiOjE3NjE5MjM1NTgsImV4cCI6MTg0ODMyMzU1OCwiaWF0IjoxNzYxOTIzNTU4fQ.gdKqs5M79D5vJFnio16v_mKYE2J5CvTfkhpuIUNe_1c',
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
            dat_lich_hien_dv_an: true,
            toi_uu_bang_lich: false,
            dat_lich_tag: false,
            MasExportExcel: true,
            TextToSpeech: "zalo",
            PosActiveCalendar: "", //PickerCalendarRooms
            lop_hoc_diem: 10,
            kpiFinish: "Khách đến làm dịch vụ",
            kpiCancel: "Khách hủy",
            kpiCancelFinish: "Khách không đến",
            kpiSuccess: "Đặt lịch thành công",
            isRooms: true,
            isAdminBooks: false,
            SettingBookOnline: true,
            SettingBookOnlineMinutes: 0,
            lop_hoc_pt: true,
            checkout_time: "05:00;06:00",
            PosStatus: ["KHACH_DEN"],
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
