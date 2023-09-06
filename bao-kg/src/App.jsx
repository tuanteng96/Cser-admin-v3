import { useMemo, useState } from "react";
import { InputDatePicker } from "./partials/forms";
import { SelectMembers } from "./partials/select/SelectMembers";
import ReactBaseTable from "./partials/table/ReactBaseTable";
import moment from "moment";
import { useQuery } from "react-query";
import MembersAPI from "./api/members.api";
import { Cookies } from "./utils/cookies";

const startCurrentMonth = moment().startOf("month").format("MM/DD/YYYY");
const endCurrentMonth = moment().endOf("month").format("MM/DD/YYYY");

function App() {
  
  let StockID = Cookies.get("MemberSelectStockID");
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 25,
    filter: {
      MemberID: "",
      CreateDate: [startCurrentMonth, endCurrentMonth],
      "m.ByStockID": StockID || null,
    },
  });

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ["ListReportKG", filters],
    queryFn: async () => {
      let { data } = await MembersAPI.listReportKG({
        ...filters,
        filter: {
          ...filters.filter,
          MemberID: filters.filter.MemberID
            ? filters.filter.MemberID?.value
            : null,
          "m.ByStockID": StockID || null,
        },
      });
      return data || [];
    },
    keepPreviousData: true,
  });

  const columns = useMemo(
    () => [
      {
        key: "CreateDate",
        title: "Ngày",
        dataKey: "CreateDate",
        cellRenderer: ({ rowData }) =>
          moment(rowData?.CreateDate).format("DD-MM-YYYY"),
        width: 135,
        sortable: false,
      },
      {
        key: "Member.FullName",
        title: "Khách hàng",
        dataKey: "Member.FullName",
        width: 250,
        sortable: false,
      },
      {
        key: "Value",
        title: "Kilôgam",
        dataKey: "Value",
        cellRenderer: ({ rowData }) => `${rowData.Value} Kg`,
        width: 100,
        sortable: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const rowClassName = ({ columns, rowData, rowIndex }) => {
    //return "bg-danger text-white";
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <SelectMembers
            isClearable
            className="select-control"
            value={filters.filter.MemberID}
            onChange={(val) =>
              setFilters((prevState) => ({
                ...prevState,
                pi: 1,
                filter: {
                  ...prevState.filter,
                  MemberID: val || "",
                },
              }))
            }
          />
        </div>
        <div className="ml-3">
          <InputDatePicker
            showMonthYearPicker
            showFullMonthYearPicker
            placeholderText="Chọn tháng"
            dateFormat="MM/yyyy"
            onChange={(val) => {
              const startOfMonth = moment(val)
                .startOf("month")
                .format("MM/DD/YYYY");
              const endOfMonth = moment(val)
                .endOf("month")
                .format("MM/DD/YYYY");
              setFilters((prevState) => ({
                ...prevState,
                filter: {
                  ...prevState.filter,
                  CreateDate: [startOfMonth, endOfMonth],
                },
              }));
            }}
            selected={
              filters.filter.CreateDate.length > 0
                ? moment(filters.filter.CreateDate[0], "MM/DD/YYYY").toDate()
                : null
            }
          />
        </div>
      </div>
      <ReactBaseTable
        pagination
        wrapClassName="grow"
        rowKey="ID"
        columns={columns}
        data={data?.list || []}
        estimatedRowHeight={96}
        isPreviousData={isPreviousData}
        loading={isLoading || isPreviousData}
        pageCount={data?.pCount}
        pageOffset={Number(filters.pi)}
        pageSizes={Number(filters.ps)}
        onChange={({ pageIndex, pageSize }) => {
          setFilters((prevState) => ({
            ...prevState,
            pi: pageIndex,
            ps: pageSize,
          }));
        }}
        rowClassName={rowClassName}
      />
    </div>
  );
}

export default App;
