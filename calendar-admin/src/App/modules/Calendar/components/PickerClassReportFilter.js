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
import SelectStaffs from "../../../../components/Select/SelectStaffs/SelectStaffs";

let Status = [
  { label: "Đã hoàn thành", value: "1" },
  { label: "Chưa hoàn thành", value: "0" },
];

function PickerClassReportFilter({ children, filters, onChange }) {
  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const [visible, setVisible] = useState(false);
  let [initialValues, setInitialValues] = useState({
    ClassIDs: null,
    TeachIDs: null,
    StockID: null,
    BeginFrom: new Date(),
    BeginTo: new Date(),
    Status: "",
    IsOverTime: false,
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
        IsOverTime: filters.IsOverTime,
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
                          Huấn luyện viên
                        </div>
                        <div>
                          <SelectStaffs
                            isClearable
                            //StockID={values.StockID}
                            classIcon="fas fa-user"
                            menuPlacement="bottom"
                            className="select-control select-control-md"
                            classNamePrefix="select"
                            isSearchable
                            //menuIsOpen={true}
                            name="TeachIDs"
                            value={values.TeachIDs}
                            onChange={(option) => {
                              setFieldValue("TeachIDs", option);
                            }}
                            placeholder="Chọn huấn luyện viên"
                            components={
                              {
                                //Option: CustomOptionStaff,
                                //Control,
                              }
                            }
                            noOptionsMessage={({ inputValue }) =>
                              !inputValue
                                ? "Không có huấn luyện viên"
                                : "Không tìm thấy huấn luyện viên"
                            }
                            menuPortalTarget={document.body}
                          />
                        </div>
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Trạng thái</div>
                        <div>
                          <Select
                            isClearable
                            classNamePrefix="select"
                            className="select-control select-control-md"
                            options={Status}
                            placeholder="Chọn trạng thái"
                            value={values.Status}
                            onChange={(value) => setFieldValue("Status", value)}
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
                      <div className="mb-3.5 last:mb-0">
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            name="IsOverTime"
                            checked={values.IsOverTime}
                            onChange={(e) => {
                              setFieldValue("IsOverTime", e.target.checked);
                            }}
                          />
                          <span />
                          <b className="pl-2 font-normal text-gray-700 text-[14px]">
                            Ngoài giờ
                          </b>
                        </label>
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

export default PickerClassReportFilter;
