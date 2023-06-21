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
        <React.Fragment>
          {ListMoneyCard && ListMoneyCard.length > 0 ? (
            <React.Fragment>
              <div className="list-moneycard">
                <div className="table-responsive table-responsive-attr">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col">STT</th>
                        <th scope="col">Tên thẻ tiền</th>
                        <th scope="col">Giá trị</th>
                        <th scope="col">Giá trị chi tiêu</th>
                        <th scope="col">Còn lại</th>
                        {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
                          window.top?.Info?.User?.ID === 1 && (
                            <th className="text-center">#</th>
                          )
                        ) : (
                          <th className="text-center">#</th>
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
            </React.Fragment>
          ) : (
            <div className="p-15px m-h-100 d-flex align-items-center justify-content-center">
              Chưa có thẻ tiền
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export default App;
