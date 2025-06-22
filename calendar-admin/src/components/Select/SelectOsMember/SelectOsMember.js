import React from "react";
import Select from "react-select";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { useQuery } from "react-query";
import moment from "moment";

function SelectOsMember({
  Member,
  ProdIDs,
  isDisabled,
  DateFrom,
  callback,
  IsAllService = false,
  ...props
}) {
  const { isLoading, data } = useQuery({
    queryKey: ["CalendarClassMembers", { Member, IsAllService }],
    queryFn: async () => {
      const { lst } = await CalendarCrud.getOsMemberCalendar({
        MemberIDs: Member?.value ? [Member?.value] : [],
        ProdIDs: !IsAllService && ProdIDs ? ProdIDs.split(",") : [],
        Date: DateFrom ? moment(DateFrom).format("YYYY-MM-DD") : null,
      });
      return lst
        ? lst.map((x) => ({
            label: x.Prod.Title,
            value: x.OS?.ID,
          }))
        : [];
    },
    enabled: Boolean(Member?.value && DateFrom),
    onSuccess: (rs) => {
      if (rs && rs.length === 1) {
        callback(rs[0]);
      }
    },
  });

  return (
    <Select
      isLoading={isLoading}
      isDisabled={isLoading || isDisabled}
      classNamePrefix="select"
      options={data || []}
      key={Member?.value || null}
      noOptionsMessage={() => "Không có thẻ liệu trình"}
      {...props}
    />
  );
}

export default SelectOsMember;
