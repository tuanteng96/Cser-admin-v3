import { FieldArray, Form, Formik } from "formik";
import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { createPortal } from "react-dom";
import DateTimePicker from "../../../../shared/DateTimePicker/DateTimePicker";
import { NumericFormat } from "react-number-format";
import moment from "moment";
import { useMutation, useQueryClient } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import clsx from "clsx";
import Swal from "sweetalert2";
import * as Yup from "yup";

const AddEditSchema = Yup.object().shape({
  CreateDate: Yup.string().required("Vui lòng chọn ngày."),
  arr: Yup.array().of(
    Yup.object().shape({
      Config: Yup.object().shape({
        from: Yup.string().required("Vui lòng chọn thời gian."),
        to: Yup.string().required("Vui lòng chọn thời gian."),
        MaxBook: Yup.string().required("Vui lòng nhập số lịch."),
      }),
    })
  ),
});

function PickerAddEditBookOnline({
  children,
  TimeOpen,
  TimeClose,
  AuthCrStockID,
}) {
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(false);

  const [initialValues, setInitialValues] = useState({
    StockID: AuthCrStockID,
    CreateDate: "",
    arr: [
      {
        ID: "",
        Config: {
          from: "",
          to: "",
          MaxBook: "",
        },
      },
    ],
    deletes: [],
  });

  const onHide = () => setVisible(false);

  const addEditMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.addEditBookConfig(body);
      await queryClient.invalidateQueries({ queryKey: ["SettingBookOnline"] });
      return rs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (body) => {
      let data = await CalendarCrud.deleteBookConfig(body);
      return data;
    },
  });

  const checkMutation = useMutation({
    mutationFn: (body) => CalendarCrud.getListBookConfig(body),
  });

  const onSubmit = async (values, { resetForm }) => {
    let newValues = {
      arr: values.arr.map((item) => ({
        ...item,
        StockID: values?.StockID,
        CreateDate: values.CreateDate
          ? moment(values.CreateDate).format("YYYY-MM-DD")
          : null,
        Config: {
          ...item.Config,
          from: moment(values.CreateDate)
            .set({
              hour: moment(
                moment(item.Config.from).format("HH:mm"),
                "HH:mm"
              ).get("hour"),
              minute: moment(
                moment(item.Config.from).format("HH:mm"),
                "HH:mm"
              ).get("minute"),
              second: moment(
                moment(item.Config.from).format("HH:mm"),
                "HH:mm"
              ).get("second"),
            })
            .format("YYYY-MM-DD HH:mm"),
          to: moment(values.CreateDate)
            .set({
              hour: moment(moment(item.Config.to).format("HH:mm"), "HH:mm").get(
                "hour"
              ),
              minute: moment(
                moment(item.Config.to).format("HH:mm"),
                "HH:mm"
              ).get("minute"),
              second: moment(
                moment(item.Config.to).format("HH:mm"),
                "HH:mm"
              ).get("second"),
            })
            .format("YYYY-MM-DD HH:mm"),
        },
      })),
    };
    if (values.deletes && values.deletes.length > 0) {
      await deleteMutation.mutateAsync({ delete: values.deletes });
    }
    addEditMutation.mutate(newValues, {
      onSuccess: () => {
        onHide();
        resetForm();
        window?.top?.toastr &&
          window.top.toastr.success("Cập nhập thành công.", "", {
            timeOut: 500,
          });
      },
    });
  };

  const onChangeCheck = (date) => {
    checkMutation.mutate(
      {
        StockID: AuthCrStockID,
        From: moment(date).format("YYYY-MM-DD"),
        To: moment(date).format("YYYY-MM-DD"),
        pi: 1,
        ps: 1000,
      },
      {
        onSuccess: ({ list }) => {
          if (list && list.length > 0) {
            setInitialValues({
              StockID: AuthCrStockID,
              CreateDate: moment(date).toDate(),
              arr: list.map((item) => ({
                ID: item?.ID,
                Config: {
                  from: moment(item?.Config?.from, "YYYY-MM-DD HH:mm").toDate(),
                  to: moment(item?.Config?.to, "YYYY-MM-DD HH:mm").toDate(),
                  MaxBook: item?.Config?.MaxBook || "",
                },
              })),
              deletes: []
            });
          } else {
            setInitialValues({
              StockID: AuthCrStockID,
              CreateDate: moment(date).toDate(),
              arr: [
                {
                  ID: "",
                  Config: {
                    from: "",
                    to: "",
                    MaxBook: "",
                  },
                },
              ],
              deleles: []
            });
          }
        },
      }
    );
  };

  return (
    <>
      {children({
        open: (val) => {
          setVisible(true);
          setInitialValues(val);
        },
      })}
      {visible &&
        createPortal(
          <Modal
            size="md"
            dialogClassName="md:!max-w-[700px]"
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
                  //handleChange,
                  //handleBlur,
                  setFieldValue,
                } = formikProps;

                return (
                  <Form className="h-100 d-flex flex-column">
                    <Modal.Header className="open-close" closeButton>
                      <Modal.Title className="text-uppercase">
                        Cài đặt ngày
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="!p-5 relative">
                      <div>
                        <div className="mb-6">
                          <div className="mb-px text-gray-800">Ngày</div>
                          <div className="flex gap-2">
                            <DateTimePicker
                              autoComplete="off"
                              name={`CreateDate`}
                              selected={values.CreateDate}
                              onChange={(date) => {
                                setFieldValue(`CreateDate`, date);
                                onChangeCheck(date);
                              }}
                              className={clsx(
                                "!h-11 form-control !text-[15px] !rounded-[4px] grow",
                                errors?.CreateDate &&
                                  touched?.CreateDate &&
                                  "is-invalid solid-invalid"
                              )}
                              shouldCloseOnSelect={true}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Chọn ngày"
                            />
                          </div>
                        </div>
                      </div>
                      <FieldArray
                        name="arr"
                        render={(arrayHelpers) => (
                          <div className="md:pl-8">
                            <div>
                              {values.arr &&
                                values.arr.map((item, index) => (
                                  <div
                                    className={clsx(
                                      "flex items-end gap-4",
                                      "pb-4 mb-3 border-b border-dashed",
                                      "last:border-0 last:!pb-0 last:!mb-0"
                                    )}
                                    key={index}
                                  >
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <div className="mb-px text-gray-800">
                                          Từ thời gian
                                        </div>
                                        <DateTimePicker
                                          autoComplete="off"
                                          //   minDate={new Date()}
                                          minTime={
                                            new Date(
                                              new Date().setHours(
                                                moment(
                                                  TimeOpen,
                                                  "HH:mm:ss"
                                                ).format("HH"),
                                                moment(
                                                  TimeOpen,
                                                  "HH:mm:ss"
                                                ).format("mm"),
                                                0,
                                                0
                                              )
                                            )
                                          }
                                          maxTime={
                                            new Date(
                                              new Date().setHours(
                                                moment(
                                                  TimeClose,
                                                  "HH:mm:ss"
                                                ).format("HH"),
                                                moment(
                                                  TimeClose,
                                                  "HH:mm:ss"
                                                ).format("mm"),
                                                0,
                                                0
                                              )
                                            )
                                          }
                                          name={`arr[${index}].Config.from`}
                                          selected={item.Config.from}
                                          onChange={(date) => {
                                            setFieldValue(
                                              `arr[${index}].Config.from`,
                                              date
                                            );
                                          }}
                                          className={clsx(
                                            "!h-11 form-control !text-[15px] !rounded-[4px]",
                                            errors?.arr &&
                                              errors?.arr[index] &&
                                              errors?.arr[index]?.Config
                                                ?.from &&
                                              touched?.arr &&
                                              touched?.arr[index] &&
                                              touched?.arr[index]?.Config
                                                ?.from &&
                                              "is-invalid solid-invalid"
                                          )}
                                          shouldCloseOnSelect={false}
                                          dateFormat="HH:mm"
                                          placeholderText="Chọn"
                                          timeInputLabel="Thời gian"
                                          showTimeSelect
                                          showTimeSelectOnly
                                          timeFormat="HH:mm"
                                        />
                                      </div>
                                      <div>
                                        <div className="mb-px text-gray-800">
                                          Đến thời gian
                                        </div>
                                        <DateTimePicker
                                          autoComplete="off"
                                          //minDate={new Date()}
                                          minTime={
                                            new Date(
                                              new Date().setHours(
                                                moment(
                                                  TimeOpen,
                                                  "HH:mm:ss"
                                                ).format("HH"),
                                                moment(
                                                  TimeOpen,
                                                  "HH:mm:ss"
                                                ).format("mm"),
                                                0,
                                                0
                                              )
                                            )
                                          }
                                          maxTime={
                                            new Date(
                                              new Date().setHours(
                                                moment(
                                                  TimeClose,
                                                  "HH:mm:ss"
                                                ).format("HH"),
                                                moment(
                                                  TimeClose,
                                                  "HH:mm:ss"
                                                ).format("mm"),
                                                0,
                                                0
                                              )
                                            )
                                          }
                                          name={`arr[${index}].Config.to`}
                                          selected={item.Config.to}
                                          onChange={(date) => {
                                            setFieldValue(
                                              `arr[${index}].Config.to`,
                                              date
                                            );
                                          }}
                                          className={clsx(
                                            "!h-11 form-control !text-[15px] !rounded-[4px]",
                                            errors?.arr &&
                                              errors?.arr[index] &&
                                              errors?.arr[index]?.Config?.to &&
                                              touched?.arr &&
                                              touched?.arr[index] &&
                                              touched?.arr[index]?.Config?.to &&
                                              "is-invalid solid-invalid"
                                          )}
                                          shouldCloseOnSelect={false}
                                          dateFormat="HH:mm"
                                          placeholderText="Chọn"
                                          timeInputLabel="Thời gian"
                                          showTimeSelect
                                          showTimeSelectOnly
                                          timeFormat="HH:mm"
                                        />
                                      </div>
                                      <div>
                                        <div className="mb-px text-gray-800">
                                          Số lịch được đặt
                                        </div>
                                        <NumericFormat
                                          allowLeadingZeros
                                          name={`arr[${index}].Config.MaxBook`}
                                          value={item.Config.MaxBook}
                                          className={clsx(
                                            "!h-11 form-control !text-[15px] !rounded-[4px]",
                                            errors?.arr &&
                                              errors?.arr[index] &&
                                              errors?.arr[index]?.Config
                                                ?.MaxBook &&
                                              touched?.arr &&
                                              touched?.arr[index] &&
                                              touched?.arr[index]?.Config
                                                ?.MaxBook &&
                                              "is-invalid solid-invalid"
                                          )}
                                          placeholder="Nhập số lịch"
                                          onValueChange={(val) =>
                                            setFieldValue(
                                              `arr[${index}].Config.MaxBook`,
                                              typeof val.floatValue ===
                                                "undefined"
                                                ? ""
                                                : val.floatValue
                                            )
                                          }
                                          autoComplete="off"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <div
                                        className="flex items-center justify-center cursor-pointer w-11 h-11 bg-[#f6f6f6] text-danger rounded-[4px]"
                                        onClick={() => {
                                          arrayHelpers.remove(index);
                                          if (item?.ID) {
                                            setFieldValue("deletes", [
                                              ...values.deletes,
                                              item.ID,
                                            ]);
                                          }
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="w-5"
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
                                ))}
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() =>
                                  arrayHelpers.push({
                                    ID: "",
                                    Config: {
                                      from:
                                        (values?.arr &&
                                          values?.arr.length > 0 &&
                                          values?.arr[values?.arr.length - 1]
                                            ?.Config?.to) ||
                                        "",
                                      to: "",
                                      MaxBook: "",
                                    },
                                  })
                                }
                                className="h-[40px] items-center flex border border-[#d3d3d3] rounded-full px-4 text-[14px] bg-[#fff] hover:!bg-white text-success"
                                type="button"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                  className="w-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="pl-2">
                                  Thêm khoảng thời gian
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      />
                      {checkMutation?.isLoading && (
                        <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-white/[.6]">
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="w-8 h-8 text-gray-500 animate-spin fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      )}
                    </Modal.Body>
                    <Modal.Footer className="gap-2">
                      <button
                        type="button"
                        onClick={onHide}
                        className="btn btn-sm btn-secondary"
                      >
                        Đóng
                      </button>
                      <button
                        className="relative w-auto h-auto my-0 mr-0 btn btn-sm btn-primary"
                        type="submit"
                        disabled={addEditMutation.isLoading}
                      >
                        <span
                          className={clsx(
                            addEditMutation.isLoading && "opacity-0"
                          )}
                        >
                          Lưu cài đặt
                        </span>
                        {addEditMutation.isLoading && (
                          <div
                            className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4"
                            role="status"
                          >
                            <svg
                              aria-hidden="true"
                              role="status"
                              className="w-6 text-white animate-spin"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="#E5E7EB"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        )}
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

export default PickerAddEditBookOnline;
