import { useQuery } from "react-query";
import MembersAPI from "../../api/members.api";
import { Cookies } from "../../utils/cookies";
import { AsyncPaginate } from "react-select-async-paginate";

const SelectMembers = ({ ...props }) => {
  let StockID = Cookies.get("MemberSelectStockID");

  async function loadOptions(search, loadedOptions) {
    const { data } = await MembersAPI.list(StockID, search);
    const { Items } = {
      Items:
        data?.data?.map((x) => ({ ...x, label: x.text, value: x.id })) || [],
    };

    return {
      options: Items || [],
      hasMore: false,
    };
  }

  return (
    <>
      <AsyncPaginate
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
        menuPortalTarget={document.body}
        classNamePrefix="select"
        loadOptions={loadOptions}
        additional={{
          page: 1,
        }}
        placeholder="Chọn khách hàng"
        noOptionsMessage={() => "Không có khách hàng"}
        {...props}
      />
    </>
  );
};

export { SelectMembers };
