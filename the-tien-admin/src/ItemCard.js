import React, { useEffect, useState } from "react";
import axiosClient from "./axios/axiosClient";
import moment from "moment";
import "moment/locale/vi";
import { useLayoutEffect } from "react";
import { ArrowContainer, Popover } from "react-tiny-popover";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Modal } from "react-bootstrap";
import { NumericFormat } from "react-number-format";
import { useRoles } from "./helpers/useRoles";

moment.locale("vi");

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useLayoutEffect(() => {
    handleSize();

    window.addEventListener("resize", handleSize);

    return () => window.removeEventListener("resize", handleSize);
  }, []);

  return windowSize;
};

const PopoverRender = ({ children }) => {
  let [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={["top", "bottom", "left", "right"]}
      onClickOutside={() => setIsPopoverOpen(false)}
      content={({ position, childRect, popoverRect }) => (
        <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={"white"}
          arrowSize={7}
          arrowStyle={{ opacity: 0.7 }}
          className="popover-arrow-container"
          arrowClassName="popover-arrow"
        >
          <div className="bg-white shadow-lg border-0 rounded text-sm">
            {children}
          </div>
        </ArrowContainer>
      )}
    >
      <i
        className="fa-solid fa-circle-info text-warning ml-2"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      ></i>
    </Popover>
  );
};

const PopoverDate = ({ children, CreateDate, sub, positions = ["right"] }) => {
  let [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      date: CreateDate ? CreateDate : null,
    },
  });

  useEffect(() => {
    reset({ date: new Date(CreateDate) });
  }, [CreateDate, reset, isPopoverOpen]);

  const updateMutation = useMutation({
    mutationFn: (body) =>
      axiosClient.post(
        `/api/v3/moneycard?cmd=update_date`,
        JSON.stringify(body)
      ),
  });

  const onSubmit = (values) => {
    updateMutation.mutate(
      {
        edit: {
          OrderItemID: sub?.OrderItemID,
          ngay: sub?.ngay ? moment(sub?.ngay).format("HH:mm YYYY-MM-DD") : null,
          ngay_moi: values?.date
            ? moment(values?.date).format("HH:mm YYYY-MM-DD")
            : null,
        },
      },
      {
        onSuccess: () => {
          queryClient
            .invalidateQueries({ queryKey: ["MoneyCards"] })
            .then(() => {
              window.top?.bodyEvent &&
                window.top?.bodyEvent("ui_changed", {
                  name: "tt_thay_doi_the",
                  moneyCardId: values.ID,
                });
              window.top?.toastr?.success("Cập nhập thành công.", "", {
                timeOut: 1000,
              });
              setIsPopoverOpen(false);
            });
        },
      }
    );
  };

  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={positions}
      onClickOutside={(e) => {
        if (!e.target.className.includes("eact-datepicker")) {
          setIsPopoverOpen(false);
        }
      }}
      transform={{ left: 100 }}
      content={({ position, childRect, popoverRect }) => (
        <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={"white"}
          arrowSize={7}
          arrowStyle={{ opacity: 0.7 }}
          className="popover-arrow-container"
          arrowClassName="popover-arrow"
        >
          <div className="bg-white shadow-lg border-0 rounded text-sm p-[12px] w-[250px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="text-[13px] mb-[3px] text-muted">Chọn ngày</div>
              <Controller
                control={control}
                name="date"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <DatePicker
                      wrapperClassName="w-full"
                      className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                      selected={value}
                      onChange={(date) => onChange(date)}
                      dateFormat="HH:mm dd/MM/yyyy"
                      placeholderText="Chọn ngày"
                      showTimeSelect
                      popperPlacement="bottom-end"
                    />
                  </>
                )}
              />
              <button
                type="submit"
                className="w-full text-white !rounded h-[42px] px-3 text-sm !bg-success mt-2.5 text-truncate flex items-center justify-center disabled:opacity-70"
                disabled={updateMutation.isLoading}
              >
                Cập nhập
                {updateMutation.isLoading && (
                  <div className="ml-3">
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-5 h-5 text-white animate-spin"
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
            </form>
          </div>
        </ArrowContainer>
      )}
    >
      {children({
        open: () => setIsPopoverOpen(!isPopoverOpen),
      })}
    </Popover>
  );
};

