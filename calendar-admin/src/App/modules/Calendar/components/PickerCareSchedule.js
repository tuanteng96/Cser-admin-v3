import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";
import Text from "react-texty";
import moment from "moment";
import vi from "date-fns/locale/vi";
import SelectMember from "../../../../components/Select/SelectMember/SelectMember";
import { Form, Formik } from "formik";

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

function PickerCareSchedule({ children, TimeOpen, TimeClose }) {
  const { AuthCrStockID } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    MemberIDs: [],
    StockID: [AuthCrStockID],
    DateStart: null,
    DateEnd: null,
    Pi: 1,
    Ps: 15,
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        MemberIDs: "",
        StockID: [AuthCrStockID],
        DateStart: new Date(),
        DateEnd: new Date(),
        Pi: 1,
        Ps: 20,
      });
    }
    else {
      setFilters({
        MemberIDs: "",
        StockID: [AuthCrStockID],
        DateStart: null,
        DateEnd: null,
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
    queryKey: ["CareSchedule", { filters }],
    queryFn: async ({ pageParam = 1 }) => {
      let data = await CalendarCrud.getCareSchedule({
        StockID: [AuthCrStockID],
        DateStart: moment(filters.DateStart).format("YYYY-MM-DD"),
        DateEnd: moment(filters.DateEnd).format("YYYY-MM-DD"),
        Pi: pageParam,
        Ps: 20,
        MemberIDs: filters.MemberIDs && filters.MemberIDs.length > 0 ? filters?.MemberIDs.map(x => x.value) : [],
      });
      return data;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.Pi === lastPage.PCount ? undefined : lastPage.Pi + 1,
    keepPreviousData: true,
    enabled: Boolean(filters.DateStart) && visible,
  });

  const Lists = formatArray.useInfiniteQuery(data?.pages, "Items");

  const onHide = () => setVisible(false);

  const columns = useMemo(
    () => [
      {
        key: "CreateDate",
        title: "Ngày làm dịch vụ",
        dataKey: "CreateDate",
        width: 200,
        cellRenderer: ({ rowData }) => (
          <div>{moment(rowData.CreateDate).format("HH:mm DD-MM-YYYY")}</div>
        ),
        sortable: false,
      },
      {
        key: "StockTitle",
        title: "Cơ sở",
        dataKey: "StockTitle",
        width: 250,
        sortable: false,
      },
      {
        key: "MemberID",
        title: "ID KH",
        dataKey: "MemberID",
        width: 100,
        sortable: false,
      },
      {
        key: "FullName",
        title: "Khách hàng",
        dataKey: "FullName",
        width: 250,
        sortable: false,
      },
      {
        key: "MobilePhone",
        title: "Số điện thoại",
        dataKey: "MobilePhone",
        width: 180,
        sortable: false,
      },
      {
        key: "OrderTitle",
        title: "Dịch vụ",
        dataKey: "OrderTitle",
        width: 300,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text className="flex-1" tooltipMaxWidth={280}>
            {rowData.OrderTitle}
          </Text>
        ),
      },
      {
        key: "SendDate",
        title: "Ngày chăm sóc",
        dataKey: "SendDate",
        width: 200,
        cellRenderer: ({ rowData }) => (
          <div>{moment(rowData.SendDate).format("DD-MM-YYYY")}</div>
        ),
        sortable: false,
      },
      {
        key: "Title",
        title: "Tiêu đề gửi",
        dataKey: "Title",
        width: 280,
        sortable: false,
      },
      {
        key: "Content",
        title: "Nội dung gửi",
        dataKey: "Content",
        width: 350,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <Text tooltipMaxWidth={280}>{rowData.Content}</Text>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b">
              <div className="text-xl font-medium">Lịch chăm sóc</div>
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
                      <div>
                        <SelectMember
                          menuPlacement="bottom"
                          isMulti
                          className="select-control select-control-md w-[300px]"
                          classNamePrefix="select"
                          name="MemberIDs"
                          value={values.MemberIDs}
                          onChange={(option) =>
                            setFieldValue("MemberIDs", option, false)
                          }
                          isClearable
                          isSearchable
                          placeholder="Chọn khách hàng"
                          noOptionsMessage={({ inputValue }) =>
                            !inputValue
                              ? "Nhập thông tin khách hàng cần tìm ?"
                              : "Không tìm thấy khách hàng"
                          }
                          menuPortalTarget={document.body}
                          //defaultOptions={false}
                        />
                      </div>
                      <div className="w-[150px]">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.DateStart ? new Date(values.DateStart) : null
                          }
                          onChange={(date) => setFieldValue("DateStart", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn từ ngày"
                        />
                      </div>
                      <div className="w-[150px]">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.DateEnd ? new Date(values.DateEnd) : null
                          }
                          onChange={(date) => setFieldValue("DateEnd", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn đến ngày"
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
                    //estimatedRowHeight={100}
                    rowHeight={100}
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

export default PickerCareSchedule;
