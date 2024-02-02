import React from "react";
import axiosClient from "./axios/axiosClient";
import { getMember } from "./helpers/GlobalHelpers";
import ItemCard from "./ItemCard";
import { useQuery } from "react-query";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  window.top.Info = {
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
    rightTree: {
      groups: [
        {
          group: "Chức năng khác",
          rights: [
            {
              IsAllStock: true,
              hasRight: true,
              name: "adminTools",
              text: "Công cụ hệ thống",
              subs: [
                {
                  name: "adminTools_byStock",
                  IsAllStock: true,
                  hasRight: true,
                },
              ],
            },
          ],
        },
      ],
    },
    User: {
      ID: 1,
    },
    CrStockID: 8975,
  };

  window.top.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxMDY4OCIsIlRva2VuSWQiOiIyNSIsIm5iZiI6MTcwNjUwMDIxMiwiZXhwIjoxNzkyOTAwMjEyLCJpYXQiOjE3MDY1MDAyMTJ9.fSbQQDUMBM93Hhm1rj6zT5SI_8RYMhjfh0y24wNFC84";

  window.top.GlobalConfig = {
    Admin: {
      thuong_ds_nang_cao: false,
    },
  };
}

function App() {
  const { Member } = getMember();
  const MoneyCards = useQuery({
    queryKey: ["MoneyCards", Member?.ID],
    queryFn: async () => {
      let { data } = await axiosClient.get(
        `/api/v3/moneycard?cmd=get&memberid=${Member.ID}`
      );
      return data?.data || [];
    },
  });

  return (
    <div className="iframe-cardmoney h-100">
      {MoneyCards.isLoading && (
        <div className="p-15px m-h-100 d-flex align-items-center justify-content-center">
          Đang tải ...
        </div>
      )}
      {!MoneyCards.isLoading && (
        <>
          {MoneyCards?.data && MoneyCards.data.length > 0 ? (
            <>
              <div className="p-3 hidden md:block">
                <div className="relative overflow-x-auto">
                  <table className="w-full border rounded text-sm">
                    <thead>
                      <tr>
                        <th
                          className="px-4 py-3 border min-w-[230px] text-left"
                          scope="col"
                        >
                          Tên thẻ tiền
                        </th>
                        {/* <th className="px-4 py-3 border min-w-[230px] max-w-[230px]" scope="col">Giá trị</th> */}
                        {/* <th className="px-4 py-3 border min-w-[230px] max-w-[230px]" scope="col">Giá trị chi tiêu</th> */}
                        <th
                          className="px-4 py-3 border min-w-[230px] text-left"
                          scope="col"
                        >
                          Giá trị còn lại
                        </th>
                        {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
                          window.top?.Info?.User?.ID === 1 && (
                            <th className="text-center px-4 py-3 border min-w-[160px] max-w-[160px] w-[160px]">
                              #
                            </th>
                          )
                        ) : (
                          <th className="text-center px-4 py-3 border min-w-[170px] max-w-[170px] w-[170px]">
                            #
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {MoneyCards?.data.map((item, index) => (
                        <ItemCard
                          item={item}
                          key={index}
                          index={index}
                          onRefetch={MoneyCards.refetch}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="md:hidden p-3">
                {MoneyCards?.data.map((item, index) => (
                  <ItemCard
                    item={item}
                    key={index}
                    index={index}
                    onRefetch={MoneyCards.refetch}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="p-15px m-h-100 d-flex align-items-center justify-content-center text-sm">
              Chưa có thẻ tiền
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