const PickerModal = ({ children, item }) => {
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      ID: "",
      MoneyEndDate: null,
      Value: "",
      MoneyTotal: "",
      MoneyProd: "",
      MoneyService: "",
    },
  });

  useEffect(() => {
    reset({
      ID: item?.id,
      MoneyEndDate: item?.han_dung || null,
      Value: item?.gia_tri_the,
      MoneyTotal: item?.gia_tri_chi_tieu,
      MoneyProd: item.gia_tri_chi_tieu_sp,
      MoneyService: item.gia_tri_chi_tieu_dv,
    });
  }, [item, reset]);

  const updateMutation = useMutation({
    mutationFn: (body) =>
      axiosClient.post(`/api/v3/moneycard?cmd=adminEdit`, JSON.stringify(body)),
  });

  const onSubmit = (values) => {
    updateMutation.mutate(
      {
        edit: {
          ...values,
          MoneyEndDate: values?.MoneyEndDate
            ? moment(values?.MoneyEndDate).format("YYYY-MM-DD")
            : null,
        },
      },
      {
        onSuccess: () => {
          queryClient
            .invalidateQueries({ queryKey: ["MoneyCards"] })
            .then(() => {
              window.top?.bodyEvent &&
                window.top?.bodyEvent("ui_changed", {
                  name: "tt_thay_doi_the",
                  moneyCardId: values.ID,
                });
              window.top?.toastr?.success("Cập nhập thành công.", "", {
                timeOut: 1000,
              });
              setVisible(false);
            });
        },
      }
    );
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
      })}
      <Modal
        dialogClassName="!max-w-[400px]"
        contentClassName="border-0"
        show={visible}
        onHide={() => setVisible(false)}
        scrollable={true}
      >
        <form
          className="h-full flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="!text-[18px]">{item.ten}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3 last:!mb-0">
              <div className="text-[13px] mb-[3px] text-muted">Hạn sử dụng</div>
              <Controller
                control={control}
                name="MoneyEndDate"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <DatePicker
                    wrapperClassName="w-full"
                    className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                    selected={value}
                    onChange={(date) => onChange(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày"
                  />
                )}
              />
            </div>
            <div className="mb-3 last:!mb-0">
              <div className="text-[13px] mb-[3px] text-muted">
                Giá trị thẻ tiền
              </div>
              <Controller
                control={control}
                name="Value"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <NumericFormat
                    className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                    type="text"
                    placeholder="Nhập giá trị"
                    value={value}
                    onValueChange={(val) =>
                      onChange(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    thousandSeparator={true}
                    allowNegative={false}
                  />
                )}
              />
            </div>
            <div className="mb-3 last:!mb-0">
              <div className="text-[13px] mb-[3px] text-muted">
                Giá trị chi tiêu
              </div>
              <Controller
                control={control}
                name="MoneyTotal"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <NumericFormat
                    className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                    type="text"
                    placeholder="Nhập giá trị"
                    value={value}
                    onValueChange={(val) =>
                      onChange(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    thousandSeparator={true}
                    allowNegative={false}
                  />
                )}
              />
            </div>
            <div className="mb-3 last:!mb-0">
              <div className="text-[13px] mb-[3px] text-muted">
                Giá trị chi tiêu sản phẩm
              </div>
              <Controller
                control={control}
                name="MoneyProd"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <NumericFormat
                    className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                    type="text"
                    placeholder="Nhập giá trị"
                    value={value}
                    onValueChange={(val) =>
                      onChange(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    thousandSeparator={true}
                    allowNegative={false}
                  />
                )}
              />
            </div>
            <div className="mb-3 last:!mb-0">
              <div className="text-[13px] mb-[3px] text-muted">
                Giá trị chi tiêu dịch vụ
              </div>
              <Controller
                control={control}
                name="MoneyService"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <NumericFormat
                    className="w-full border text-[14px] h-[42px] px-2.5 rounded-[5px] focus:outline-none focus:!border-primary"
                    type="text"
                    placeholder="Nhập giá trị"
                    value={value}
                    onValueChange={(val) =>
                      onChange(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    thousandSeparator={true}
                    allowNegative={false}
                  />
                )}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="!rounded text-white !rounded h-10 px-3 text-sm !bg-[#6c757d] text-truncate"
              onClick={() => setVisible(false)}
            >
              Đóng
            </button>
            <button
              className="!rounded text-white !rounded h-10 px-3 text-sm !bg-primary text-truncate flex items-center disabled:opacity-70"
              disabled={updateMutation.isLoading}
            >
              Cập nhập
              {updateMutation.isLoading && (
                <div className="ml-3">
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-5 h-5 text-white animate-spin"
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
        </form>
      </Modal>
    </>
  );
};

