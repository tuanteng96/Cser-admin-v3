import { FieldArray, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import SelectStocks from "../../../../components/Select/SelectStocks/SelectStocks";
import { NumericFormat } from "react-number-format";
import SelectProdServiceCard from "../../../../components/Select/SelectProdServiceCard/SelectProdServiceCard";
import moment from "moment";
import DateTimePicker from "../../../../shared/DateTimePicker/DateTimePicker";
import clsx from "clsx";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";

const AddEditSchema = Yup.object().shape({
  Title: Yup.string().required("Vui lòng nhập tên lớp."),
  MemberTotal: Yup.string().required("Vui lòng nhập số học viên."),
  Minutes: Yup.string().required("Vui lòng nhập số phút."),
  ProdIDs: Yup.array()
    .required("Vui lòng chọn dịch vụ thẻ.")
    .min(1, "Vui lòng chọn dịch vụ thẻ.")
    .nullable(),
});

var defaultWeekdays = Array.apply(null, Array(7)).map(function(_, i) {
  return {
    Title: moment(i, "e")
      .startOf("week")
      .isoWeekday(i + 1)
      .format("dddd"),
    SubTitle: moment(i, "e")
      .startOf("week")
      .isoWeekday(i + 1)
      .format("ddd"),
    Index: moment(i, "e")
      .startOf("week")
      .isoWeekday(i + 1)
      .day(),
    Items: [{ from: "" }],
  };
});

function PickerClassAddEdit({ children, rowData }) {
  const queryClient = useQueryClient();

  const { AuthCrStockID } = useSelector(({ Auth }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  let [initialValues, setInitialValues] = useState({
    ID: 0,
    CreateDate: "",
    Title: "",
    Desc: "",
    CreateDate: "",
    StockID: AuthCrStockID,
    MemberTotal: "",
    ProdIDs: "",
    Minutes: "",
    TimeSlot: defaultWeekdays,
  });

  useEffect(() => {
    if (rowData) {
      setInitialValues({
        ID: rowData?.ID,
        Title: rowData?.Title,
        CreateDate: moment(rowData.CreateDate, "YYYY-MM-DD HH:mm"),
        Desc: rowData?.Desc,
        StockID: rowData.StockID,
        MemberTotal: rowData?.MemberTotal,
        ProdIDs:
          rowData.Prods && rowData.Prods.length > 0
            ? rowData.Prods.map((x) => ({
                value: x.ID,
                label: x.Title,
              }))
            : null,
        Minutes: rowData?.Minutes,
        TimeSlot: rowData?.TimeSlot
          ? rowData?.TimeSlot.map((x) => ({
              ...x,
              Items: x?.Items
                ? x?.Items.map((o) => ({
                    ...o,
                    from: moment()
                      .set({
                        hour: moment(o.from, "HH:mm").get("hour"),
                        minute: moment(o.from, "HH:mm").get("minute"),
                        second: moment(o.from, "HH:mm").get("second"),
                      })
                      .toDate(),
                  }))
                : [],
            }))
          : defaultWeekdays,
      });
    } else {
      setInitialValues({
        ID: 0,
        Title: "",
        CreateDate: "",
        Desc: "",
        StockID: AuthCrStockID,
        MemberTotal: "",
        ProdIDs: "",
        Minutes: "",
        TimeSlot: ListClassRooms?.data || defaultWeekdays,
      });
    }
  }, [visible]);

  let ListClassRooms = useQuery({
    queryKey: ["ListClassRooms"],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`classroom`);
      let rs = defaultWeekdays;
      if (data && data.length > 0) {
        let result = JSON.parse(data[0].Value);
        if (result) {
          rs = result.map((x) => ({
            ...x,
            Items: x?.Items
              ? x?.Items.map((o) => ({
                  ...o,
                  from: moment()
                    .set({
                      hour: moment(o.from, "HH:mm").get("hour"),
                      minute: moment(o.from, "HH:mm").get("minute"),
                      second: moment(o.from, "HH:mm").get("second"),
                    })
                    .toDate(),
                }))
              : [],
          }));
        }
      }
      return rs;
    },
  });

  const onHide = () => setVisible(false);

  const addEditMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.addEditCalendarClass(body);
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const onSubmit = (values, { resetForm }) => {
    let newValues = {
      ...values,
      ProdIDs: values.ProdIDs.map((x) => x.value).toString(),
      TimeSlot: values.TimeSlot
        ? values.TimeSlot.map((x) => ({
            ...x,
            Items: x.Items
              ? x.Items.filter((x) => x.from).map((o) => ({
                  ...o,
                  from: moment(o.from).format("HH:mm"),
                }))
              : [],
          }))
        : [],
      CreateDate: values?.CreateDate
        ? moment(values?.CreateDate).format("YYYY-MM-DD HH:mm")
        : "",
    };
    addEditMutation.mutate(
      { arr: [newValues] },
      {
        onSuccess: (data) => {
          resetForm();
          window?.top?.toastr?.success("Thêm mới thành công.", "", {
            timeOut: 200,
          });
          onHide();
        },
      }
    );
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <Modal
            size="md"
            dialogClassName="modal-max-sm modal-content-right"
            show={visible}
            onHide={onHide}
            scrollable={true}
          >
            <Formik
              initialValues={initialValues}
              validationSchema={AddEditSchema}
              onSubmit={onSubmit}
              enableReinitialize
            >
              {(formikProps) => {
                const {
                  errors,
                  touched,
                  values,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                } = formikProps;

                return (
                  <Form className="h-100 d-flex flex-column">
                    <Modal.Header className="open-close" closeButton>
                      <Modal.Title className="text-uppercase">
                        {initialValues?.ID
                          ? "Chỉnh sửa lớp học"
                          : "Thêm mới lớp học"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Tên lớp học</div>
                        <div>
                          <input
                            name="Title"
                            value={values.Title}
                            className={clsx(
                              "form-control !text-[14px] !rounded-[4px]",
                              errors?.Title &&
                                touched?.Title &&
                                "is-invalid solid-invalid"
                            )}
                            placeholder="Nhập tên lớp"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoComplete="off"
                          ></input>
                        </div>
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Cơ sở</div>
                        <SelectStocks
                          className={`select-control ${
                            errors.StockID && touched.StockID
                              ? "is-invalid solid-invalid"
                              : ""
                          }`}
                          classNamePrefix="select"
                          value={values.StockID}
                          isSearchable
                          name="StockID"
                          placeholder="Chọn cơ sở"
                          onChange={(option) => {
                            setFieldValue(
                              "StockID",
                              option ? option.value : ""
                            );
                          }}
                          menuPosition="fixed"
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">
                          Số học viên tối đa
                        </div>
                        <NumericFormat
                          allowLeadingZeros
                          name="MemberTotal"
                          value={values.MemberTotal}
                          className={clsx(
                            "form-control !text-[14px] !rounded-[4px]",
                            errors?.MemberTotal &&
                              touched?.MemberTotal &&
                              "is-invalid solid-invalid"
                          )}
                          placeholder="Nhập số học viên"
                          onValueChange={(val) =>
                            setFieldValue("MemberTotal", val.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">
                          Thời gian ( Số phút )
                        </div>
                        <NumericFormat
                          allowLeadingZeros
                          name="Minutes"
                          value={values.Minutes}
                          className={clsx(
                            "form-control !text-[14px] !rounded-[4px]",
                            errors?.Minutes &&
                              touched?.Minutes &&
                              "is-invalid solid-invalid"
                          )}
                          placeholder="Nhập số phút"
                          onValueChange={(val) =>
                            setFieldValue("Minutes", val.floatValue)
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Dịch vụ thẻ</div>
                        <SelectProdServiceCard
                          isMulti
                          className={`select-control select-control-sm ${
                            errors.ProdIDs && touched.ProdIDs
                              ? "is-invalid solid-invalid"
                              : ""
                          }`}
                          classNamePrefix="select"
                          value={values.ProdIDs}
                          isSearchable
                          name="ProdIDs"
                          placeholder="Chọn dịch vụ thẻ"
                          onChange={(option) => {
                            setFieldValue("ProdIDs", option);
                          }}
                          menuPosition="fixed"
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-1 text-gray-700">Thời gian học</div>
                        <FieldArray
                          name="TimeSlot"
                          render={(arrayHelpers) => (
                            <div>
                              {values.TimeSlot.map((day, i) => (
                                <div
                                  className="mb-3 border rounded-[4px] last:!mb-0 overflow-hidden"
                                  key={i}
                                >
                                  <div className="px-3 py-2.5 bg-gray-50 capitalize text-[13px]">
                                    {day.Title}
                                  </div>
                                  <div className="p-4 border-t">
                                    <FieldArray
                                      name={`TimeSlot[${i}].Items`}
                                      render={(dayHelpers) => (
                                        <div>
                                          <div>
                                            {values.TimeSlot[i].Items.map(
                                              (time, k) => (
                                                <div
                                                  className="flex gap-2 mb-2 last:!mb-0"
                                                  key={k}
                                                >
                                                  <div className="w-[100px] flex items-center text-[13px]">
                                                    Giờ bắt đầu
                                                  </div>
                                                  <div className="flex-1">
                                                    <DateTimePicker
                                                      autoComplete="off"
                                                      name={`TimeSlot[${i}].Items[${k}].from`}
                                                      selected={time.from}
                                                      onChange={(date) => {
                                                        setFieldValue(
                                                          `TimeSlot[${i}].Items[${k}].from`,
                                                          date
                                                        );
                                                      }}
                                                      className={clsx(
                                                        "!h-10 form-control !text-[13px] !rounded-[4px]"
                                                      )}
                                                      shouldCloseOnSelect={
                                                        false
                                                      }
                                                      dateFormat="HH:mm"
                                                      placeholderText="Từ"
                                                      timeInputLabel="Thời gian"
                                                      showTimeSelect
                                                      showTimeSelectOnly
                                                      timeFormat="HH:mm"
                                                    />
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <div
                                                      className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer text-success bg-gray-100 rounded-[4px]"
                                                      onClick={() => {
                                                        dayHelpers.push({
                                                          from: time.from
                                                            ? moment(time.from)
                                                                .add(
                                                                  60,
                                                                  "minutes"
                                                                )
                                                                .toDate()
                                                            : "",
                                                        });
                                                      }}
                                                    >
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        className="w-[18px]"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                      </svg>
                                                    </div>
                                                    <div
                                                      className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer text-danger bg-gray-100 rounded-[4px]"
                                                      onClick={() =>
                                                        dayHelpers.remove(k)
                                                      }
                                                    >
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        className="w-[18px]"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                        />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                          {values.TimeSlot[i].Items.length ===
                                            0 && (
                                            <div
                                              className={clsx(
                                                "bg-success inline-block text-white cursor-pointer rounded-[3px] text-[12px] px-2 py-px"
                                              )}
                                              onClick={() =>
                                                dayHelpers.push({
                                                  from: "",
                                                })
                                              }
                                            >
                                              Thêm thời gian
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-between">
                      <div className="d-flex w-100">
                        <button
                          type="button"
                          className="mr-2 btn btn-sm btn-secondary"
                          onClick={onHide}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className={`btn btn-sm btn-primary flex-1 ${
                            addEditMutation.isLoading
                              ? "spinner spinner-white spinner-right"
                              : ""
                          } w-auto my-0 mr-0 h-auto`}
                          disabled={addEditMutation.isLoading}
                        >
                          {initialValues?.ID ? "Lưu thay đổi" : "Thêm mới"}
                        </button>
                      </div>
                    </Modal.Footer>
                  </Form>
                );
              }}
            </Formik>
          </Modal>,
          document.body
        )}
    </>
  );
}

export default PickerClassAddEdit;
