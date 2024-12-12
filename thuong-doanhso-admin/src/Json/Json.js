export const TypeStaff = window.top?.GlobalConfig?.Admin?.hoa_hong_tu_van_ktv_an
  ? [{ value: "TU_VAN", label: "Hoa hồng tư vấn" }]
  : [
      { value: "TU_VAN", label: "Hoa hồng tư vấn" },
      {
        value: "KY_THUAT_VIEN",
        label: "Hoa hồng tư vấn ( KH mới )",
      },
    ];