export default function ItemCard({ item, onRefetch, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowSize();

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const changeCard = (item) => {
    updateMutation.mutate(
      { id: item.id },
      {
        onSuccess: () => {
          window.top?.bodyEvent &&
            window.top?.bodyEvent("ui_changed", {
              name: "tt_thay_doi_the",
              moneyCardId: item.id,
            });
          onRefetch().then(() => {
            window.top?.toastr?.success(
              `${
                item.trang_thai === "Khóa"
                  ? "Kích hoạt thẻ tiền thành công"
                  : "Khóa thẻ tiền thành công"
              }`,
              "",
              { timeOut: 2000 }
            );
          });
        },
      }
    );
  };

  const formatVND = (price) => {
    if (typeof price === "undefined" || price === null) return false;
    return price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  };

  const updateMutation = useMutation({
    mutationFn: (body) =>
      axiosClient.get(`/api/v3/moneycard?cmd=lock&id=${body.id}`),
  });

  const MoneyCardDetail = useQuery({
    queryKey: ["todos", item],
    queryFn: async () => {
      let { data } = await axiosClient.get(
        `/api/v3/moneycard?cmd=detail&id_the_tien=${item.id}`
      );
      return data?.data || [];
    },
    enabled: isOpen,
  });

  if (width < 768) {
    return (
      <div className="border mb-3 last:!mb-0 !rounded text-xs">
        <div className="border-b p-3 bg-light">
          <div>
            <span className="font-medium md:text-sm bg-success-light !text-success text-mini py-px px-1.5 !rounded font-medium inline-block mr-1.5">
              #{item.id}
            </span>
            {item.trang_thai === "Khóa" && (
              <span className="font-medium md:text-sm bg-danger-light !text-danger text-mini py-px px-1.5 !rounded font-medium inline-block mr-1.5">
                Khóa
              </span>
            )}
            <span className="leading-6 font-medium">{item.ten}</span>
          </div>
          <div className="mt-1 font-light">
            {item.dk_su_dung === 0 &&
              "Không bị giới hạn chi tiêu theo số tiền thanh toán"}
            {item.dk_su_dung === 1 && "Chi tiêu theo tỉ lệ thanh toán"}
            {item.dk_su_dung === 2 && "Chỉ được chi tiêu khi thanh toán hết"}
          </div>
          <div className="font-light text-muted mt-1">
            HSD :
            <span className="pl-1">
              {!item.han_dung ? (
                "Không giới hạn"
              ) : (
                <>
                  {item.han_dung && moment().diff(item.han_dung, "minutes") < 0
                    ? moment(item.han_dung).format("DD/MM/YYYY")
                    : "Hết hạn"}
                </>
              )}
            </span>
          </div>
          <div className="font-light text-muted mt-1">
            Trạng thái :
            <span className="!text-danger pl-1 font-normal">
              {item.trang_thai === "Khóa" ? "Đang khoá" : "Đang sử dụng"}
            </span>
          </div>
        </div>
        <div className="flex p-3 justify-between items-center">
          <div>Còn lại </div>
          <div>
            <span className="font-medium">
              {formatVND(item.gia_tri_chi_tieu - item.su_dung)}
            </span>
            {(item.gia_tri_chi_tieu_sp - item.su_dung_sp !== 0 ||
              item.gia_tri_chi_tieu_dv - item.su_dung_dv !== 0) &&
              (item.gioi_han_sp !== 0 ||
                item.gioi_han_dv !== 0 ||
                item.gia_tri_chi_tieu_sp !== 0 ||
                item.gia_tri_chi_tieu_dv !== 0) && (
                <PopoverRender>
                  <div class="border-b px-3 py-2.5">
                    <div class="font-light text-muted mb-px">
                      Chi tiêu sản phẩm
                    </div>
                    <div class="font-medium">
                      {formatVND(item.gia_tri_chi_tieu_sp - item.su_dung_sp)}
                    </div>
                  </div>
                  <div class="px-3 py-2.5">
                    <div class="font-light text-muted mb-px">
                      Chi tiêu dịch vụ
                    </div>
                    <div class="font-medium">
                      {formatVND(item.gia_tri_chi_tieu_dv - item.su_dung_dv)}
                    </div>
                  </div>
                </PopoverRender>
              )}
          </div>
        </div>
        <div className="p-3 border-t flex justify-between items-center">
          <div>
            {adminTools_byStock?.hasRight && (
              <PickerModal item={item}>
                {({ open }) => (
                  <button
                    onClick={open}
                    type="button"
                    className={`text-white !rounded h-8 text-sm text-truncate px-3 !bg-success mr-1.5 text-[12px]`}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </PickerModal>
            )}
            {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
              window.top?.Info?.User?.ID === 1 && (
                <button
                  type="button"
                  className={`h-8 px-3 text-xs text-truncate text-white !rounded !bg-${
                    item.trang_thai === "Khóa" ? "success" : "danger"
                  }`}
                  onClick={() => changeCard(item)}
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading && "Đang thực hiên"}
                  {!updateMutation.isLoading && (
                    <>{item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ"}</>
                  )}{" "}
                </button>
              )
            ) : (
              <button
                type="button"
                className={`text-white !rounded h-8 text-xs text-truncate px-3 !bg-${
                  item.trang_thai === "Khóa" ? "success" : "danger"
                }`}
                onClick={() => changeCard(item)}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading && "Đang thực hiên"}
                {!updateMutation.isLoading && (
                  <> {item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ"} </>
                )}
              </button>
            )}
          </div>
          <div
            className="w-10 h-8 flex items-center justify-end"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className="fa-solid fa-ellipsis-vertical text-base"></i>
          </div>
        </div>
        {isOpen && (
          <div className="p-3 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted font-light mb-1">
                  Giá trị thẻ tiền
                </div>
                <div className="font-medium">
                  {formatVND(item.gia_tri_the)}
                  {(item.gioi_han_sp !== 0 || item.gioi_han_dv !== 0) && (
                    <PopoverRender>
                      <div class="border-b px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu sản phẩm
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gioi_han_sp)}
                        </div>
                      </div>
                      <div class="px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu dịch vụ
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gioi_han_dv)}
                        </div>
                      </div>
                    </PopoverRender>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted font-light mb-1">
                  Giá trị chi tiêu
                </div>
                <div>
                  {formatVND(item.gia_tri_chi_tieu)}
                  {(item.gia_tri_chi_tieu_sp !== 0 ||
                    item.gia_tri_chi_tieu_dv !== 0) && (
                    <PopoverRender>
                      <div class="border-b px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu sản phẩm
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gia_tri_chi_tieu_sp)}
                        </div>
                      </div>
                      <div class="px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu dịch vụ
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gia_tri_chi_tieu_dv)}
                        </div>
                      </div>
                    </PopoverRender>
                  )}
                </div>
              </div>
            </div>
            <div>
              {MoneyCardDetail.isLoading && "Đang tải ..."}
              {!MoneyCardDetail?.isLoading && (
                <React.Fragment>
                  {MoneyCardDetail?.data && MoneyCardDetail?.data.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="mb-3 font-medium text-sm">
                        Lịch sử sử dụng
                      </div>
                      <ol className="relative border-l border-gray-200 pl-3 mb-0">
                        {MoneyCardDetail?.data.map((sub, idx) => (
                          <li className="mb-10 ml-4 last:!mb-0" key={idx}>
                            <div className="absolute w-3 h-3 bg-gray-200 !rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
                            <PopoverDate
                              CreateDate={sub.ngay}
                              sub={sub}
                              positions={["top"]}
                            >
                              {({ open }) => (
                                <time
                                  className="mb-1 font-normal leading-none text-gray-400 cursor-pointer"
                                  onClick={() =>
                                    adminTools_byStock?.hasRight && open()
                                  }
                                >
                                  {moment(sub.ngay).format("HH:mm DD/MM/YYYY")}
                                  {adminTools_byStock?.hasRight && (
                                    <i className="far fa-edit ml-2 text-[#999]"></i>
                                  )}
                                </time>
                              )}
                            </PopoverDate>
                            <h3 className="mt-1 text-sm font-semibold text-gray-900">
                              {formatVND(sub.gia_tri)}
                            </h3>
                            <div className="font-normal text-gray-500 leading-5">
                              {sub.san_pham}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <tr className="border-b">
        <td className="px-4 py-3 border" data-title="Tên thẻ tiền">
          <div className="flex flex-wrap items-center">
            <span className="font-medium text-xs bg-success-light !text-success text-mini py-px px-1.5 !rounded font-medium inline-block mr-1.5">
              #{item.id}
            </span>
            <span className="leading-6 font-medium">{item.ten}</span>
          </div>
          <div className="mt-1 font-light">
            {item.dk_su_dung === 0 &&
              "Không bị giới hạn chi tiêu theo số tiền thanh toán"}
            {item.dk_su_dung === 1 && "Chi tiêu theo tỉ lệ thanh toán"}
            {item.dk_su_dung === 2 && "Chỉ được chi tiêu khi thanh toán hết"}
          </div>
          <div className="font-light text-muted mt-1">
            HSD :
            <span className="pl-1">
              {!item.han_dung ? (
                "Không giới hạn"
              ) : (
                <>
                  {item.han_dung && moment().diff(item.han_dung, "minutes") < 0
                    ? moment(item.han_dung).format("DD/MM/YYYY")
                    : "Hết hạn"}
                </>
              )}
            </span>
          </div>
          <div className="font-light text-muted mt-1">
            Trạng thái :
            <span className="!text-danger pl-1 font-normal">
              {item.trang_thai === "Khóa" ? "Đang khoá" : "Đang sử dụng"}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 border" data-title="Còn lại">
          <div className="font-medium">
            {formatVND(item.gia_tri_chi_tieu - item.su_dung)}
            {(item.gia_tri_chi_tieu_sp - item.su_dung_sp !== 0 ||
              item.gia_tri_chi_tieu_dv - item.su_dung_dv !== 0) &&
              (item.gioi_han_sp !== 0 ||
                item.gioi_han_dv !== 0 ||
                item.gia_tri_chi_tieu_sp !== 0 ||
                item.gia_tri_chi_tieu_dv !== 0) && (
                <PopoverRender>
                  <div class="border-b px-3 py-2.5">
                    <div class="font-light text-muted mb-px">
                      Chi tiêu sản phẩm
                    </div>
                    <div class="font-medium">
                      {formatVND(item.gia_tri_chi_tieu_sp - item.su_dung_sp)}
                    </div>
                  </div>
                  <div class="px-3 py-2.5">
                    <div class="font-light text-muted mb-px">
                      Chi tiêu dịch vụ
                    </div>
                    <div class="font-medium">
                      {formatVND(item.gia_tri_chi_tieu_dv - item.su_dung_dv)}
                    </div>
                  </div>
                </PopoverRender>
              )}
          </div>
        </td>
        <td
          className="px-4 py-3 border text-center min-w-[170px] max-w-[170px] w-[170px]"
          data-action="true"
        >
          <div>
            {adminTools_byStock?.hasRight && (
              <PickerModal item={item}>
                {({ open }) => (
                  <button
                    onClick={open}
                    type="button"
                    className={`w-full text-white !rounded h-9 text-sm text-truncate px-3 !bg-success mb-1.5`}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </PickerModal>
            )}

            {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
              window.top?.Info?.User?.ID === 1 && (
                <button
                  type="button"
                  className={`w-full text-white !rounded h-9 text-sm text-truncate px-3 !bg-${
                    item.trang_thai === "Khóa" ? "success" : "danger"
                  }`}
                  onClick={() => changeCard(item)}
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading && "Đang thực hiên"}
                  {!updateMutation.isLoading && (
                    <>{item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ"}</>
                  )}{" "}
                </button>
              )
            ) : (
              <button
                type="button"
                className={`w-full text-white !rounded h-9 text-sm text-truncate px-3 !bg-${
                  item.trang_thai === "Khóa" ? "success" : "danger"
                }`}
                onClick={() => changeCard(item)}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading && "Đang thực hiên"}
                {!updateMutation.isLoading && (
                  <> {item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ"} </>
                )}
              </button>
            )}
            <button
              type="button"
              className="w-full text-white !rounded h-9 px-3 text-sm !bg-primary mt-1.5 text-truncate"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "Đóng" : "Chi tiết"}
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td
            className="px-4 py-3 bg-[#f9f9f9]"
            colSpan={3}
            data-action="content"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted font-light mb-1">
                  Giá trị thẻ tiền
                </div>
                <div className="font-medium">
                  {formatVND(item.gia_tri_the)}
                  {(item.gioi_han_sp !== 0 || item.gioi_han_dv !== 0) && (
                    <PopoverRender>
                      <div class="border-b px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu sản phẩm
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gioi_han_sp)}
                        </div>
                      </div>
                      <div class="px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu dịch vụ
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gioi_han_dv)}
                        </div>
                      </div>
                    </PopoverRender>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted font-light mb-1">
                  Giá trị chi tiêu
                </div>
                <div>
                  {formatVND(item.gia_tri_chi_tieu)}
                  {(item.gia_tri_chi_tieu_sp !== 0 ||
                    item.gia_tri_chi_tieu_dv !== 0) && (
                    <PopoverRender>
                      <div class="border-b px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu sản phẩm
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gia_tri_chi_tieu_sp)}
                        </div>
                      </div>
                      <div class="px-3 py-2.5">
                        <div class="font-light text-muted mb-px">
                          Chi tiêu dịch vụ
                        </div>
                        <div class="font-medium">
                          {formatVND(item.gia_tri_chi_tieu_dv)}
                        </div>
                      </div>
                    </PopoverRender>
                  )}
                </div>
              </div>
            </div>
            <div>
              {MoneyCardDetail.isLoading && "Đang tải ..."}
              {!MoneyCardDetail.isLoading && (
                <React.Fragment>
                  {MoneyCardDetail?.data && MoneyCardDetail?.data.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="mb-3 font-medium text-sm">
                        Lịch sử sử dụng
                      </div>
                      <ol className="relative border-l border-gray-200 pl-3 mb-0">
                        {MoneyCardDetail?.data.map((sub, idx) => (
                          <li className="mb-10 ml-4 last:!mb-0" key={idx}>
                            <div className="absolute w-3 h-3 bg-gray-200 !rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
                            <PopoverDate CreateDate={sub.ngay} sub={sub}>
                              {({ open }) => (
                                <time
                                  className="mb-1 font-normal leading-none text-gray-400 cursor-pointer"
                                  onClick={() =>
                                    adminTools_byStock?.hasRight && open()
                                  }
                                >
                                  {moment(sub.ngay).format("HH:mm DD/MM/YYYY")}
                                  {adminTools_byStock?.hasRight && (
                                    <i className="far fa-edit ml-2 text-[#999]"></i>
                                  )}
                                </time>
                              )}
                            </PopoverDate>

                            <h3 className="mt-1 text-sm font-semibold text-gray-900">
                              {formatVND(sub.gia_tri)}
                            </h3>
                            <div className="font-normal text-gray-500 leading-5">
                              {sub.san_pham}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
