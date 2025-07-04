import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";
import moment from "moment";
import vi from "date-fns/locale/vi";
import { useWindowSize } from "../../../../hooks/useWindowSize";
import clsx from "clsx";

function PickerReportStaffService({ children }) {
  const { AuthCrStockID, checkout_time } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      checkout_time: JsonConfig?.Admin?.checkout_time || "",
    })
  );

  const [visible, setVisible] = useState(false);
  const [CrDate, setCrDate] = useState(new Date());

  let { width } = useWindowSize();

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["ListReportStaffService", { visible, CrDate }],
    queryFn: async () => {
      let isSkips = false;

      let DateStart = null;
      let DateEnd = null;

      if (checkout_time) {
        let CrIn = moment()
          .subtract(1, "days")
          .set({
            hours: checkout_time.split(";")[0].split(":")[0],
            minute: checkout_time.split(";")[0].split(":")[1],
          });
        let CrInEnd = moment()
          .subtract(1, "days")
          .set({
            hours: "23",
            minute: "59",
          });
        let CrOut = moment().set({
          hours: "00",
          minute: "00",
        });
        let CrOutEnd = moment().set({
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
        });

        let now = moment();

        if (now.isBetween(CrIn, CrInEnd, null, "[]")) {
          DateEnd = moment(CrDate)
            .add(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .format("DD/MM/YYYY HH:mm");
        } else if (now.isBetween(CrOut, CrOutEnd, null, "[]")) {
          isSkips = true;
          DateStart = moment(CrDate)
            .subtract(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .format("DD/MM/YYYY HH:mm");
          DateEnd = moment(CrDate)
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .format("DD/MM/YYYY HH:mm");
        } else {
          DateStart = moment(CrDate)
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .format("DD/MM/YYYY HH:mm");
          DateEnd = moment(CrDate)
            .add(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .format("DD/MM/YYYY HH:mm");
        }
      }

      let { result: rs3 } = await CalendarCrud.getReportService({
        StockID: AuthCrStockID,
        DateEnd: DateEnd || moment(CrDate).format("DD/MM/YYYY HH:mm"),
        DateStart: DateStart || moment(CrDate).format("DD/MM/YYYY HH:mm"),
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
        From: moment(CrDate)
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        To: moment(CrDate)
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        StockID: AuthCrStockID,
        key: "",
      });

      let CheckIns = rs4.map((x) => ({
        UserID: x.UserID,
        CheckIn: x.Dates[0].WorkTrack?.CheckIn || "",
        CheckOut: x.Dates[0].WorkTrack?.CheckOut || "",
        FullName: x.FullName,
      }));

      let STAFFS = [];

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
          if (u?.CheckIn) {
            STAFFS.push({
              FullName: u?.FullName,
              ID: u?.UserID,
              CheckIn: u?.CheckIn || null,
              CheckOut: u?.CheckOut || null,
              Items: [],
            });
          }
        }
      }

      STAFFS = STAFFS.map((x) => ({
        ...x,
        ValueOf: x.CheckIn
          ? moment(x.CheckIn).valueOf()
          : moment()
              .add(1, "years")
              .valueOf(),
      })).sort((a, b) => a.ValueOf - b.ValueOf);

      return STAFFS || [];
    },
    enabled: Boolean(CrDate) && visible,
    keepPreviousData: true,
  });

  const onHide = () => setVisible(false);

  const columns = useMemo(
    () => [
      {
        key: "FullName",
        title: "Nhân viên",
        dataKey: "FullName",
        width: width > 767 ? 350 : 180,
        sortable: false,
      },
      {
        key: "CheckIn",
        title: "Giờ vào",
        dataKey: "CheckIn",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.CheckIn ? (
              <>{moment(rowData?.CheckIn).format("HH:mm DD-MM-YYYY")}</>
            ) : (
              <></>
            )}
          </>
        ),
        width: 200,
        sortable: false,
      },
      {
        key: "CheckOut",
        title: "Giờ ra",
        dataKey: "CheckOut",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.CheckOut ? (
              <>{moment(rowData?.CheckOut).format("HH:mm DD-MM-YYYY")}</>
            ) : (
              <></>
            )}
          </>
        ),
        width: 200,
        sortable: false,
      },
      {
        key: "Items.length",
        title: "Tổng ca thực hiện",
        dataKey: "Items.length",
        cellRenderer: ({ rowData }) => <>{rowData?.Items.length}</>,
        width: 200,
        sortable: false,
      },
      {
        key: "Items",
        title: "Dịch vụ thực hiện",
        dataKey: "Items",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.Items && rowData?.Items.length > 0 ? (
              rowData?.Items.map((x, index) => (
                <span key={index}>
                  <span
                    className={clsx(x.Status === "doing" && "text-warning")}
                  >
                    {x.ProServiceName} {x.IsMemberSet && "(YC)"}
                  </span>
                  {rowData?.Items.length - 1 !== index && (
                    <span className="pr-1">,</span>
                  )}
                </span>
              ))
            ) : (
              <></>
            )}
          </>
        ),
        width: 400,
        sortable: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width]
  );

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b md:flex-row flex-col">
              <div className="hidden text-xl font-medium lg:block">
                Dịch vụ thực hiện
              </div>
              <div className="flex w-full gap-3 lg:w-auto">
                <div className="lg:w-[150px] flex-1">
                  <DatePicker
                    locale={vi}
                    selected={CrDate ? new Date(CrDate) : null}
                    onChange={(date) => setCrDate(date)}
                    className="!h-11 form-control !rounded-[4px] !text-[15px]"
                    shouldCloseOnSelect={true}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày"
                  />
                </div>
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
            <div className="relative p-4 grow lg:h-[calc(100%-73px)]">
              <AutoResizer>
                {({ width, height }) => (
                  <Table
                    key="ID"
                    fixed
                    width={width}
                    height={height}
                    columns={columns}
                    data={data}
                    disabled={isLoading}
                    loadingMore={isFetching}
                    // onEndReachedThreshold={300}
                    // onEndReached={fetchNextPage}
                    //overlayRenderer={this.renderOverlay}
                    //emptyRenderer={this.renderEmpty}
                    ignoreFunctionInColumnCompare={false}
                    estimatedRowHeight={80}
                    //rowHeight={80}
                    emptyRenderer={() =>
                      !isLoading && !isFetching ? (
                        <div className="flex items-center justify-center w-full h-full">
                          Không có dữ liệu
                        </div>
                      ) : (
                        <>
                          <div className="left-0 z-50 flex items-center justify-center w-full h-full">
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
                        </>
                      )
                    }
                  />
                )}
              </AutoResizer>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default PickerReportStaffService;
