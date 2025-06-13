import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";
import moment from "moment";
import vi from "date-fns/locale/vi";
import { Form, Formik } from "formik";
import PickerTakeBreak from "./PickerTakeBreak";
import Swal from "sweetalert2";

function PickerOfflineSchedule({ children }) {
  const { AuthCrStockID } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    Key: "",
    StockID: [AuthCrStockID],
    CrDate: new Date(),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (visible) {
      setFilters({
        Key: "",
        StockID: [AuthCrStockID],
        CrDate: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["OfflineSchedule", { filters }],
    queryFn: async () => {
      let { data } = await CalendarCrud.getListStaffs({
        StockID: AuthCrStockID,
        Key: filters.Key,
      });
      let { list } = await CalendarCrud.getListStaffsOffline({
        StockID: AuthCrStockID,
        data: {
          pi: 1,
          ps: 5000,
          filter: {
            From: filters.CrDate
              ? moment(filters.CrDate).format("YYYY-MM-DD")
              : null,
            StockID: AuthCrStockID,
            To: filters.CrDate
              ? moment(filters.CrDate).format("YYYY-MM-DD")
              : null,
            UserIDs: "",
          },
        },
      });
      let newData = data ? [...data] : [];
      if (list && list.length > 0) {
        for (let item of list) {
          let index = newData.findIndex((x) => item?.User?.ID === x.id);
          if (index > -1) {
            newData[index]["Offline"] = item;
          }
        }
      }

      return newData;
    },
    keepPreviousData: true,
    enabled: visible,
  });

  const onHide = () => setVisible(false);

  const columns = useMemo(
    () => [
      {
        key: "text",
        title: "Họ tên nhân viên",
        dataKey: "text",
        width: 350,
        sortable: false,
      },
      {
        key: "TimeFrom",
        title: "Xin nghỉ từ",
        dataKey: "TimeFrom",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.Offline ? (
              <>{moment(rowData?.Offline?.From).format("HH:mm DD-MM-YYYY")}</>
            ) : (
              <></>
            )}
          </>
        ),
        width: 250,
        sortable: false,
      },
      {
        key: "TimeTo",
        title: "Xin nghỉ đến",
        dataKey: "TimeTo",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.Offline ? (
              <>{moment(rowData?.Offline?.To).format("HH:mm DD-MM-YYYY")}</>
            ) : (
              <></>
            )}
          </>
        ),
        width: 250,
        sortable: false,
      },
      {
        key: "Offline.Desc",
        title: "Lý do",
        dataKey: "Offline.Desc",
        width: 350,
        sortable: false,
      },
      {
        key: "Action",
        title: "#",
        dataKey: "Action",
        width: 210,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className="flex justify-center w-full gap-2">
            {rowData?.Offline ? (
              <>
                <PickerTakeBreak
                  AuthCrStockID={AuthCrStockID}
                  UserID={{ label: rowData?.text, value: rowData?.id }}
                  item={rowData?.Offline}
                >
                  {({ open }) => (
                    <button
                      onClick={open}
                      className="text-white rounded-[3px] bg-primary text-[13px] h-[35px] px-4"
                      type="button"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </PickerTakeBreak>

                <button
                  onClick={() => onDelete(rowData.Offline)}
                  className="text-white rounded-[3px] bg-danger text-[13px] h-[35px] px-4"
                  type="button"
                >
                  Huỷ
                </button>
              </>
            ) : (
              <PickerTakeBreak
                AuthCrStockID={AuthCrStockID}
                UserID={{ label: rowData?.text, value: rowData?.id }}
              >
                {({ open }) => (
                  <button
                    className="text-white rounded-[3px] bg-success text-[13px] h-[35px] px-4"
                    type="button"
                    onClick={open}
                  >
                    Xin nghỉ
                  </button>
                )}
              </PickerTakeBreak>
            )}
          </div>
        ),
        frozen: "right",
        headerClassName: "justify-center",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const deleteMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.editWorkOff(body);
      await queryClient.invalidateQueries({ queryKey: ["OfflineSchedule"] });
      await queryClient.invalidateQueries({
        queryKey: ["ListCalendarsMassage"],
      });
      return rs;
    },
  });

  const onDelete = ({ ID }) => {
    Swal.fire({
      title: "Xóa lịch nghỉ này",
      text: "Bạn đang muốn thực hiện xóa lịch nghỉ này ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Thực hiện",
      cancelButtonText: "Hủy",
      showLoaderOnConfirm: true,
      preConfirm: (login) =>
        new Promise((resolve, reject) => {
          deleteMutation.mutate(
            { delete: [ID] },
            {
              onSettled: () => {
                refetch().then(() => resolve());
              },
            }
          );
        }),
    }).then((result) => {
      if (result.isConfirmed) {
        window.top.toastr &&
          window.top.toastr.success("Xóa thành công", {
            timeOut: 1500,
          });
      }
    });
  };

  const rowClassName = ({ rowData }) => {
    if (rowData.Offline) {
      return "bg-danger-o-10";
    }
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b">
              <div className="text-xl font-medium">Quản lý lịch nghỉ</div>
              <Formik
                initialValues={filters}
                onSubmit={async (values) => {
                  setFilters((prevState) => ({
                    ...prevState,
                    ...values,
                  }));
                }}
              >
                {(formikProps) => {
                  const { values, setFieldValue } = formikProps;

                  return (
                    <Form className="flex gap-3">
                      <div className="w-[300px]">
                        <input
                          placeholder="Nhập tên nhân viên ..."
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          type="text"
                          value={values.Key}
                          onChange={(e) => setFieldValue("Key", e.target.value)}
                        />
                      </div>
                      <div className="w-[150px]">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.CrDate ? new Date(values.CrDate) : null
                          }
                          onChange={(date) => setFieldValue("CrDate", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn ngày"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-[4px] w-12 text-white bg-primary"
                      >
                        {!isLoading && !isFetching && <span>Lọc</span>}

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
                    </Form>
                  );
                }}
              </Formik>
            </div>
            <div className="relative p-4 grow lg:h-[calc(100%-73px)]">
              <AutoResizer>
                {({ width, height }) => (
                  <Table
                    key="id"
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
                    //estimatedRowHeight={100}
                    rowHeight={80}
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
                    rowClassName={rowClassName}
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

export default PickerOfflineSchedule;
