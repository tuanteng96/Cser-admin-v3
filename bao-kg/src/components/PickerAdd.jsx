import { useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SelectMembers } from "../partials/select/SelectMembers";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { useMutation, useQueryClient } from "react-query";
import MembersAPI from "../api/members.api";
import { InputDatePicker } from "../partials/forms";
import moment from "moment";

const schemaAddEdit = yup
  .object({
    CreateDate: yup.string().required("Vui lòng chọn ngày"),
    MemberID: yup.object().nullable().required("Vui lòng chọn khách hàng"),
    Value: yup.string().required("Vui lòng nhập số KG"),
  })
  .required();

function PickerAdd({ children }) {
  const [visible, setVisible] = useState();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      Value: "",
      MemberID: null,
      CreateDate: "",
    },
    resolver: yupResolver(schemaAddEdit),
  });

  const saveNoteMutation = useMutation({
    mutationFn: (body) => MembersAPI.saveNoteKgDate(body),
  });

  const onSubmit = (values) => {
    saveNoteMutation.mutate(
      {
        edit: [
          {
            ...values,
            MemberID: values.MemberID.value,
            CreateDate: moment(values.CreateDate).format("YYYY-MM-DD"),
          },
        ],
      },
      {
        onSuccess: ({ data }) => {
          if (!data?.error) {
            queryClient
              .invalidateQueries({ queryKey: ["ListReportKG"] })
              .then(() => {
                window?.top?.toastr?.error("Thêm mới thành công.", {
                  timeOut: 1500,
                });
                onHide();
              });
          } else {
            window?.top?.toastr?.error(data?.error, { timeOut: 1500 });
          }
        },
        onError: (error) => console.log(error),
      }
    );
  };

  const onHide = () => {
    reset();
    setVisible(false);
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}

      <FloatingPortal root={document.body}>
        {visible && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="fixed inset-0 flex items-center justify-center z-[1003]"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            <motion.div
              className="absolute inset-0 bg-black/[.2] dark:bg-black/[.4]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onHide}
            ></motion.div>
            <motion.div
              className="absolute flex flex-col justify-center h-full py-8 px-4 sm:px-0 w-[450px] max-w-full"
              initial={{ opacity: 0, top: "60%" }}
              animate={{ opacity: 1, top: "auto" }}
              exit={{ opacity: 0, top: "60%" }}
            >
              <div className="bg-white dark:bg-dark-aside flex flex-col rounded shadow-lg max-h-full">
                <div className="relative flex justify-between px-5 py-4 border-b border-separator dark:border-dark-separator">
                  <div className="text-2xl font-bold">Thêm mới</div>
                  <div
                    className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-2 top-2/4 -translate-y-2/4"
                    onClick={onHide}
                  >
                    <XMarkIcon className="w-8" />
                  </div>
                </div>
                <div className="p-5 overflow-auto grow">
                  <div className="mb-5">
                    <div className="font-medium">Ngày</div>
                    <div className="mt-1">
                      <Controller
                        name="CreateDate"
                        control={control}
                        render={({ field: { ref, ...field }, fieldState }) => (
                          <div>
                            <InputDatePicker
                              placeholderText="Chọn ngày"
                              dateFormat="dd/MM/yyyy"
                              onChange={field.onChange}
                              selected={field.value}
                              errorMessage={fieldState.message}
                              errorMessageForce={fieldState?.invalid}
                            />
                            {fieldState?.invalid &&
                              fieldState?.error?.message && (
                                <div className="mt-1.5 text-sm text-danger">
                                  {fieldState?.error?.message}
                                </div>
                              )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <div className="font-medium">Khách hàng</div>
                    <div className="mt-1">
                      <Controller
                        name="MemberID"
                        control={control}
                        render={({ field: { ref, ...field }, fieldState }) => (
                          <div>
                            <SelectMembers
                              isClearable
                              className={clsx(
                                "select-control",
                                fieldState?.invalid && "select-control-error"
                              )}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState?.invalid &&
                              fieldState?.error?.message && (
                                <div className="mt-1.5 text-sm text-danger">
                                  {fieldState?.error?.message}
                                </div>
                              )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Số KG</div>
                    <div className="mt-1">
                      <Controller
                        name="Value"
                        control={control}
                        render={({ field: { ref, ...field }, fieldState }) => (
                          <div>
                            <NumericFormat
                              className={clsx(
                                "w-full px-3.5 py-3 placeholder:font-normal font-medium text-gray-800 transition bg-white autofill:bg-white border rounded outline-none dark:bg-site-aside disabled:bg-gray-200 disabled:border-gray-200 dark:disabled:bg-graydark-200 dark:text-graydark-700",
                                fieldState?.invalid
                                  ? "border-danger"
                                  : "border-gray-300 dark:border-graydark-400 focus:border-primary dark:focus:border-primary"
                              )}
                              value={field.Value}
                              thousandSeparator={false}
                              placeholder="Nhập số Kilogram"
                              onValueChange={(val) =>
                                field.onChange(
                                  val.floatValue ? val.floatValue : val.value
                                )
                              }
                              allowLeadingZeros={true}
                            />
                            {fieldState?.invalid &&
                              fieldState?.error?.message && (
                                <div className="mt-1.5 text-sm text-danger">
                                  {fieldState?.error?.message}
                                </div>
                              )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end p-5 border-t border-separator dark:border-dark-separator">
                  <button
                    onClick={onHide}
                    type="button"
                    className="relative flex items-center px-4 transition border border-gray-300 rounded shadow-lg dark:border-gray-700 h-[40.5px] hover:border-gray-800 focus:outline-none focus:shadow-none"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={saveNoteMutation.isLoading}
                    type="submit"
                    className="relative flex items-center px-4 ml-2 text-white transition rounded shadow-lg bg-primary hover:bg-primaryhv h-[40.5px] focus:outline-none focus:shadow-none disabled:opacity-70"
                  >
                    {saveNoteMutation.isLoading && "Đang thực hiện"}
                    {!saveNoteMutation.isLoading && "Thêm mới"}
                  </button>
                </div>
              </div>
            </motion.div>
          </form>
        )}
      </FloatingPortal>
    </>
  );
}

PickerAdd.propTypes = {};

export default PickerAdd;
