import Select from "react-select";
import { useQuery } from "react-query";
import MembersAPI from "../../api/members.api";
import { Cookies } from "../../utils/cookies";

const SelectMembers = ({ ...props }) => {
  let StockID = Cookies.get("MemberSelectStockID");

  const { data, isLoading } = useQuery({
    queryKey: ["ListStaffs"],
    queryFn: async () => {
      const { data } = await MembersAPI.list(StockID);
      const { Items } = {
        Items:
          data?.data?.map((x) => ({ ...x, label: x.text, value: x.id })) || [],
      };
      return Items || [];
    },
  });

  return (
    <>
      <Select
        isLoading={isLoading}
        isDisabled={isLoading}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
        menuPortalTarget={document.body}
        classNamePrefix="select"
        options={data || []}
        placeholder="Chọn khách hàng"
        noOptionsMessage={() => "Không có khách hàng"}
        {...props}
      />
    </>
  );
};

export { SelectMembers };
