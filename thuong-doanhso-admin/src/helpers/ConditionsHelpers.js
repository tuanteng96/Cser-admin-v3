import moment from "moment";

const ConditionsHelpers = {
  isDisabledSalesSommission: (item, rights) => {
    // rights là adminTools_byStock?.hasRight

    if (window.top?.GlobalConfig?.Admin?.thuong_ds_nang_cao) {
      
      return !rights;
    }
    if (item.ID) {
      return !(
        rights ||
        moment(item.CreateDate).format("DD-MM-YYYY") ===
          moment().format("DD-MM-YYYY")
      );
    }
    return window.top?.GlobalConfig?.Admin?.thuong_ds_nang_cao;
  },
  isDeleteProductSalesSommission: (item, rights) => {
    let newDoanh_So = item.Doanh_So
      ? item.Doanh_So.map((x) => ({
          ...x,
          isDisabled: ConditionsHelpers.isDisabledSalesSommission(
            { ...x, ID: x.ID },
            rights
          ),
        }))
      : [];
    let newHoa_Hong = item.Hoa_Hong
      ? item.Hoa_Hong.map((x) => ({
          ...x,
          isDisabled: ConditionsHelpers.isDisabledSalesSommission(
            { ...x, ID: x.ID },
            rights
          ),
        }))
      : [];
    return !(
      newDoanh_So.some((x) => x.isDisabled) ||
      newHoa_Hong.some((x) => x.isDisabled)
    );
  },
};

export default ConditionsHelpers;
