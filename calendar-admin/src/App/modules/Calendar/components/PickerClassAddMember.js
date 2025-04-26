import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createPortal } from "react-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import SelectMember from "../../../../components/Select/SelectMember/SelectMember";
import SelectOsMember from "../../../../components/Select/SelectOsMember/SelectOsMember";
import moment from "moment";

const AddEditSchema = Yup.object().shape({
  Member: Yup.object().required("Vui lòng chọ học viên."),
  Service: Yup.object().required("Vui lòng chọn thẻ liệu trình."),
});

function PickerClassAddMember({
  children,
  initialValue,
  initial,
  ProdIDs,
  DateFrom,
  onClose,
  refetch,
}) {
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(false);
  let [initialValues, setInitialValues] = useState({
    Member: null,
    Service: null,
  });

  useEffect(() => {
    if (visible) {
      setInitialValues({
        Member: null,
        Service: null,
      });
    }
  }, [visible]);

  const onHide = () => setVisible(false);

  const addEditMutation = useMutation({
    mutationFn: async ({ data, update }) => {
      let rs = await CalendarCrud.CalendarClassMembersAddEdit(data);
      await CalendarCrud.CalendarClassMembersUpdateOs(update);
      await queryClient.invalidateQueries({
        queryKey: ["CalendarClassMembers"],
      });
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const checkClassMutation = useMutation({
    mutationFn: async (body) => {
      let { Items } = await CalendarCrud.getCalendarClassMembers({
        ClassIDs: [initial?.Class?.ID],
        TeachIDs: [],
        StockID: [initial?.Class?.StockID],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(initial?.DateFrom)
          .set({
            hour: moment(initial?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initial?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initial?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(initial?.DateFrom)
          .set({
            hour: moment(initial?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initial?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initial?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Pi: 1,
        Ps: 20,
      });
      return Items && Items.length > 0 ? Items[0] : null;
    },
  });

  const onSubmit = async (values, { resetForm, setFieldError }) => {
    let CrClass = await checkClassMutation.mutateAsync();
    if (!CrClass) {
      await queryClient.invalidateQueries({
        queryKey: ["CalendarClass"],
      });
      window?.top?.toastr?.error("Lớp không tồn tại hoặc đã bị xoá.", "", {
        timeOut: 600,
      });
      onHide();
      onClose();
    } else {
      let newLists = [...CrClass.Member.Lists];
      let index = newLists.findIndex(
        (x) => x?.Member?.ID === values?.Member?.value
      );
      if (index > -1) {
        await refetch();
        setFieldError("Member", "Học viên đã thuộc lớp.");
      } else {
        let newLists = [...CrClass.Member.Lists];
        newLists.push({
          Member: {
            MemberID: values?.Member?.value,
            FullName: values?.Member?.label,
            ID: values?.Member?.value,
            Phone: values?.Member?.phone,
          },
          Os: {
            OsID: values?.Service?.value,
            ID: values?.Service?.value,
            Title: values?.Service?.label,
          },
          Status: "",
        });
        let newValues = {
          arr: [
            {
              ...initialValue,
              TeacherID: CrClass.TeacherID,
              Member: {
                ...CrClass.Member,
                Lists: newLists,
              },
            },
          ],
        };
        addEditMutation.mutate(
          {
            data: newValues,
            update: {
              arr: [
                {
                  ID: values?.Service?.value,
                  Desc: "(Đã xếp lớp)",
                  UserID: 0,
                },
              ],
            },
          },
          {
            onSuccess: () => {
              resetForm();
              onHide();
              window?.top?.toastr?.success("Thêm vào lớp thành công.", "", {
                timeOut: 200,
              });
            },
          }
        );
      }
    }
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <Modal
            // size="md"
            // dialogClassName="modal-max-sm modal-content-right"
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
                  handleBlur,
                  setFieldValue,
                } = formikProps;

                return (
                  <Form className="h-100 d-flex flex-column">
                    <Modal.Header className="open-close" closeButton>
                      <Modal.Title className="text-uppercase">
                        Thêm học viên vào lớp
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">Học viên</div>
                        <div>
                          <SelectMember
                            removeMembers={
                              initialValue?.Member?.Lists
                                ? initialValue?.Member?.Lists.map(
                                    (x) => x.Member.ID
                                  )
                                : null
                            }
                            classIcon="fas fa-user-plus"
                            menuPlacement="bottom"
                            className={clsx(
                              "select-control select-control-md",
                              errors.Member &&
                                touched.Member &&
                                "is-invalid solid-invalid"
                            )}
                            classNamePrefix="select"
                            name="Member"
                            value={values.Member}
                            onChange={(option) => {
                              setFieldValue("Member", option);
                              setFieldValue("Service", null);
                            }}
                            isClearable
                            isSearchable
                            placeholder="Chọn học viên"
                            noOptionsMessage={({ inputValue }) =>
                              !inputValue
                                ? "Nhập thông tin học viên cần tìm ?"
                                : "Không tìm thấy học viên"
                            }
                            menuPortalTarget={document.body}
                            //defaultOptions={false}
                          />
                        </div>
                      </div>
                      <div className="mb-3.5 last:mb-0">
                        <div className="mb-px text-gray-700">
                          Thẻ liệu trình
                        </div>
                        <SelectOsMember
                          callback={(val) => {
                            setFieldValue("Service", val);
                          }}
                          isClearable
                          isDisabled={!values?.Member}
                          Member={values?.Member}
                          ProdIDs={ProdIDs}
                          DateFrom={DateFrom}
                          className={clsx(
                            "select-control select-control-md",
                            errors.Service &&
                              touched.Service &&
                              "is-invalid solid-invalid"
                          )}
                          classNamePrefix="select"
                          value={values.Service}
                          isSearchable
                          name="Service"
                          placeholder="Chọn thẻ liệu trình"
                          onChange={(option) => {
                            setFieldValue("Service", option);
                          }}
                          menuPosition="fixed"
                          onBlur={handleBlur}
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
                          Thêm vào lớp
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

export default PickerClassAddMember;
