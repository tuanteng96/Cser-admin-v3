import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useInfiniteQuery, useMutation } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";

import moment from "moment";
import { Form, Formik } from "formik";
import PickerClassAddEdit from "./PickerClassAddEdit";
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

function PickerClass({ children, TimeOpen, TimeClose }) {
  const { AuthCrStockID } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    StockID: AuthCrStockID,
    From: null,
    To: null,
    Pi: 1,
    Ps: 20,
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        StockID: AuthCrStockID,
        From: new Date(),
        To: new Date(),
        Pi: 1,
        Ps: 20,
      });
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
    queryKey: ["CalendarClass", { filters }],
    queryFn: async ({ pageParam = 1 }) => {
      let data = await CalendarCrud.getCalendarClass({
        ...filters,
        // From: moment(filters.From).format("YYYY-MM-DD"),
        // To: moment(filters.To).format("YYYY-MM-DD"),
        To: null,
        From: null,
        Pi: pageParam,
        Ps: 20,
      });
      return data;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.Pi === lastPage.PCount ? undefined : lastPage.Pi + 1,
    keepPreviousData: true,
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
        width: 180,
        cellRenderer: ({ rowData }) => (
          <div>{moment(rowData.CreateDate).format("DD-MM-YYYY")}</div>
        ),
        sortable: false,
      },
      {
        key: "Title",
        title: "Lớp",
        dataKey: "Title",
        width: 300,
        sortable: false,
      },
      {
        key: "Stock.Title",
        title: "Cơ sở",
        dataKey: "Stock.Title",
        width: 300,
        sortable: false,
      },
      {
        key: "MemberTotal",
        title: "Học viên",
        dataKey: "MemberTotal",
        width: 180,
        sortable: false,
      },
      {
        key: "Minutes",
        title: "Thời gian học",
        dataKey: "Minutes",
        width: 180,
        sortable: false,
      },
      {
        key: "#",
        title: "#",
        dataKey: "#",
        width: 120,
        sortable: false,
        headerClassName: () => "justify-center",
        cellRenderer: ({ rowData }) => (
          <div className="flex justify-center w-full gap-1.5">
            <PickerClassAddEdit rowData={rowData}>
              {({ open }) => (
                <button
                  onClick={open}
                  type="button"
                  className="w-[32px] h-[32px] bg-primary rounded-[4px] text-white cursor-pointer flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-[18px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              )}
            </PickerClassAddEdit>
            <button
              onClick={() => onDelete(rowData)}
              type="button"
              className="w-[32px] h-[32px] bg-danger rounded-[4px] text-white cursor-pointer flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-[18px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        ),
        frozen: "right",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const deleteMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.deleteCalendarClass(body);
      await refetch();
      return rs;
    },
  });

  const onDelete = (item) => {
    Swal.fire({
      icon: "warning",
      title: "Xoá lớp này ?",
      html: `Bạn có chắc chắn muốn xoá lớp <span>${item.Title}</span>. Hành động sẽ không được hoàn tác khi thực hiện.`,
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
          await deleteMutation.mutateAsync({ delete: [item.ID] });
          resolve();
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        window?.top?.toastr?.success("Xoá thành công.", "", {
          timeOut: 200,
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
              <div className="text-xl font-medium">Cài đặt lớp học</div>
              <Formik
                initialValues={filters}
                onSubmit={async (values) => {
                  if (
                    values.From !== filters.From ||
                    values.To !== filters.To
                  ) {
                    setFilters((prevState) => ({
                      ...prevState,
                      ...values,
                    }));
                  } else {
                    refetch();
                  }
                }}
              >
                {(formikProps) => {
                  // const {
                  //   values,
                  //   setFieldValue,
                  //   handleBlur,
                  //   handleChange,
                  // } = formikProps;

                  return (
                    <Form className="flex gap-3">
                      {/* <div className="w-[150px]">
                        <DatePicker
                          locale={vi}
                          selected={values.From ? new Date(values.From) : null}
                          onChange={(date) => setFieldValue("From", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn từ ngày"
                        />
                      </div>
                      <div className="w-[150px]">
                        <DatePicker
                          locale={vi}
                          selected={values.To ? new Date(values.To) : null}
                          onChange={(date) => setFieldValue("To", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn đến ngày"
                        />
                      </div> */}
                      <button
                        type="button"
                        className="rounded-[4px] w-11 ml-3 text-primary"
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
                      <PickerClassAddEdit>
                        {({ open }) => (
                          <button
                            onClick={open}
                            type="button"
                            className="rounded-[4px] px-4 text-white bg-success"
                          >
                            Thêm mới
                          </button>
                        )}
                      </PickerClassAddEdit>

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

export default PickerClass;
