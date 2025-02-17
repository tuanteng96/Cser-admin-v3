import React, { Fragment, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FieldArray, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import { Portal } from "react-overlays";
import { TimePicker } from "antd";

import "antd/dist/antd.min.css";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

const CalendarContainer = ({ children }) => {
  const el = document.getElementById("calendar-portal");

  return <Portal container={el}>{children}</Portal>;
};

function ModalCalendarLock({
  show,
  onHide,
  onSubmit,
  ListLock,
  btnLoadingLock,
  AuthCrStockID,
  refetch,
  isLoading,
}) {
  useEffect(() => {
    if (show) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Modal
      size="md"
      dialogClassName="modal-max-sm"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <Formik
        initialValues={ListLock}
        //validationSchema={CalendarSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {(formikProps) => {
          const { values, setFieldValue } = formikProps;

          return (
            <Form className="h-100 d-flex flex-column">
              <Modal.Header className="open-close" closeButton>
                <Modal.Title className="text-uppercase">
                  Cài đặt khóa lịch
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {!AuthCrStockID ? (
                  <div className="text-danger">
                    Bạn vui lòng chọn điểm muốn cài đặt khóa lịch.
                  </div>
                ) : (
                  <FieldArray
                    name="ListLocks"
                    render={(ListLocksHelpers) => (
                      <Fragment>
                        {values.ListLocks &&
                          values.ListLocks.map((lock, i) => (
                            <div
                              className={`${Number(AuthCrStockID) !==
                                Number(lock.StockID) && "d-none"}`}
                              key={i}
                            >
                              <FieldArray
                                name={`ListLocks[${i}].ListDisable`}
                                render={(ListDisableHelpers) => (
                                  <div>
                                    {values.ListLocks[i].ListDisable &&
                                    values.ListLocks[i].ListDisable.length >
                                      0 ? (
                                      values.ListLocks[i].ListDisable.map(
                                        (item, index) => (
                                          <div
                                            className={`${
                                              values.ListLocks[i].ListDisable
                                                .length -
                                                1 ===
                                              index
                                                ? ""
                                                : "mb-20px"
                                            }`}
                                            key={index}
                                          >
                                            <div className="d-flex mb-5px">
                                              <DatePicker
                                                className="form-control font-size-sm"
                                                selected={
                                                  item.Date
                                                    ? moment(
                                                        item.Date,
                                                        "DD/MM/YYYY"
                                                      ).toDate()
                                                    : ""
                                                }
                                                onChange={(date) => {
                                                  setFieldValue(
                                                    `ListLocks[${i}].ListDisable[${index}.Date]`,
                                                    date
                                                  );
                                                }}
                                                popperContainer={
                                                  CalendarContainer
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Chọn ngày"
                                              />
                                              <button
                                                type="button"
                                                className="btn btn-light-success btn-sm ml-5px"
                                                onClick={() =>
                                                  ListDisableHelpers.push({
                                                    Date: "",
                                                    TimeClose: [
                                                      {
                                                        Start: "",
                                                        End: "",
                                                      },
                                                    ],
                                                  })
                                                }
                                              >
                                                <i className="pr-0 fal fa-plus font-size-xs"></i>
                                              </button>
                                              <button
                                                type="button"
                                                className="btn btn-light-danger btn-sm ml-5px"
                                                onClick={() =>
                                                  ListDisableHelpers.remove(
                                                    index
                                                  )
                                                }
                                              >
                                                <i className="pr-0 far fa-trash-alt font-size-xs"></i>
                                              </button>
                                            </div>

                                            <FieldArray
                                              name={`ListLocks[${i}].ListDisable[${index}].TimeClose`}
                                              render={(TimeCloseHelpers) => (
                                                <div
                                                  className={`listtime-lock pl-20px ${(!item.TimeClose ||
                                                    item.TimeClose.length ===
                                                      0) &&
                                                    "d-none"}`}
                                                >
                                                  {item.TimeClose &&
                                                    item.TimeClose.map(
                                                      (time, idx) => (
                                                        <div
                                                          className={`${
                                                            item.TimeClose
                                                              .length -
                                                              1 ===
                                                            idx
                                                              ? ""
                                                              : "mb-5px"
                                                          } listtime-lock__item`}
                                                          key={idx}
                                                        >
                                                          <div className="d-flex">
                                                            <TimePicker.RangePicker
                                                              onChange={(
                                                                val
                                                              ) => {
                                                                setFieldValue(
                                                                  `ListLocks[${i}].ListDisable[${index}].TimeClose[${idx}].Start`,
                                                                  val &&
                                                                    moment(
                                                                      val[0]
                                                                    ).format(
                                                                      "HH:mm"
                                                                    )
                                                                );
                                                                setFieldValue(
                                                                  `ListLocks[${i}].ListDisable[${index}].TimeClose[${idx}].End`,
                                                                  val &&
                                                                    moment(
                                                                      val[1]
                                                                    ).format(
                                                                      "HH:mm"
                                                                    )
                                                                );
                                                              }}
                                                              format="HH:mm"
                                                              value={[
                                                                time.Start
                                                                  ? moment(
                                                                      time.Start,
                                                                      "HH:mm"
                                                                    )
                                                                  : "",
                                                                time.End
                                                                  ? moment(
                                                                      time.End,
                                                                      "HH:mm"
                                                                    )
                                                                  : "",
                                                              ]}
                                                              placeholder={[
                                                                "Bắt đầu",
                                                                "Kết thúc",
                                                              ]}
                                                              className="w-100"
                                                            />
                                                            <button
                                                              type="button"
                                                              className="btn btn-light-success btn-sm ml-5px"
                                                              onClick={() =>
                                                                TimeCloseHelpers.push(
                                                                  {
                                                                    Start: "",
                                                                    End: "",
                                                                  }
                                                                )
                                                              }
                                                            >
                                                              <i className="pr-0 fal fa-plus font-size-xs"></i>
                                                            </button>
                                                            <button
                                                              type="button"
                                                              className="btn btn-light-danger btn-sm ml-5px"
                                                              onClick={() =>
                                                                TimeCloseHelpers.remove(
                                                                  idx
                                                                )
                                                              }
                                                            >
                                                              <i className="pr-0 far fa-trash-alt font-size-xs"></i>
                                                            </button>
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                </div>
                                              )}
                                            />
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div>
                                        Bạn chưa có lịch khóa trong từ hôm nay
                                        cho tới các ngày sắp tới. Vui lòng
                                        <span
                                          className="cursor-pointer text-primary font-weight-bold text-decoration-underline pl-5px"
                                          onClick={() =>
                                            ListDisableHelpers.push({
                                              Date: "",
                                              TimeClose: [
                                                {
                                                  Start: "",
                                                  End: "",
                                                },
                                              ],
                                            })
                                          }
                                        >
                                          Tạo khóa lịch mới
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          ))}
                      </Fragment>
                    )}
                  />
                )}
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
                    btnLoadingLock || isLoading
                      ? "spinner spinner-white spinner-right"
                      : ""
                  } w-auto my-0 mr-0 h-auto`}
                  disabled={btnLoadingLock || isLoading}
                >
                  Cập nhập khóa lịch
                </button>
              </Modal.Footer>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}

export default ModalCalendarLock;
