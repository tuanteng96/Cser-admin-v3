import clsx from "clsx";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useMutation, useQueryClient } from "react-query";
import moment from "moment";
import { useSelector } from "react-redux";
import SelectStaffs from "../../../../components/Select/SelectStaffs/SelectStaffs";
import * as Yup from "yup";
import CalendarCrud from "../_redux/CalendarCrud";

const CreateSchema = Yup.object().shape({
  From: Yup.string().required("Vui lòng chọn thời gian nghỉ."),
  To: Yup.string().required("Vui lòng chọn thời gian nghỉ."),
  UserID: Yup.object()
    .nullable()
    .required("Vui lòng chọn nhân viên"),
});

function PickerTakeBreak({ children, item, UserID, AuthCrStockID }) {
  const { TimeOpen, TimeClose, checkout_time } = useSelector(
    ({ auth, JsonConfig }) => ({
      TimeClose: auth?.GlobalConfig?.APP?.Working?.TimeClose || "23:45:00",
      TimeOpen: auth?.GlobalConfig?.APP?.Working?.TimeOpen || "00:00:00",
      checkout_time: JsonConfig?.Admin?.checkout_time || "",
    })
  );
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [initialValues, setInitialValues] = useState({
    ID: 0,
    From: moment()
      .set({
        hour: moment(TimeOpen, "HH:mm:ss").get("hour"),
        minute: moment(TimeOpen, "HH:mm:ss").get("minute"),
        second: moment(TimeOpen, "HH:mm:ss").get("second"),
      })
      .toDate(),
    To: moment()
      .set({
        hour: moment(TimeClose, "HH:mm:ss").get("hour"),
        minute: moment(TimeClose, "HH:mm:ss").get("minute"),
        second: moment(TimeClose, "HH:mm:ss").get("second"),
      })
      .toDate(),
    UserID: null,
  });

  useEffect(() => {
    if (visible) {
      if (item) {
        setInitialValues((prevState) => ({
          ...prevState,
          ...item,
          ID: item.ID,
          From: item.From,
          To: item.To,
          UserID: {
            label: item?.User?.UserName,
            value: item?.UserID,
          },
          Desc: item.Desc,
        }));
      } else {
        let DateStart = null;
        let DateEnd = null;

        if (checkout_time) {
          DateStart = moment()
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .toDate();
          DateEnd = moment()
            .add(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
            })
            .toDate();
        }
        setInitialValues((prevState) => ({
          ...prevState,
          UserID: UserID,
          From: DateStart || prevState.From,
          To: DateEnd || prevState.To,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, item, UserID]);

  const onHide = () => setVisible(false);

  const updateMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.editWorkOff(body);
      await queryClient.invalidateQueries({ queryKey: ["OfflineSchedule"] });
      await queryClient.invalidateQueries({
        queryKey: ["ListCalendarsMassage"],
      });

      return rs;
    },
  });

  const onSubmit = (values) => {
    updateMutation.mutate(
      {
        edit: [
          {
            ...values,
            From:
              values.From && moment(values.From).format("YYYY-MM-DD HH:mm:ss"),
            To: values.To && moment(values.To).format("YYYY-MM-DD HH:mm:ss"),
            UserID: values.UserID ? values.UserID?.value : "",
          },
        ],
      },
      {
        onSettled: () => {
          onHide();
          window.top.toastr &&
            window.top.toastr.success(
              values.ID ? "Cập nhập thành công." : "Thêm mới thành công",
              {
                timeOut: 1500,
              }
            );
        },
      }
    );
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: onHide,
      })}
      <Modal
        show={visible}
        onHide={onHide}
        dialogClassName="modal-content-right max-w-400px"
        scrollable={true}
        enforceFocus={false}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
          validationSchema={CreateSchema}
        >
          {(formikProps) => {
            // errors, touched, handleChange, handleBlur
            const {
              values,
              touched,
              errors,
              setFieldValue,
              handleChange,
              handleBlur,
            } = formikProps;

            return (
              <Form className="d-flex flex-column h-100" autoComplete="off">
                <Modal.Header closeButton>
                  <Modal.Title className="font-title text-uppercase">
                    {!values.ID ? (
                      <div className="d-flex align-items-baseline">
                        Tạo lịch nghỉ
                        <div className="text-capitalize font-size-sm font-base fw-600 pl-5px">
                          {UserID?.label}
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex align-items-baseline">
                        Lịch nghỉ
                        <div className="text-capitalize font-size-sm font-base fw-600 pl-5px">
                          {values?.UserID?.label}
                        </div>
                      </div>
                    )}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="form-group mb-20px">
                    <label className="font-label text-muted mb-5px">
                      Nhân viên
                    </label>
                    <SelectStaffs
                      isClearable
                      StockID={AuthCrStockID}
                      classIcon="fas fa-user"
                      menuPlacement="bottom"
                      className={clsx(
                        "select-control select-control-md",
                        errors.UserID &&
                          touched.UserID &&
                          "is-invalid solid-invalid"
                      )}
                      classNamePrefix="select"
                      isSearchable
                      //menuIsOpen={true}
                      name="UserID"
                      value={values.UserID}
                      onChange={(option) => {
                        setFieldValue("UserID", option);
                      }}
                      placeholder="Chọn nhân viên"
                      components={
                        {
                          //Option: CustomOptionStaff,
                          //Control,
                        }
                      }
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? "Không có nhân viên"
                          : "Không tìm thấy nhân viên"
                      }
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div className="form-group mb-20px">
                    <label className="font-label text-muted mb-5px">
                      Thời gian bắt đầu
                    </label>
                    <DatePicker
                      name="From"
                      selected={values.From ? new Date(values.From) : ""}
                      onChange={(date) => setFieldValue("From", date)}
                      onBlur={handleBlur}
                      className={clsx(
                        "!h-11 form-control !rounded-[4px] !text-[15px]",
                        errors.From &&
                          touched.From &&
                          "is-invalid solid-invalid"
                      )}
                      shouldCloseOnSelect={false}
                      dateFormat="HH:mm dd/MM/yyyy"
                      placeholderText="Chọn thời gian"
                      timeInputLabel="Thời gian"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      autoComplete="off"
                      //filterTime={filterPassedTime}
                    />
                  </div>
                  <div className="form-group mb-20px">
                    <label className="font-label text-muted mb-5px">
                      Thời gian kết thúc
                    </label>
                    <DatePicker
                      name="To"
                      selected={values.To ? new Date(values.To) : ""}
                      onChange={(date) => setFieldValue("To", date)}
                      onBlur={handleBlur}
                      className={clsx(
                        "!h-11 form-control !rounded-[4px] !text-[15px]",
                        errors.To && touched.To && "is-invalid solid-invalid"
                      )}
                      shouldCloseOnSelect={false}
                      dateFormat="HH:mm dd/MM/yyyy"
                      placeholderText="Chọn thời gian"
                      timeInputLabel="Thời gian"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={5}
                      autoComplete="off"
                      //filterTime={filterPassedTime}
                    />
                  </div>
                  <div className="mb-0 form-group">
                    <label className="font-label text-muted mb-5px">
                      Lý do
                    </label>
                    <textarea
                      className="form-control !text-[15px]"
                      placeholder="Nhập lý do"
                      rows={4}
                      name="Desc"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.Desc}
                    ></textarea>
                  </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                  <Button type="button" variant="secondary" onClick={onHide}>
                    Đóng
                  </Button>
                  <Button
                    type="submit"
                    className={clsx(
                      "ml-8px",
                      updateMutation.isLoading &&
                        "spinner spinner-white spinner-right"
                    )}
                    disabled={updateMutation.isLoading}
                  >
                    {!values?.ID ? "Thêm mới" : "Cập nhập"}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
}

export default PickerTakeBreak;
