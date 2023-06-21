import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckIn, filterBy } from "./_redux/CheckinSlice";
import PerfectScrollbar from "react-perfect-scrollbar";
import CheckInFilter from "./CheckInFilter";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toAbsoluteUrl, toAbsoluteUser } from "../../../helpers/AssetsHelpers";
import { isDevCode } from "../../../helpers/DevHelpers";

import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false,
};

const groupbyTIME = (arr) => {
  return arr
    .map((item) => ({
      ...item,
      TimeCheckOut: item.CheckIn.CreateDate,
    }))
    .sort(function(left, right) {
      return moment.utc(left.TimeCheckOut).diff(moment.utc(right.TimeCheckOut));
    });
};

function CheckInPage(props) {
  const { ListCheckIn, loading, CrStockID } = useSelector(
    ({ CheckIn, Auth }) => ({
      ListCheckIn: groupbyTIME(CheckIn.ListFilters ?? CheckIn.ListCheckIn),
      loading: CheckIn.loading,
      CrStockID: Auth.CrStockID,
    })
  );
  const [initialValues,] = useState({ Key: "", Type: "" });

  const dispatch = useDispatch();

  useEffect(() => {
    if (CrStockID) {
      dispatch(CheckIn(CrStockID));
    }
  }, [dispatch, CrStockID]);

  const onFilter = (values) => {
    dispatch(filterBy(values));
  };

  window.top.UpdateSideBarCheckIn = () => {
    window.ResetForm && window.ResetForm();
    dispatch(CheckIn(CrStockID));
  };

  //console.log(ListCheckIn);
  //console.log(initialValues)

  return (
    <div
      className={`${
        isDevCode() ? "w-450px shadow" : "w-100"
      } h-100vh d-flex flex-column`}
    >
      <div className="shadow">
        <div className="d-flex justify-content-between align-items-center border-bottom py-17px px-15px">
          <div className="text-uppercase font-weight-bold pt-3px">
            Khách đang Check In
          </div>
          <div
            className="cursor-pointer w-30px text-center"
            onClick={() =>
              window.top &&
              window.top.ShowCheckInDiv &&
              window.top.ShowCheckInDiv(false)
            }
          >
            <i className="ki ki-close icon-xs text-muted font-size-md"></i>
          </div>
        </div>
        <div className="py-12px px-15px">
          <CheckInFilter
            onSubmit={(values) => onFilter(values)}
            initialValues={initialValues}
          />
        </div>
      </div>
      <PerfectScrollbar
        options={perfectScrollbarOptions}
        className="scroll flex-grow-1 pt-5px"
        style={{ position: "relative" }}
      >
        {loading && (
          <>
            {Array(3)
              .fill()
              .map((item, index) => (
                <div
                  className="p-15px border-bottom d-flex align-items-center"
                  key={index}
                >
                  <div className="w-45px">
                    <Skeleton width={45} height={45} borderRadius={100} />
                  </div>
                  <div className="px-15px flex-grow-1">
                    <div className="text-dark-75 font-weight-bold">
                      <Skeleton width={"90%"} height={16} />
                    </div>
                    <div className="font-weight-bold font-number font-size-13px text-dark-50">
                      <Skeleton width={"50%"} height={16} />
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn btn-icon btn-light-success btn-circle position-relative"
                      disabled
                    >
                      <i className="far fa-comment-alt-dollar font-size-18px position-absolute top-12px"></i>
                    </button>
                    <button
                      className="btn btn-icon btn-light-primary btn-circle position-relative ml-8px"
                      disabled
                    >
                      <i className="far fa-arrow-right font-size-16px position-absolute top-12px"></i>
                    </button>
                  </div>
                </div>
              ))}
          </>
        )}
        {!loading && (
          <>
            {ListCheckIn && ListCheckIn.length > 0 ? (
              ListCheckIn.map((item, index) => (
                <div
                  className="p-15px border-bottom d-flex align-items-center"
                  key={index}
                >
                  <div className="w-45px h-45px">
                    <img
                      className="w-100 h-100 object-fit-cover rounded-circle"
                      src={toAbsoluteUser(item.Photo)}
                      alt={item.FullName}
                    />
                  </div>
                  <div className="px-15px flex-1">
                    <div className="text-dark-75 font-weight-bold font-size-15px">
                      {item.FullName}
                    </div>
                    <div className="font-number font-size-13px text-dark-50">
                      {item.MobilePhone} - Checkin
                      <span className="text-danger font-weight-bold font-number pl-5px">
                        {moment(item?.CheckIn?.CreateDate).format("HH:mm")}
                      </span>
                    </div>
                  </div>
                  <div className="w-95px d-flex justify-content-end">
                    {item?.CheckIn?.OrderCheckInID ? (
                      <button
                        className="btn btn-icon btn-light-success btn-circle position-relative"
                        onClick={() => {
                          window.top.location.href = `/admin/?mdl=store&act=sell#mp:${item.ID}/payorder/${item?.CheckIn?.OrderCheckInID}`;
                          window.top &&
                            window.top.ShowCheckInDiv &&
                            window.top.ShowCheckInDiv(false);
                        }}
                      >
                        <i className="far fa-comment-alt-dollar font-size-16px position-absolute top-12px"></i>
                      </button>
                    ) : (
                      ""
                    )}
                    <button
                      className="btn btn-icon btn-light-primary btn-circle position-relative ml-8px"
                      onClick={() => {
                        window.top.location.href = `/admin/?mdl=store&act=sell#mp:${item.ID}`;
                        window.top &&
                          window.top.ShowCheckInDiv &&
                          window.top.ShowCheckInDiv(false);
                      }}
                    >
                      <i className="far fa-arrow-right font-size-15px position-absolute top-13px"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-300px d-flex align-items-center justify-content-center">
                <div>
                  <img
                    src={toAbsoluteUrl("/assets/images/data-empty.png")}
                    alt="Không có dữ liệu"
                  />
                  <div className="text-center font-weight-bold font-size-sm">
                    Không có dữ liệu ...
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </PerfectScrollbar>
    </div>
  );
}

export default CheckInPage;
