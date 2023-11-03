export const TypeStaff = window.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_ktv_an
  ? [{ value: "TU_VAN", label: "Nhân viên tư vấn (Sale)" }]
  : [
      { value: "TU_VAN", label: "Nhân viên tư vấn (Sale)" },
      {
        value: "KY_THUAT_VIEN",
        label: "Kỹ thuât viên",
      },
    ];
