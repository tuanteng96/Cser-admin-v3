import React, { useState } from "react";
import { Field } from "formik";

const StatusArr = [
  {
    value: "XAC_NHAN",
    label: "Đã xác nhận",
    color: "#3699FF",
    bg: "#E1F0FF",
  },
  {
    value: "XAC_NHAN_TU_DONG",
    label: "Đã xác nhận (Tự động)",
    color: "#17C653",
    bg: "#E4FFED",
  },
  {
    value: "CHUA_XAC_NHAN",
    label: "Chưa xác nhận",
    color: "#FFA800",
    bg: "#FFF4DE",
  },
  {
    value: "KHACH_KHONG_DEN",
    label: "Đặt nhưng không đến",
    color: "#F64E60",
    bg: "#FFE2E5",
  },
  {
    value: "KHACH_DEN",
    label: "Hoàn thành",
    color: "#8950FC",
    bg: "#EEE5FF",
  },
  {
    value: "DANG_THUC_HIEN",
    label: "Đang thực hiện",

    color: "#1bc5bd",
    bg: "#C9F7F5",
  },
  {
    value: "THUC_HIEN_XONG",
    label: "Thực hiện xong",
    color: "#92929e",
    bg: "#EBEDF3",
  },
];

const CheckBox = (props) => (
  <Field name={props.name}>
    {({ field, form }) => (
      <label
        className={`checkbox checkbox-circle ${!props.isMargin &&
          "mt-2"} m-0 py-10px px-12px`}
        style={{
          backgroundColor: props.bg,
          borderRadius: "2px",
          fontWeight: 600,
        }}
      >
        <input
          {...field}
          value={props.value}
          type="checkbox"
          checked={Boolean(field.value && field.value.includes(props.value))}
          onChange={() => {
            const set = new Set(field.value);
            if (set.has(props.value)) {
              set.delete(props.value);
            } else {
              set.add(props.value);
            }
            form.setFieldValue(field.name, Array.from(set));
            form.setFieldTouched(field.name, true);
          }}
        />
        <span
          className="rounded-circle"
          style={{ background: props.color }}
        ></span>
        {/* <div
            className="w-30px h-18px rounded-2px mr-2 ml-2"
            style={{ background: props.color }}
          /> */}
        <div className="font-size-smm ml-2" style={{ color: props.color }}>
          {props.label}
        </div>
      </label>
    )}
  </Field>
);

function StatusList(props) {
  const [isOpen] = useState(true);
  return (
    <div className="form-group form-group-ezs mb-0">
      {isOpen && (
        <div className="py-8px">
          {/* <div className="font-size-minn font-weight-bold text-uppercase text-muted mb-10px">
            <span>Lịch dự kiến</span>
          </div> */}
          {StatusArr &&
            StatusArr.slice(0, 5).map((item, index) => (
              <CheckBox
                isMargin={index === 0}
                name="Status"
                label={item.label}
                value={item.value}
                color={item.color}
                bg={item.bg}
                key={index}
              />
            ))}
          <div className="font-size-minn font-weight-bold text-uppercase text-muted mb-10px mt-15px">
            Lịch thực hiện
          </div>
          {StatusArr &&
            StatusArr.slice(5, StatusArr.length).map((item, index) => (
              <CheckBox
                isMargin={index === 0}
                name="Status"
                label={item.label}
                value={item.value}
                color={item.color}
                bg={item.bg}
                key={index}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default StatusList;
