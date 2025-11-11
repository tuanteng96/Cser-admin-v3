import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { AdminAPI } from "../api";
import { InputDatePicker } from "../partials";
import moment from "moment";

const schema = yup.object().shape({
  CreateDate: yup.string().required("Vui lòng chọn ngày."),
  Point: yup.string().required("Vui lòng nhập số điểm"),
});

function PickerEditPoint({ children, data, MemberID }) {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      CreateDate: "",
      Desc: "",
      MemberID: "",
      Point: "",
      ID: "",
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (data) {
      reset({
        CreateDate: data.CreateDate,
        Desc: data.Desc,
        MemberID: data.MemberID,
        Point: Math.abs(data.Point),
        ID: data.ID,
      });
    }
  }, [visible]);

  let open = () => {
    setVisible(true);
  };

  let close = () => {
    setVisible(false);
  };

  const changeMutation = useMutation({
    mutationFn: async (body) => {
      let data = await AdminAPI.PointsEditId(body);
      await queryClient.invalidateQueries(["Points"]);

      return data;
    },
  });

  const onSubmit = (values) => {
    let newValues = {
      ...values,
      CreateDate: values.CreateDate
        ? moment(values.CreateDate).format("YYYY-MM-DD HH:mm")
        : "",
    };
    changeMutation.mutate(
      {
        data: {
          edit: [newValues],
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data?.error) {
            window.top.toastr &&
              dow.top.toastr.error(data?.error, "", {
                timeOut: 800,
              });
          } else {
            close();
            window.top.toastr &&
              window.top.toastr.success("Chỉnh sửa thành công.", "", {
                timeOut: 800,
              });
            window?.top?.top?.UpdatePresents &&
              window?.top?.top?.UpdatePresents({ forceReload: true });
          }
        },
      }
    );
  };

  const handleSubmitWithoutPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <AnimatePresence initial={false}>
      <>
        {children({ open, close })}
        {visible &&
          createPortal(
            <div className="fixed z-[10] inset-0 flex justify-end flex-col">
              <motion.div
                key={visible}
                className="absolute inset-0 bg-black/[.2] dark:bg-black/[.4] z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              ></motion.div>
              <motion.div
                className="relative flex flex-col z-20 bg-white rounded-t-[15px]"
                initial={{ opacity: 0, translateY: "100%" }}
                animate={{ opacity: 1, translateY: "0%" }}
                exit={{ opacity: 0, translateY: "100%" }}
              >
                <div className="relative px-5 py-5 text-xl font-semibold text-left">
                  Chỉnh sửa tích điểm
                  <div
                    className="absolute top-0 right-0 flex items-center justify-center w-12 h-full"
                    onClick={close}
                  >
                    <XMarkIcon className="w-7" />
                  </div>
                </div>
                <form
                  className="flex flex-col h-full pb-safe-b"
                  onSubmit={handleSubmitWithoutPropagation}
                >
                  <div className="px-5 overflow-auto grow">
                    <div className="mb-3.5 last:mb-0">
                      <div className="mb-px">Thời gian</div>
                      <Controller
                        name="CreateDate"
                        control={control}
                        render={({ field, fieldState }) => (
                          <InputDatePicker
                            //popperPlacement='top-start'
                            placeholderText="Chọn thời gian"
                            autoComplete="off"
                            onChange={field.onChange}
                            selected={
                              field.value ? new Date(field.value) : null
                            }
                            dateFormat="HH:mm dd/MM/yyyy"
                            showTimeSelect
                            timeFormat="HH:mm"
                          />
                        )}
                      />
                    </div>
                    <div className="mb-3.5 last:mb-0">
                      <div className="mb-px">Số điểm</div>
                      <Controller
                        name="Point"
                        control={control}
                        render={({ field, fieldState }) => (
                          <div className="relative">
                            <NumericFormat
                              className={clsx(
                                "w-full input-number-format border rounded py-3 px-4 focus:border-primary outline-none",
                                fieldState?.invalid
                                  ? "border-danger"
                                  : "border-[#d5d7da]"
                              )}
                              type="text"
                              autoComplete="off"
                              thousandSeparator={false}
                              placeholder="Số điểm"
                              value={field.value}
                              onValueChange={(val) =>
                                field.onChange(val.floatValue || "")
                              }
                            />
                            {field.value ? (
                              <div
                                className="absolute top-0 right-0 flex items-center justify-center w-12 h-full"
                                onClick={() => field.onChange("")}
                              >
                                <XMarkIcon className="w-5" />
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="mb-3.5 last:mb-0">
                      <div className="mb-px">Ghi chú</div>
                      <Controller
                        name="Desc"
                        control={control}
                        render={({ field, fieldState }) => (
                          <textarea
                            className="w-full px-4 py-3 border rounded border-[#d5d7da] focus:border-primary outline-none"
                            type="textarea"
                            placeholder="Nhập ghi chú"
                            rows="3"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          ></textarea>
                        )}
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <button
                      type="submit"
                      className={clsx(
                        "flex items-center justify-center w-full h-12 px-5 text-white rounded md:w-auto md:inline-flex bg-primary disabled:opacity-50"
                      )}
                      disabled={changeMutation.isPending}
                    >
                      Cập nhật thay đổi
                      {changeMutation.isPending && (
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline ml-4 text-white w-7 animate-spin"
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
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>,
            document.getElementById("root")
          )}
      </>
    </AnimatePresence>
  );
}

export default PickerEditPoint;
