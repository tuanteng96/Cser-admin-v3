import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Advanced from "./pages/Advanced";
import Divided from "./pages/Divided";
import BonusSaleCrud from "./_redux/BonusSaleCrud";
import BounsSalesIn from "./pages/BounsSalesIn";
import Equally from "./pages/Equally";
import AutoBouns from "./pages/AutoBouns";

const isVisible = (Type) => {
  return Type.some((item) => item.Visible);
};

const BonusSales = () => {
  const { OrderID, CrStockID, UserID } = useSelector(({ Auth }) => ({
    OrderID: Auth.OrderID,
    CrStockID: Auth.CrStockID,
    UserID: Auth?.User?.ID,
  }));
  const [OrderInfo, setOrderInfo] = useState({});
  const [Type, setType] = useState([
    {
      ID: 1,
      Name: "Equally",
      Title: "Áp dụng 1 hoặc nhiều NV",
      Visible: false,
      IsActive: false,
      Hide: false,
      className: "btn btn-primary",
    },
    {
      ID: 2,
      Name: "Divided",
      Title: "Áp dụng nhiều NV mỗi người 1 SP",
      Visible: false,
      IsActive: false,
      Hide: false,
      className: "btn btn-primary",
    },
    {
      ID: 3,
      Name: "Advanced",
      Title: "Nâng cao",
      Visible: false,
      IsActive: false,
      Hide: window.top?.GlobalConfig?.Admin?.thuong_ds_nang_cao && UserID !== 1,
      className: "btn btn-primary",
    },
    {
      ID: 4,
      Name: "AutoBouns",
      Title: "Thưởng tự động",
      Visible: false,
      IsActive: false,
      Hide: true,
      className: "btn btn-danger",
    },
  ]);
  const [loading, setLoading] = useState({
    divided: false,
    advanced: false,
    equally: false,
    autoBouns: false,
  });

  useEffect(() => {
    getInfoOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { hoa_hong, doanh_so, oiItems } = OrderInfo;
    if (hoa_hong && doanh_so && oiItems) {
      const isItem = oiItems.some(
        (item) => item.gia_tri_doanh_so > 0 || item.gia_tri_thanh_toan
      );

      if (isItem && (hoa_hong.length > 0 || doanh_so.length > 0)) {
        const index = Type.findIndex((item) => item.Name === "AutoBouns");
        let TypeObj = Object.assign([], Type);
        TypeObj[index].Hide = false;
        setType(TypeObj);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OrderInfo]);

  const getInfoOrder = (callback) => {
    BonusSaleCrud.getOrderItem({ OrderID })
      .then(({ data }) => {
        const StaffStock = data?.nhan_vien || [];
        const newStaff =
          StaffStock.length > 0
            ? StaffStock.map((item) => ({
                ...item,
                label: item.co_so,
                options: item.ds
                  ? item.ds.map((user) => ({
                      ...user,
                      label: user.Fn,
                      value: user.ID,
                    }))
                  : [],
              }))
            : [];
        const newData = {
          ...data,
          nhan_vien: newStaff,
          oiItems: data.oiItems.map((item) => ({
            ...item,
            label: item.ProdTitle,
            value: item.ID,
          })),
        };
        setOrderInfo(newData);
        callback && callback();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleType = (item) => {
    setType((prevState) =>
      prevState.map((o) => ({
        ...o,
        Visible: o.ID === item.ID ? o.Visible : !o.Visible,
        IsActive: o.ID === item.ID ? !o.IsActive : o.Visible,
      }))
    );
  };

  var THUONG_TU_DONG = () => {
    handleType({
      ID: 4,
      Name: "AutoBouns",
      Title: "Thưởng tự động",
      Visible: false,
      IsActive: false,
      Hide: true,
      className: "btn btn-danger",
    });
  };
  window.THUONG_TU_DONG = THUONG_TU_DONG;

  const onToBack = () => {
    setType((prevState) =>
      prevState.map((o) => ({
        ...o,
        Visible: false,
        IsActive: false,
      }))
    );
  };

  const getNameActive = () => {
    const index = Type.findIndex((item) => !item.Visible);
    return Type[index];
  };

  const onSubmitEqually = ({ equally }) => {
    setLoading((prevState) => ({
      ...prevState,
      equally: true,
    }));
    const Hoa_Hong = [].concat.apply(
      [],
      equally && equally.length > 0 ? equally.map((item) => item.Hoa_Hong) : []
    );
    let Doanh_So = [];
    if (window.top?.GlobalConfig?.Admin?.thuong_ds_theo_loai) {
      Doanh_So = [].concat
        .apply(
          [],
          equally && equally.length > 0
            ? equally.map((item) => item.Doanh_So)
            : []
        )
        .map((x) => ({ ...x, Type: x.Type ? x.Type.value : "" }));
    } else {
      Doanh_So = [].concat.apply(
        [],
        equally && equally.length > 0
          ? equally.map((item) => item.Doanh_So)
          : []
      );
    }
    const dataSubmit = {
      OrderID: OrderID,
      save: {
        them_hoa_hong: Hoa_Hong.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.Staff?.ID,
          SubSourceID: item.Product?.ID,
        })).filter((o) => o.Value !== null),
        them_doanh_so: Doanh_So.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.Staff?.ID,
          OrderItemID: item.Product?.ID,
          KpiType: item.Type,
        })).filter((o) => o.Value !== null),
      },
    };
    BonusSaleCrud.postOrderItem(dataSubmit)
      .then((response) => {
        window.top.bodyEvent &&
          window.top.bodyEvent("ui_changed", {
            name: "AD_1_hoac_nhieu_NV",
            mid: 0,
            orderId: OrderID,
          });
        getInfoOrder(() => {
          setLoading((prevState) => ({
            ...prevState,
            equally: false,
          }));
          onToBack();
        });
      })
      .catch((error) => console.log(error));
  };

  const onSubmitDivided = ({ divided }) => {
    setLoading((prevState) => ({
      ...prevState,
      divided: true,
    }));
    const Hoa_Hong = [].concat.apply(
      [],
      divided && divided.length > 0 ? divided.map((item) => item.Hoa_Hong) : []
    );
    const Doanh_So = [].concat.apply(
      [],
      divided && divided.length > 0 ? divided.map((item) => item.Doanh_So) : []
    );
    const dataSubmit = {
      OrderID: OrderID,
      save: {
        them_hoa_hong: Hoa_Hong.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.Staff?.ID,
          SubSourceID: item.Product?.ID,
        })).filter((o) => o.Value !== null),
        them_doanh_so: Doanh_So.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.Staff?.ID,
          OrderItemID: item.Product?.ID,
        })).filter((o) => o.Value !== null),
      },
    };
    BonusSaleCrud.postOrderItem(dataSubmit)
      .then((response) => {
        window.top.bodyEvent &&
          window.top.bodyEvent("ui_changed", {
            name: "AD_nhieu_NV_moi_ng_1_SP",
            mid: 0,
            orderId: OrderID,
          });
        getInfoOrder(() => {
          setLoading((prevState) => ({
            ...prevState,
            divided: false,
          }));
          onToBack();
        });
      })
      .catch((error) => console.log(error));
  };

  const onSubmitAutoBouns = ({ AutoBouns }) => {
    setLoading((prevState) => ({
      ...prevState,
      autoBouns: true,
    }));
    const Hoa_Hong = [].concat.apply(
      [],
      AutoBouns && AutoBouns.length > 0
        ? AutoBouns.map((item) => item.Hoa_Hong)
        : []
    );
    const Doanh_So = [].concat.apply(
      [],
      AutoBouns && AutoBouns.length > 0
        ? AutoBouns.map((item) => item.Doanh_So)
        : []
    );
    const dataSubmit = {
      OrderID: OrderID,
      save: {
        them_hoa_hong: Hoa_Hong.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.User?.ID,
          SubSourceID: item.SubSourceID,
        })).filter((o) => o.Value !== null),
        them_doanh_so: Doanh_So.map((item) => ({
          Value: item.Value,
          ReceiverUserID: item.User?.ID,
          OrderItemID: item.OrderItemID,
          KpiType: item.Type ? item.Type.value : ''
        })).filter((o) => o.Value !== null),
      },
    };
    BonusSaleCrud.postOrderItem(dataSubmit)
      .then((response) => {
        window.top.bodyEvent &&
          window.top.bodyEvent("ui_changed", {
            name: "AD_thuong_tu_dong",
            mid: 0,
            orderId: OrderID,
          });
        getInfoOrder(() => {
          setLoading((prevState) => ({
            ...prevState,
            autoBouns: false,
          }));
          onToBack();
        });
      })
      .catch((error) => console.log(error));
  };

  const onSubmitAdvanced = async ({ advanced }) => {
    setLoading((prevState) => ({
      ...prevState,
      advanced: true,
    }));
    const newData = advanced.filter(
      (item) =>
        typeof item === "object" &&
        item.Product?.ID &&
        item.Value &&
        item.Staff?.ID
    );
    const Hoa_hong = newData
      .filter((item) => item.Type.value === "hoa_hong")
      .map((item) => ({
        Value: item.Value,
        ReceiverUserID: item.Staff?.ID,
        SubSourceID: item.Product?.ID,
      }))
      .filter((o) => o.Value !== null);
    const Doanh_so = newData
      .filter((item) => item.Type.value === "doanh_so")
      .map((item) => ({
        Value: item.Value,
        ReceiverUserID: item.Staff?.ID,
        OrderItemID: item.Product?.ID,
      }))
      .filter((o) => o.Value !== null);
    const dataSubmit = {
      OrderID: OrderID,
      save: {
        them_hoa_hong: Hoa_hong,
        them_doanh_so: Doanh_so,
      },
    };
    BonusSaleCrud.postOrderItem(dataSubmit)
      .then((response) => {
        getInfoOrder(() => {
          window.top.bodyEvent &&
            window.top.bodyEvent("ui_changed", {
              name: "AD_nag_cao",
              mid: 0,
              orderId: OrderID,
            });
          setLoading((prevState) => ({
            ...prevState,
            advanced: false,
          }));
          onToBack();
        });
      })
      .catch((error) => console.log(error));
  };

  const onSubmitUpdate = async ({ BounsSalesIn }) => {
    const Hoa_Hong = [].concat.apply(
      [],
      BounsSalesIn && BounsSalesIn.length > 0
        ? BounsSalesIn.map((item) => item.Hoa_Hong)
        : []
    );
    const Doanh_So = [].concat.apply(
      [],
      BounsSalesIn && BounsSalesIn.length > 0
        ? BounsSalesIn.map((item) => item.Doanh_So)
        : []
    );
    const dataSubmit = {
      OrderID: OrderID,
      save: {
        hoa_hong: Hoa_Hong.map((item) => ({
          ID: item.ID || 0,
          Value: item.Value,
          ReceiverUserID: item.User?.ID,
          SubSourceID: item.SubSourceID,
        })).filter((o) => o.Value !== null),
        doanh_so: Doanh_So.map((item) => ({
          ID: item.ID || 0,
          Value: item.Value,
          ReceiverUserID: item.User?.ID,
          OrderItemID: item.OrderItemID,
          KpiType: item.Type ? item.Type.value : "",
        })).filter((o) => o.Value !== null),
      },
    };
    BonusSaleCrud.postOrderItem(dataSubmit)
      .then((response) => {
        window.top.bodyEvent &&
          window.top.bodyEvent("ui_changed", {
            name: "AD_chinh_sua",
            mid: 0,
            orderId: OrderID,
          });
        getInfoOrder();
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-3">
        {isVisible(Type) && (
          <button
            className="btn btn-secondary me-2 mb-2 mb-sm-0"
            onClick={onToBack}
          >
            <i className="icon-xs ki ki-bold-arrow-back"></i> Quay lại
          </button>
        )}
        {Type.filter((item) => !item.Visible && !item.Hide).map(
          (item, index) => (
            <button
              className={`${item.className} d-block d-md-inline-block w-100 w-md-auto me-2 mb-2 mb-md-0`}
              key={index}
              onClick={() => handleType(item)}
              disabled={item.IsActive}
            >
              {item.Title}
            </button>
          )
        )}
      </div>
      {!isVisible(Type) && (
        <BounsSalesIn OrderInfo={OrderInfo} onSubmit={onSubmitUpdate} />
      )}

      {isVisible(Type) && (
        <Fragment>
          {getNameActive().Name === "Equally" && (
            <Equally
              OrderInfo={OrderInfo}
              loading={loading}
              onSubmit={onSubmitEqually}
            />
          )}
          {getNameActive().Name === "Divided" && (
            <Divided
              OrderInfo={OrderInfo}
              loading={loading}
              onSubmit={onSubmitDivided}
            />
          )}
          {getNameActive().Name === "Advanced" && (
            <Advanced
              OrderInfo={OrderInfo}
              loading={loading}
              onSubmit={onSubmitAdvanced}
            />
          )}
          {getNameActive().Name === "AutoBouns" && (
            <AutoBouns
              OrderInfo={OrderInfo}
              loading={loading}
              onSubmit={onSubmitAutoBouns}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default BonusSales;
