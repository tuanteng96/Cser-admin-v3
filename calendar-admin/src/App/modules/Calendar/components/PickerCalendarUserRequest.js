import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";

import moment from "moment";

import { useRoles } from "../../../../hooks/useRoles";
import PickerUserRequestFilter from "./PickerUserRequestFilter";
import Swal from "sweetalert2";

let formatArray = {
  useInfiniteQuery: (page, key = "data") => {
    let newPages = [];
    if (!page || !page[0]) return newPages;
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x);
      }
    }
    return newPages;
  },
};

function PickerCalendarUserRequest({ children }) {
  const queryClient = useQueryClient();

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const { AuthCrStockID } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    ClassIDs: null,
    TeachIDs: null,
    StockID: null,
    DateStart: null,
    DateEnd: null,
    BeginFrom: new Date(),
    BeginTo: new Date(),
    Status: "",
    WorkingTime: "",
    Pi: 1,
    Ps: 30,
    UserRequest: "1",
  });

  useEffect(() => {
    if (visible) {
      setFilters((prevState) => ({
        ...prevState,
        StockID: AuthCrStockID,
        BeginFrom: new Date(),
        BeginTo: new Date(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["CalendarMemberReport", { filters }],
    queryFn: async ({ pageParam = 1 }) => {
      let data = await CalendarCrud.getCalendarClassMembers({
        ...filters,
        StockID: filters?.StockID
          ? [filters?.StockID]
          : adminTools_byStock?.StockRoles?.map((x) => x.value),
        ClassIDs: filters.ClassIDs ? [filters.ClassIDs?.value] : [],
        TeachIDs: filters.TeachIDs ? [filters.TeachIDs?.value] : [],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(filters.BeginFrom)
          .set({
            hour: "00",
            minute: "00",
            second: "00",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(filters.BeginTo)
          .set({
            hour: "23",
            minute: "59",
            second: "59",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Status: filters?.Status ? filters?.Status?.value : "",
        WorkingTime: filters?.WorkingTime ? filters?.WorkingTime?.value : "",
        Pi: pageParam,
        Ps: 30,
      });
      let { Items } = await CalendarCrud.getCalendarClassMembers({
        StockID: filters?.StockID
          ? [filters?.StockID]
          : adminTools_byStock?.StockRoles?.map((x) => x.value),
        ClassIDs: [],
        TeachIDs: [],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(filters.BeginFrom)
          .set({
            hour: "00",
            minute: "00",
            second: "00",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(filters.BeginTo)
          .set({
            hour: "23",
            minute: "59",
            second: "59",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Status: "",
        WorkingTime: "",
        Pi: 1,
        Ps: 1000,
      });

      let result = {
        ...data,
        Items:
          data.Items && data.Items.length > 0
            ? data.Items.map((item) => {
                let obj = { ...item };
                let index =
                  Items &&
                  Items.findIndex(
                    (x) =>
                      item.Member?.UserRequest?.ID === x.TeacherID &&
                      moment(x.TimeBegin, "YYYY-MM-DD HH:mm").format(
                        "DD-MM-YYYY HH:mm"
                      ) ===
                        moment(item.TimeBegin, "YYYY-MM-DD HH:mm").format(
                          "DD-MM-YYYY HH:mm"
                        )
                  );
                if (index > -1) {
                  obj.AlreadyScheduled = Items[index];
                }
                return obj;
              })
            : [],
      };

      return result;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.Pi === lastPage.PCount ? undefined : lastPage.Pi + 1,
    enabled: visible,
  });

  const Lists = formatArray.useInfiniteQuery(data?.pages, "Items");

  const onHide = () => setVisible(false);

  const columns = useMemo(
    () => [
      {
        key: "CreateDate",
        title: "Ngày",
        dataKey: "CreateDate",
        width: 150,
        cellRenderer: ({ rowData }) => (
          <div>{moment(rowData.TimeBegin).format("DD-MM-YYYY")}</div>
        ),
        sortable: false,
      },
      {
        key: "TimeBegin",
        title: "Thời gian",
        dataKey: "TimeBegin",
        width: 150,
        cellRenderer: ({ rowData }) => (
          <div>
            {moment(rowData.TimeBegin).format("HH:mm")}
            <span className="px-1">-</span>
            {moment(rowData.TimeBegin)
              .add(rowData.Class.Minutes, "minute")
              .format("HH:mm")}
          </div>
        ),
        sortable: false,
      },
      {
        key: "Class.Title",
        title: "Lớp",
        dataKey: "Class.Title",
        width: 300,
        sortable: false,
      },
      {
        key: "Stock.Title",
        title: "Cơ sở",
        dataKey: "Stock.Title",
        width: 250,
        sortable: false,
      },
      {
        key: "Member.UserRequest.FullName",
        title: "Huấn luyện viên yêu cầu",
        dataKey: "Member.UserRequest.FullName",
        cellRenderer: ({ rowData }) => (
          <div>
            <div>{rowData?.Member?.UserRequest?.FullName}</div>
            {rowData?.AlreadyScheduled && (
              <div className="text-danger text-[13px]">(Đã bận)</div>
            )}
          </div>
        ),
        width: 220,
        sortable: false,
      },
      {
        key: "Member.Lists",
        title: "Học viên",
        dataKey: "Member.Lists",
        cellRenderer: ({ rowData }) => (
          <div>
            {rowData?.Member?.Lists &&
              rowData.Member.Lists.map((x, i) => (
                <div key={i}>
                  <div>{x.Member.FullName}</div>
                  <div>{x.Member.Phone}</div>
                </div>
              ))}
          </div>
        ),
        width: 300,
        sortable: false,
      },
      // {
      //   key: "Status",
      //   title: "Trạng thái",
      //   dataKey: "Status",
      //   cellRenderer: ({ rowData }) => (
      //     <div className={clsx(rowData?.Member?.Status && "text-success")}>
      //       {rowData?.Member?.Status && "Hoàn thành"}
      //     </div>
      //   ),
      //   width: 200,
      //   sortable: false,
      // },
      {
        key: "IsOverTime",
        title: "Loại giờ làm việc",
        dataKey: "IsOverTime",
        cellRenderer: ({ rowData }) =>
          rowData?.Member?.IsOverTime && "Ngoài giờ",
        width: 250,
        sortable: false,
      },
      {
        key: "#",
        title: "#",
        dataKey: "#",
        cellRenderer: ({ rowData }) => (
          <div className="flex justify-center w-full gap-3">
            <button
              className="disabled:opacity-50 h-[32px] text-[13px] bg-primary px-4 rounded-[4px] text-white cursor-pointer flex items-center justify-center"
              type="button"
              onClick={() => onConfirm(rowData)}
            >
              Xác nhận
            </button>
            <button
              onClick={() => onDelete(rowData)}
              className="disabled:opacity-50 text-[13px] h-[32px] bg-danger rounded-[4px] px-3 text-white cursor-pointer flex items-center justify-center"
              type="button"
            >
              Huỷ lịch
            </button>
          </div>
        ),
        width: 210,
        sortable: false,
        frozen: "right",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.CalendarClassMembersAddEdit(body);
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ data, update }) => {
      let rs = await CalendarCrud.CalendarClassMembersDelete(data);
      await CalendarCrud.CalendarClassMembersUpdateOs(update);
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const onConfirm = (rowData) => {
    Swal.fire({
      icon: "warning",
      title: "Xác nhận yêu cầu HLV ?",
      html: `Bạn có chắc chắn xác nhận huấn luyện viên ${
        rowData?.Member?.UserRequest?.FullName
      } cho lớp ${rowData?.Class?.Title} lúc ${moment(rowData.TimeBegin).format(
        "HH:mm DD-MM-YYYY"
      )} ?`,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      showCloseButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success",
        //cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let { Items } = await CalendarCrud.getCalendarClassMembers({
            StockID: filters?.StockID
              ? [filters?.StockID]
              : adminTools_byStock?.StockRoles?.map((x) => x.value),
            ClassIDs: [],
            TeachIDs: [],
            DateStart: null,
            DateEnd: null,
            BeginFrom: moment(rowData.TimeBegin)
              .set({
                hour: "00",
                minute: "00",
                second: "00",
              })
              .format("YYYY-MM-DD HH:mm:ss"),
            BeginTo: moment(rowData.TimeBegin)
              .set({
                hour: "23",
                minute: "59",
                second: "59",
              })
              .format("YYYY-MM-DD HH:mm:ss"),
            Status: "",
            WorkingTime: "",
            Pi: 1,
            Ps: 1000,
          });

          let index =
            Items &&
            Items.findIndex(
              (x) =>
                moment(x.TimeBegin).format("HH:mm DD-MM-YYYY") ===
                  moment(rowData.TimeBegin).format("HH:mm DD-MM-YYYY") &&
                rowData?.Member?.UserRequest?.ID === x.TeacherID
            );

          if (index === -1) {
            let Members = {
              ...rowData?.Member,
              HistoryCoachs: [
                ...(rowData?.Member?.HistoryCoachs || []),
                {
                  CreateDate: moment().format("YYYY-MM-DD HH:mm"),
                  Staff: {
                    StaffID: window?.top?.Info?.User?.ID,
                    ID: window?.top?.Info?.User?.ID,
                    FullName: window?.top?.Info?.User?.FullName,
                  },
                  Coach: {
                    ID: rowData?.Member?.UserRequest?.ID,
                    FullName: rowData?.Member?.UserRequest?.FullName,
                  },
                },
              ],
            };
            Members.UserRequestConfirm = rowData?.Member?.UserRequest;
            delete Members.UserRequest;
            let values = {
              ID: rowData?.ID,
              CreateDate: moment(rowData.CreateDate, "YYYY-MM-DD HH:mm").format(
                "YYYY-MM-DD HH:mm"
              ),
              StockID: rowData?.StockID,
              TimeBegin: moment(rowData.TimeBegin).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
              OrderServiceClassID: rowData?.OrderServiceClassID,
              TeacherID: rowData?.Member?.UserRequest?.ID,
              Member: Members,
              MemberID: "",
              Desc: "",
            };
            let result = await addMutation.mutateAsync({
              arr: [values],
            });
            resolve(result);
          } else {
            resolve({
              error: true,
              rowData: rowData,
            });
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value?.error) {
          Swal.fire({
            title: "Không thành công ?",
            text: `Huấn luyện viên ${
              result.value?.rowData?.Member?.UserRequest?.FullName
            } đã bận vào lúc ${moment(result.value?.rowData?.TimeBegin).format(
              "HH:mm DD-MM-YYYY"
            )}.`,
            icon: "error",
          });
        } else {
          if (result.value?.Updated && result.value?.Updated.length > 0) {
            window?.top?.noti27?.LOP_HOC &&
              window?.top?.noti27?.LOP_HOC({
                type: "Duyệt yêu cầu HLV",
                Class: { ...rowData?.Class, TimeBegin: rowData.TimeBegin },
                RefUserIds: [
                  {
                    ...rowData?.Member?.UserRequest,
                  },
                ],
                Members: result.value?.Updated[0]?.Member?.Lists
                  ? result.value?.Updated[0]?.Member?.Lists.map((x) => x.Member)
                  : [],
                Stock: rowData.Stock,
              });
          }

          window?.top?.toastr?.success("Xác nhận thành công.", "", {
            timeOut: 600,
          });
        }
      }
    });
  };

  const onDelete = (rowData) => {
    console.log(rowData);
    Swal.fire({
      icon: "warning",
      title: "Xác nhận huỷ lịch ?",
      html: `Bạn có chắc chắn muốn huỷ lịch lớp ${
        rowData?.Class?.Title
      } lúc ${moment(rowData.TimeBegin).format("HH:mm DD-MM-YYYY")} ?`,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      showCloseButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success",
        //cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          await deleteMutation.mutateAsync({
            data: {
              delete: [rowData?.ID],
            },
            update: {
              arr: [
                {
                  ID: rowData?.Member?.Lists[0]?.Os?.ID,
                  Desc: "",
                  UserID: 0,
                },
              ],
            },
          });
          resolve();
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        window?.top?.noti27?.LOP_HOC &&
          window?.top?.noti27?.LOP_HOC({
            type: "Hủy yêu cầu HLV",
            Class: { ...rowData?.Class, TimeBegin: rowData.TimeBegin },
            RefUserIds: [{ ...rowData?.Member?.UserRequest }],
            MemberIds: rowData?.Member?.Lists
              ? rowData?.Member?.Lists.map((x) => x.Member)
              : [],
            Stock: rowData.Stock,
          });
        window?.top?.toastr?.success("Xác nhận thành công.", "", {
          timeOut: 600,
        });
      }
    });
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
              <div className="text-xl font-medium">
                Danh sách yêu cầu giáo viên (
                {data?.pages && data?.pages.length > 0
                  ? data?.pages[0].Total
                  : 0}
                )
              </div>
              <div className="flex gap-3">
                <PickerUserRequestFilter
                  filters={filters}
                  onChange={(val) =>
                    setFilters((prevState) => ({
                      ...prevState,
                      ...val,
                    }))
                  }
                >
                  {({ open }) => (
                    <button
                      onClick={open}
                      type="button"
                      className="rounded-[4px] px-4 text-white bg-primary"
                    >
                      Bộ lọc
                    </button>
                  )}
                </PickerUserRequestFilter>

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
                    rowKey="ID"
                    fixed
                    width={width}
                    height={height}
                    columns={columns}
                    data={Lists}
                    disabled={isLoading}
                    loadingMore={isFetching}
                    onEndReachedThreshold={300}
                    onEndReached={fetchNextPage}
                    //overlayRenderer={this.renderOverlay}
                    //emptyRenderer={this.renderEmpty}
                    ignoreFunctionInColumnCompare={false}
                    estimatedRowHeight={60}
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

export default PickerCalendarUserRequest;
