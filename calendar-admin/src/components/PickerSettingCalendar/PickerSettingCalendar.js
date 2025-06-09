import { FieldArray, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import CalendarCrud from "../../App/modules/Calendar/_redux/CalendarCrud";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

function PickerSettingCalendar({ children, SettingCalendar }) {
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(false);
  const [initialValues, setInitialValues] = useState({
    Tags: "",
    OriginalServices: [],
  });

  useEffect(() => {
    setInitialValues((prevState) => ({
      ...SettingCalendar.data,
      Tags: SettingCalendar?.data?.Tags
        ? SettingCalendar?.data?.Tags.split(",").map((x) => ({
            label: x,
            value: x,
          }))
        : [],
    }));
  }, [SettingCalendar]);

  const onHide = () => {
    setVisible(false);
  };

  const loadOptionsServices = (inputValue, callback) => {
    const filters = {
      Key: inputValue,
      StockID: 0,
      MemberID: "",
    };
    setTimeout(async () => {
      const { lst } = await CalendarCrud.getRootServices(filters);
      const dataResult = lst.map((item) => ({
        value: item.ID,
        label: item.Title,
      }));
      callback(dataResult);
    }, 300);
  };

  const updateMutation = useMutation({
    mutationFn: (body) => CalendarCrud.saveConfigName("ArticleRel", body),
  });

  const onSubmit = (values) => {
    updateMutation.mutate(
      {
        ...values,
        Tags: values.Tags ? values.Tags.map((x) => x.value).toString() : "",
      },
      {
        onSuccess: () => {
          queryClient
            .invalidateQueries({ queryKey: ["SettingCalendar"] })
            .then(() => {
              toast.success("Cập nhật thành công.");
            });
        },
      }
    );
  };

  return (
    <>
      {children({
        open: () => {
          setVisible(true);
        },
      })}
      <Modal size="md" show={visible} onHide={onHide} scrollable={true}>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {(formikProps) => {
            const {
              values,
              handleChange,
              handleBlur,
              setFieldValue,
            } = formikProps;
            return (
              <Form className="h-100 d-flex flex-column">
                <Modal.Header className="open-close" closeButton>
                  <Modal.Title className="text-uppercase">
                    Cài đặt bảng lịch
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="form-group">
                    <label className="mb-1">Tags</label>
                    <CreatableSelect
                      className="select-control"
                      isMulti
                      options={[]}
                      classNamePrefix="select"
                      value={values.Tags}
                      onChange={(val) => {
                        setFieldValue("Tags", val);
                      }}
                      placeholder="Nhập tên tag"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                      noOptionsMessage={() => "Nhập tên tag bạn cần tạo ?"}
                      formatCreateLabel={(inputValue) => (
                        <span className="text-primary">
                          Tạo mới "{inputValue}"
                        </span>
                      )}
                      onCreateOption={(inputValue) => {
                        let newOptions = [
                          ...values.Tags,
                          {
                            label: inputValue,
                            value: inputValue,
                          },
                        ];
                        setFieldValue("Tags", newOptions);
                      }}
                    />
                  </div>
                  <div className="mb-0 form-group">
                    <div>
                      <label className="mb-1">Dịch vụ cài màu sắc</label>
                      <FieldArray
                        name="OriginalServices"
                        render={(arrayHelpers) => (
                          <>
                            <AsyncSelect
                              menuPosition="fixed"
                              isMulti
                              className={`select-control`}
                              classNamePrefix="select"
                              isLoading={false}
                              isDisabled={false}
                              isClearable
                              isSearchable
                              //menuIsOpen={true}
                              value={values.OriginalServices}
                              onChange={(option) => {
                                setFieldValue(
                                  "OriginalServices",
                                  option
                                    ? option.map((x) => ({
                                        ...x,
                                        color: x?.color || "#000000",
                                      }))
                                    : []
                                );
                              }}
                              name="OriginalServices"
                              placeholder="Chọn dịch vụ"
                              cacheOptions
                              loadOptions={(v, callback) =>
                                loadOptionsServices(v, callback)
                              }
                              defaultOptions
                              noOptionsMessage={({ inputValue }) =>
                                !inputValue
                                  ? "Không có dịch vụ"
                                  : "Không tìm thấy dịch vụ"
                              }
                            />
                          </>
                        )}
                      />
                    </div>
                    {values.OriginalServices &&
                      values.OriginalServices.length > 0 && (
                        <div>
                          <table className="table mb-0 table-bordered mt-15px">
                            <thead>
                              <tr>
                                <th
                                  className="text-uppercase"
                                  style={{ fontSize: "13px" }}
                                >
                                  Dịch vụ
                                </th>
                                <th
                                  className="text-uppercase w-100px"
                                  style={{ fontSize: "13px" }}
                                >
                                  Mã màu
                                </th>
                                <th className="text-center w-55px">#</th>
                              </tr>
                            </thead>
                            <FieldArray
                              name="OriginalServices"
                              render={(arrayHelpers) => (
                                <tbody>
                                  {values.OriginalServices.map(
                                    (service, index) => (
                                      <tr key={index}>
                                        <td>{service.label}</td>
                                        <td className="w-100px">
                                          <input
                                            type="color"
                                            name={`OriginalServices[${index}].color`}
                                            value={service.color}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                          />
                                        </td>
                                        <td className="w-55px">
                                          <button
                                            onClick={() =>
                                              arrayHelpers.remove(index)
                                            }
                                            type="button"
                                            className="btn btn-danger"
                                            style={{
                                              fontSize: "12px",
                                              padding: "0px",
                                              width: "30px",
                                              height: "30px",
                                            }}
                                          >
                                            <i className="p-0 font-size-sm fas fa-trash-alt"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              )}
                            />
                          </table>
                        </div>
                      )}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={onHide}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm btn-primary ml-8px ${
                      updateMutation.isLoading
                        ? "spinner spinner-white spinner-right"
                        : ""
                    } w-auto my-0 mr-0 h-auto`}
                    disabled={updateMutation.isLoading}
                  >
                    Cập nhật
                  </button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
}

export default PickerSettingCalendar;
