import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import moment from "moment";
import vi from "date-fns/locale/vi";
import { PriceHelper } from "../../../../helpers/PriceHelper";
import clsx from "clsx";

function PickerReportMassage({ children }) {
  const { AuthCrStockID, checkout_time, TU_DONG_TIP } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      GTimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      GTimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
      checkout_time: JsonConfig?.Admin?.checkout_time || "",
      TU_DONG_TIP: JsonConfig?.Admin?.TU_DONG_TIP || false,
    })
  );

  const [visible, setVisible] = useState(false);

  let [CrDate, setCrDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setCrDate(moment().toDate());
    } else {
      setCrDate(null);
    }
  }, [visible]);

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["ListCurrentCalendars", { visible, CrDate }],
    queryFn: async () => {
      let objTime = {
        hours: "23",
        minute: "59",
      };
      if (checkout_time && TU_DONG_TIP) {
        objTime = {
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
        };
      }
      let { result: rs1 } = await CalendarCrud.getReportOverallSales({
        DateEnd: moment(CrDate).format("DD/MM/YYYY"),
        DateStart: moment(CrDate).format("DD/MM/YYYY"),
        StockID: AuthCrStockID,
      });
      let { result: rs2 } = await CalendarCrud.getReportSellOut({
        StockID: AuthCrStockID,
        DateEnd: moment(CrDate).format("DD/MM/YYYY"),
        DateStart: moment(CrDate).format("DD/MM/YYYY"),
        BrandIds: "",
        CategoriesIds: "",
        ProductIds: "",
        TimeToReal: 1,
        Voucher: "",
        Payment: "",
        IsMember: "",
      });
      let { result: rs3 } = await CalendarCrud.getReportService({
        StockID: AuthCrStockID,
        DateEnd: moment(CrDate)
          .add(checkout_time && TU_DONG_TIP ? 1 : 0, "days")
          .set(objTime)
          .format("DD/MM/YYYY HH:mm"),
        DateStart: moment(CrDate)
          .set({ hours: "00", minute: "00" })
          .format("DD/MM/YYYY HH:mm"),
        Pi: 1,
        Ps: 5000,
        MemberID: "",
        Status: "",
        Warranty: "",
        StaffID: "",
        StarRating: "",
        Dich_vu_chuyen_doi_khong_hop_le: 0,
        IsMemberSet: "",
        CardServiceID: "",
        ServiceOriginalID: "",
        TransfUserID: "",
        ShowsX: "2",
      });
      let { list: rs4 } = await CalendarCrud.getAllWorkSheet({
        From: moment(CrDate).format("DD/MM/YYYY"),
        To: moment(CrDate).format("DD/MM/YYYY"),
        StockID: AuthCrStockID,
        key: "",
      });

      let TIP = null;
      let TONG_THANH_TOAN = 0;
      if (rs2 && rs2.length > 0) {
        let index = rs2.findIndex(
          (x) => x.Format === 1 && x.ProdTitle === "TIP"
        );
        if (index > -1) {
          TIP = rs2[index];
        }
        TONG_THANH_TOAN = rs2
          .map((x) => x.CK + x.QT + x.TM + x.TT + x.Vi)
          .reduce((partialSum, a) => partialSum + a, 0);
      }

      let CheckIns = rs4.map((x) => ({
        UserID: x.UserID,
        CheckIn: x.Dates[0].WorkTrack?.CheckIn || "",
        FullName: x.FullName,
      }));

      let STAFFS = [];
      let SERVICES = [];

      if (rs3?.Items && rs3?.Items.length > 0) {
        for (let item of rs3.Items) {
          if (item.StaffSalaries && item.StaffSalaries.length > 0) {
            for (let staff of item.StaffSalaries) {
              let index = STAFFS.findIndex((x) => x.ID === staff?.StaffId);
              if (index > -1) {
                STAFFS[index].Items = [...STAFFS[index].Items, item];
              } else {
                STAFFS.push({
                  FullName: staff?.FullName,
                  ID: staff?.StaffId,
                  Items: [item],
                });
              }
            }
          }
          let indexSv = SERVICES.findIndex(
            (x) => x?.ProServiceId === item?.ProServiceId
          );
          if (indexSv > -1) {
            SERVICES[indexSv].Items = [...SERVICES[indexSv].Items, item];
          } else {
            SERVICES.push({
              ProServiceId: item?.ProServiceId,
              ProServiceName: item?.ProServiceName,
              Items: [item],
            });
          }
        }
      }

      for (let u of CheckIns) {
        let index = STAFFS.findIndex((x) => x.ID === u.UserID);
        if (index > -1) {
          STAFFS[index].FullName = u?.FullName;
          STAFFS[index].ID = u?.UserID;
          STAFFS[index].CheckIn = u?.CheckIn || null;
          STAFFS[index].CheckOut = u?.CheckOut || null;
        } else {
          STAFFS.push({
            FullName: u?.FullName,
            ID: u?.UserID,
            CheckIn: u?.CheckIn || null,
            CheckOut: u?.CheckOut || null,
            Items: [],
          });
        }
      }

      STAFFS = STAFFS.map((x) => ({
        ...x,
        ValueOf: x.CheckIn ? moment(x.CheckIn).valueOf() : -1,
      })).sort((a, b) => a.ValueOf - b.ValueOf);

      return {
        Today: {
          ...rs1,
          TIP,
          TONG_THANH_TOAN,
          SP_BAN_RA:
            rs2 && rs2.length > 0 ? rs2.filter((x) => x.Format === 1) : [],
          DV_BAN_RA:
            rs2 && rs2.length > 0 ? rs2.filter((x) => x.Format === 2) : [],
        },
        STAFFS: [
          ...STAFFS.filter((x) => x.ValueOf > 0),
          ...STAFFS.filter((x) => x.ValueOf < 0),
        ],
        SERVICES,
      };
    },
    enabled: Boolean(CrDate) && visible,
    keepPreviousData: true,
  });

  const onHide = () => setVisible(false);

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b">
              <div className="text-xl font-medium">Thống kê</div>
              <div className="flex gap-3">
                <div className="w-[160px]">
                  <DatePicker
                    locale={vi}
                    selected={CrDate}
                    onChange={(date) => setCrDate(date)}
                    className="!h-11 form-control !rounded-[4px] !text-[15px]"
                    shouldCloseOnSelect={true}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn thời gian"
                    // showTimeSelect
                    // showTimeSelectOnly
                    // timeIntervals={1}
                  />
                </div>
                {/* <button
                        type="submit"
                        className="rounded-[4px] w-[80px] text-white bg-primary"
                      >
                        {!isLoading && !isFetching && <span>Kiểm tra</span>}

                        {(isLoading || isFetching) && (
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        )}
                      </button> */}
                <button
                  type="button"
                  className="rounded-[4px] w-11 text-primary"
                  onClick={refetch}
                >
                  {!isLoading && !isFetching && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  )}

                  {(isLoading || isFetching) && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                </button>
                <div className="h-11 w-[1px] bg-gray-300"></div>
                <div
                  className="flex items-center justify-center w-12 cursor-pointer h-11"
                  onClick={onHide}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative p-4 overflow-auto grow bg-[#ededf1]">
              {isLoading && (
                <>
                  <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-[20px] gap-4">
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tổng đơn hàng</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Đã thanh toán</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chờ thanh toán</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền Spa</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền TIP</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chuyển khoản</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Quẹt thẻ</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền mặt</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {!isLoading && (
                <>
                  <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-[20px] gap-4">
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tổng đơn hàng</div>
                        <div className="text-lg font-semibold text-primary font-title">
                          {PriceHelper.formatVND(data?.Today?.DSo_Ngay || 0)}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Đã thanh toán</div>
                        <div className="text-lg font-semibold text-success font-title">
                          {PriceHelper.formatVND(data?.Today?.DSo_TToan || 0)}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chờ thanh toán</div>
                        <div className="text-lg font-semibold text-warning font-title">
                          {PriceHelper.formatVND(
                            (data?.Today?.DSo_Ngay || 0) -
                              (data?.Today?.DSo_TToan || 0)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền Spa</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            (data?.Today?.TONG_THANH_TOAN || 0) -
                              (data?.Today?.TIP?.SumTopay || 0)
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền TIP</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.TIP?.SumTopay || 0
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chuyển khoản</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_CKhoan || 0
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Quẹt thẻ</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_QThe || 0
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền mặt</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_TMat || 0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-[20px] mt-[20px]">
                    <div className="bg-white rounded">
                      <div className="px-5 py-4 border-b">
                        <div className="text-lg font-medium uppercase">
                          Bán hàng
                        </div>
                      </div>
                      <div>
                        <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                          Sản phẩm
                        </div>
                        <div>
                          {data?.Today?.SP_BAN_RA &&
                          data?.Today?.SP_BAN_RA.length > 0 ? (
                            data?.Today?.SP_BAN_RA.map((item, index) => (
                              <div
                                className="flex border-b border-dashed last:!border-0 px-6 py-3"
                                key={index}
                              >
                                <div className="flex-1 font-light">
                                  {item?.ProdTitle} (x{item?.SumQTy})
                                </div>
                                <div className="w-[180px] text-right font-semibold font-title">
                                  {PriceHelper.formatVND(item?.SumTopay)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                              Không có dữ liệu.
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                          Dịch vụ
                        </div>
                        <div>
                          {data?.Today?.DV_BAN_RA &&
                          data?.Today?.DV_BAN_RA.length > 0 ? (
                            data?.Today?.DV_BAN_RA.map((item, index) => (
                              <div
                                className="flex justify-between border-b border-dashed last:!border-0 px-6 py-3"
                                key={index}
                              >
                                <div className="flex-1 font-light">
                                  {item?.ProdTitle} (x{item?.SumQTy})
                                </div>
                                <div className="w-[180px] text-right font-semibold font-title">
                                  {PriceHelper.formatVND(item?.SumTopay)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                              Không có dữ liệu.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="px-5 py-4 border-b">
                        <div className="text-lg font-medium uppercase">
                          Dịch vụ thực hiện
                        </div>
                      </div>
                      <div>
                        <div>
                          <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                            Theo nhân viên
                          </div>
                          <div>
                            {data?.STAFFS && data?.STAFFS.length > 0 ? (
                              data?.STAFFS.map((item, index) => (
                                <div
                                  className="flex flex-col border-b border-dashed last:!border-0 px-6 py-3"
                                  key={index}
                                >
                                  <div className="flex">
                                    <div
                                      className={clsx(
                                        "font-light",
                                        item.CheckOut && "text-danger"
                                      )}
                                    >
                                      {item?.FullName}
                                    </div>
                                    {item?.CheckIn && (
                                      <div className="ml-1 font-light font-title">
                                        ({moment(item?.CheckIn).format("HH:mm")}
                                        {item?.CheckOut && (
                                          <>
                                            <span className="px-1.5">-</span>
                                            {item?.CheckOut}
                                          </>
                                        )}
                                        )
                                      </div>
                                    )}

                                    <div className="ml-1 font-semibold font-title">
                                      ({item?.Items?.length})
                                    </div>
                                  </div>
                                  {item?.Items && item?.Items.length > 0 && (
                                    <div className="text-[13px] font-light leading-5 mt-px">
                                      {item?.Items.map((x, index) => (
                                        <span key={index}>
                                          <span
                                            className={clsx(
                                              x.Status === "doing" &&
                                                "text-warning"
                                            )}
                                          >
                                            {x.ProServiceName}{" "}
                                            {x.IsMemberSet && "(YC)"}
                                          </span>
                                          {item?.Items.length - 1 !== index && (
                                            <span>, </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                                Không có dữ liệu.
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                            Theo dịch vụ
                          </div>
                          <div>
                            {data?.SERVICES && data?.SERVICES.length > 0 ? (
                              data?.SERVICES.map((item, index) => (
                                <div
                                  className="flex border-b border-dashed last:!border-0 px-6 py-3"
                                  key={index}
                                >
                                  <div className="font-light">
                                    {item?.ProServiceName}
                                  </div>
                                  <div className="ml-1 font-semibold font-title">
                                    ({item?.Items?.length})
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                                Không có dữ liệu.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {isFetching && (
                <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-[calc(100vh-73px)] bg-white/50">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 text-gray-500 animate-spin fill-blue-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default PickerReportMassage;
