import React, { useEffect, useState } from "react";
import axiosClient from "./axios/axiosClient";
import { getMember } from "./helpers/GlobalHelpers";
import ItemCard from "./ItemCard";

function App() {
  const [loading, setLoading] = useState(false);
  const [ListMoneyCard, setListMoneyCard] = useState([]);
  const { Member } = getMember();

  const getMoneyCard = (callback) => {
    axiosClient
      .get(`/api/v3/moneycard?cmd=get&memberid=${Member.ID}`)
      .then(({ data }) => {
        setListMoneyCard(data.data);
        setLoading(false);
        callback && callback();
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setLoading(true);
    getMoneyCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="iframe-cardmoney h-100">
      {loading && (
        <div className="p-15px m-h-100 d-flex align-items-center justify-content-center">
          Đang tải ...
        </div>
      )}
      {!loading && (
        <>
          {ListMoneyCard && ListMoneyCard.length > 0 ? (
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
                      {ListMoneyCard.map((item, index) => (
                        <ItemCard
                          item={item}
                          key={index}
                          index={index}
                          getMoneyCard={getMoneyCard}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="md:hidden p-3">
                {ListMoneyCard.map((item, index) => (
                  <ItemCard
                    item={item}
                    key={index}
                    index={index}
                    getMoneyCard={getMoneyCard}
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
