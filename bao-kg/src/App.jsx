import { useEffect, useMemo, useRef, useState } from "react";
import { InputDatePicker } from "./partials/forms";
import { SelectMembers } from "./partials/select/SelectMembers";
import ReactBaseTable from "./partials/table/ReactBaseTable";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "react-query";
import MembersAPI from "./api/members.api";
import { Cookies } from "./utils/cookies";
import { useWindowSize } from "@uidotdev/usehooks";
import PickerAdd from "./components/PickerAdd";
//import { useFloating, useClick, useInteractions } from "@floating-ui/react-dom";
import {
  useFloating,
  useClick,
  useInteractions,
  useDismiss,
} from "@floating-ui/react";
import { NumericFormat } from "react-number-format";

const startCurrentMonth = moment().startOf("month").format("MM/DD/YYYY");
const endCurrentMonth = moment().endOf("month").format("MM/DD/YYYY");

const EditableCell = ({ container, values, rowData, date }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(values);
  const queryClient = useQueryClient();

  useEffect(() => {
    setValue(values);
  }, [values]);

  const typingTimeoutRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: editing,
    onOpenChange: setEditing,
  });

  const click = useClick(context);

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const saveNoteMutation = useMutation({
    mutationFn: (body) => MembersAPI.saveNoteKgDate(body),
  });

  const onSubmit = (val, { date }) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      saveNoteMutation.mutate(
        {
          edit: [
            {
              value: val,
              MemberID: rowData.MemberID,
              CreateDate: date.format("YYYY-MM-DD"),
            },
          ],
        },
        {
          onSuccess: ({ data }) => {
            queryClient.invalidateQueries({ queryKey: ["ListReportKG"] });
          },
          onError: (error) => console.log(error),
        }
      );
    }, 300);
  };

  return (
    <div
      className="w-full flex items-center h-full overflow-hidden -mx-[5px] px-[5px]"
      ref={refs.setReference}
      {...getReferenceProps()}
      onClick={() => setEditing(true)}
    >
      {!editing && (
        <div className="border border-dashed border-transparent hover:border-[#999] w-full h-full flex items-center rounded cursor-pointer">
          {value ? value + " Kg" : ""}
        </div>
      )}
      {editing && (
        <div
          className="w-full"
          ref={refs.setFloating}
          //style={floatingStyles}
          {...getFloatingProps()}
        >
          <NumericFormat
            className="w-full px-3.5 py-3 placeholder:font-normal font-medium text-gray-800 transition bg-white autofill:bg-white border rounded outline-none dark:bg-site-aside disabled:bg-gray-200 disabled:border-gray-200 dark:disabled:bg-graydark-200 dark:text-graydark-700 border-gray-300 dark:border-graydark-400 focus:border-primary dark:focus:border-primary"
            value={value}
            thousandSeparator={false}
            placeholder="Nhập KG"
            onValueChange={(val) => {
              setValue(val.floatValue ? val.floatValue : val.value);
              onSubmit(val.floatValue ? val.floatValue : val.value, {
                rowData,
                date,
              });
            }}
            allowLeadingZeros={true}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

function App() {
  let StockID = Cookies.get("StockID");
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 25,
    filter: {
      MemberID: "",
      CreateDate: [startCurrentMonth, endCurrentMonth],
      "m.ByStockID": StockID || 0,
    },
  });

  const { width } = useWindowSize();

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
      return data || {};
    },
    keepPreviousData: true,
  });

  const columns = useMemo(
    () => {
      let dayInMonthTotal = moment(
        filters.filter.CreateDate[0],
        "MM/DD/YYYY"
      ).daysInMonth();
      let daysInMonth =
        moment().format("M") ===
        moment(filters.filter.CreateDate[0]).format("M")
          ? Number(moment().format("D"))
          : dayInMonthTotal;

      let column = [
        {
          key: "Member.FullName",
          title: "Khách hàng",
          dataKey: "Member.FullName",
          width: width > 767 ? 250 : 145,
          sortable: false,
          frozen: "left",
          style: {
            fontWeight: 600,
          },
          headerClassName: "text-sm md:text-base",
          className: "text-sm md:text-base",
          cellRenderer: ({ rowData }) => (
            <div>
              <div>{rowData.Member.FullName}</div>
              <div>{rowData.Member.MobilePhone}</div>
            </div>
          ),
        },
      ];

      let Arr = Array(daysInMonth)
        .fill()
        .map((_, index) => index)
        .reverse();
      for (let i of Arr) {
        moment().startOf("month").format("YYYY-MM-DD hh:mm");
        let newObj = {
          key: "Day-" + i + 1,
          title:
            width > 767
              ? moment(filters.filter.CreateDate[0])
                  .startOf("month")
                  .add(i, "days")
                  .format("DD-MM-YYYY")
              : moment(filters.filter.CreateDate[0])
                  .startOf("month")
                  .add(i, "days")
                  .format("DD-MM"),
          dataKey: "Day-" + i + 1,
          cellRenderer: (props) => (
            <EditableCell
              {...props}
              values={
                props.rowData.Dates &&
                props.rowData.Dates[i] &&
                props.rowData.Dates[i]["Value"]
                  ? props.rowData.Dates[i].Value
                  : ""
              }
              date={moment(filters.filter.CreateDate[0])
                .startOf("month")
                .add(i, "days")}
            />
          ),
          // cellRenderer: ({ rowData }) =>
          //   rowData.Dates && rowData.Dates[i] && rowData.Dates[i]["Value"]
          //     ? `${rowData.Dates[i].Value} Kg`
          //     : "",
          width: width > 767 ? 125 : 80,
          sortable: false,
          style: {
            backgroundColor:
              moment().startOf("month").add(i, "days").format("DD/MM/YYYY") ===
              moment().format("DD/MM/YYYY")
                ? "#fffadf"
                : "",
          },
          headerClassName: "text-sm md:text-base",
          className: "text-sm md:text-base",
        };
        column.push(newObj);
      }
      return column;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, width]
  );

  const rowClassName = ({ columns, rowData, rowIndex }) => {
    //return "bg-danger text-white";
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="flex">
          <div className="w-[300px]">
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
          <div className="ml-3 w-[120px] md:w-auto">
            <InputDatePicker
              showMonthYearPicker
              showFullMonthYearPicker
              placeholderText="Chọn tháng"
              dateFormat="MM/yyyy"
              onChange={(val) => {
                if (!val) return;
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
        <div>
          <PickerAdd>
            {({ open }) => (
              <button
                className="bg-success text-white h-[40.5px] px-4 rounded"
                type="button"
                onClick={open}
              >
                Thêm mới
              </button>
            )}
          </PickerAdd>
        </div>
      </div>
      <ReactBaseTable
        pagination
        wrapClassName="grow"
        rowKey="ID"
        columns={columns}
        data={data?.list || []}
        //estimatedRowHeight={96}
        rowHeight={78}
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
        // rowEventHandlers={{
        //   onClick: ({ rowData, ...a }) => {
        //     console.log(a);
        //   },
        // }}
      />
    </div>
  );
}

export default App;
