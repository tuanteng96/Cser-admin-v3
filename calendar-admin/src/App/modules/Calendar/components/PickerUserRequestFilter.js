import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createPortal } from "react-dom";
import SelectStocks from "../../../../components/Select/SelectStocks/SelectStocks";
import DatePicker from "react-datepicker";
import vi from "date-fns/locale/vi";
import Select from "react-select";
import { useRoles } from "../../../../hooks/useRoles";
import SelectOsClass from "../../../../components/Select/SelectOsClass/SelectOsClass";
import clsx from "clsx";

// let Status = [
//   { label: "Đã hoàn thành", value: "1" },
//   { label: "Chưa hoàn thành", value: "0" },
// ];

let WorkingTime = [
  { label: "Trong giờ", value: "1" },
  { label: "Ngoài giờ", value: "0" },
];

function PickerUserRequestFilter({ children, filters, onChange }) {
  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const [visible, setVisible] = useState(false);
  let [initialValues, setInitialValues] = useState({
    ClassIDs: null,
    TeachIDs: null,
    StockID: null,
    BeginFrom: new Date(),
    BeginTo: new Date(),
    Status: "",
    WorkingTime: null,
  });

  useEffect(() => {
    if (visible) {
      setInitialValues({
        ClassIDs: filters.ClassIDs,
        TeachIDs: filters.TeachIDs,
        StockID: filters.StockID,
        BeginFrom: filters.BeginFrom,
        BeginTo: filters.BeginTo,
        Status: filters.Status,
        WorkingTime: filters.WorkingTime,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onHide = () => setVisible(false);

  const onSubmit = (values, { resetForm }) => {
    onChange(values);
    onHide();
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <Modal
            //size="sm"
            dialogClassName="modal-max-sm"
            show={visible}
            onHide={onHide}
            scrollable={true}
          >
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
              enableReinitialize
            >
              {(formikProps) => {
                const {
                  errors,
                  touched,
                  values,
                  handleBlur,
                  setFieldValue,
                } = formikProps;

                return (
                  <Form className="h-100 d-flex flex-column">
                    <Modal.Header className="open-close" closeButton>
                      <Modal.Title className="text-uppercase">
                        Bộ lọc
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Từ ngày</div>
                        <div>
                          <DatePicker
                            locale={vi}
                            selected={
                              values.BeginFrom
                                ? new Date(values.BeginFrom)
                                : null
                            }
                            onChange={(date) =>
                              setFieldValue("BeginFrom", date)
                            }
                            className="!h-11 form-control !rounded-[4px] !text-[15px]"
                            shouldCloseOnSelect={true}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn từ ngày"
                          />
                        </div>
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Đến ngày</div>
                        <div>
                          <DatePicker
                            locale={vi}
                            selected={
                              values.BeginTo ? new Date(values.BeginTo) : null
                            }
                            onChange={(date) => setFieldValue("BeginTo", date)}
                            className="!h-11 form-control !rounded-[4px] !text-[15px]"
                            shouldCloseOnSelect={true}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn từ ngày"
                          />
                        </div>
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Cơ sở</div>
                        <div>
                          <SelectStocks
                            StockRoles={adminTools_byStock?.StockRolesAll || []}
                            isClearable
                            className={`select-control select-control-md`}
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
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Lớp</div>
                        <SelectOsClass
                          enabled={visible}
                          StockID={values.StockID}
                          isClearable
                          className={clsx(
                            "select-control select-control-md",
                            errors.Service &&
                              touched.Service &&
                              "is-invalid solid-invalid"
                          )}
                          classNamePrefix="select"
                          value={values.ClassIDs}
                          isSearchable
                          name="ClassIDs"
                          placeholder="Chọn lớp"
                          onChange={(option) => {
                            setFieldValue("ClassIDs", option);
                          }}
                          menuPosition="fixed"
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">
                          Loại giờ làm việc
                        </div>
                        <div>
                          <Select
                            isClearable
                            classNamePrefix="select"
                            className="select-control select-control-md"
                            options={WorkingTime}
                            placeholder="Chọn loại"
                            value={values.WorkingTime}
                            onChange={(value) =>
                              setFieldValue("WorkingTime", value)
                            }
                            blurInputOnSelect={true}
                            noOptionsMessage={() => "Không có dữ liệu."}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                            }}
                          />
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <button
                        type="button"
                        className="mr-2 btn btn-sm btn-secondary"
                        onClick={onHide}
                      >
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-sm btn-primary">
                        Tìm kiếm
                      </button>
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

export default PickerUserRequestFilter;
