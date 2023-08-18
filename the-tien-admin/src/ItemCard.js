import React, { useEffect, useState } from "react";
import axiosClient from "./axios/axiosClient";
import moment from "moment";
import "moment/locale/vi";
import { useLayoutEffect } from "react";
import { ArrowContainer, Popover } from "react-tiny-popover";

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

export default function ItemCard({ item, getMoneyCard, index }) {
  const [btnLoading, setBtnLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [ListHistory, setListHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowSize();
  const changeCard = (item) => {
    setBtnLoading(true);
    axiosClient
      .get(`/api/v3/moneycard?cmd=lock&id=${item.id}`)
      .then((response) => {
        window.top?.bodyEvent &&
          window.top?.bodyEvent("ui_changed", {
            name: "tt_thay_doi_the",
            moneyCardId: item.id,
          });
        getMoneyCard(() => {
          setBtnLoading(false);
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
      })
      .catch((err) => console.log(err));
  };

  const formatVND = (price) => {
    if (typeof price === "undefined" || price === null) return false;
    return price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  };

  const getDetailCard = () => {
    setLoading(true);
    axiosClient
      .get(`/api/v3/moneycard?cmd=detail&id_the_tien=${item.id}`)
      .then(({ data }) => {
        setListHistory(data.data);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (isOpen) {
      getDetailCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
          {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
            window.top?.Info?.User?.ID === 1 && (
              <button
                type="button"
                className={`h-8 px-3 text-xs text-truncate text-white !rounded !bg-${
                  item.trang_thai === "Khóa" ? "success" : "danger"
                }`}
                onClick={() => changeCard(item)}
                disabled={btnLoading}
              >
                {btnLoading && "Đang thực hiên"}
                {!btnLoading && (
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
              disabled={btnLoading}
            >
              {btnLoading && "Đang thực hiên"}
              {!btnLoading && (
                <> {item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ"} </>
              )}
            </button>
          )}
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
              {loading && "Đang tải ..."}
              {!loading && (
                <React.Fragment>
                  {ListHistory && ListHistory.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="mb-3 font-medium text-sm">
                        Lịch sử sử dụng
                      </div>
                      <ol className="relative border-l border-gray-200 pl-3 mb-0">
                        {ListHistory.map((sub, idx) => (
                          <li className="mb-10 ml-4 last:!mb-0" key={idx}>
                            <div className="absolute w-3 h-3 bg-gray-200 !rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
                            <time className="mb-1 font-normal leading-none text-gray-400">
                              {moment(sub.ngay).format("HH:mm DD/MM/YYYY")}
                            </time>
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
            {window.top?.GlobalConfig?.Admin?.the_tien_nang_cao ? (
              window.top?.Info?.User?.ID === 1 && (
                <button
                  type="button"
                  className={`w-full text-white !rounded h-9 text-sm text-truncate px-3 !bg-${
                    item.trang_thai === "Khóa" ? "success" : "danger"
                  }`}
                  onClick={() => changeCard(item)}
                  disabled={btnLoading}
                >
                  {btnLoading && "Đang thực hiên"}
                  {!btnLoading && (
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
                disabled={btnLoading}
              >
                {btnLoading && "Đang thực hiên"}
                {!btnLoading && (
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
              {loading && "Đang tải ..."}
              {!loading && (
                <React.Fragment>
                  {ListHistory && ListHistory.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="mb-3 font-medium text-sm">
                        Lịch sử sử dụng
                      </div>
                      <ol className="relative border-l border-gray-200 pl-3 mb-0">
                        {ListHistory.map((sub, idx) => (
                          <li className="mb-10 ml-4 last:!mb-0" key={idx}>
                            <div className="absolute w-3 h-3 bg-gray-200 !rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
                            <time className="mb-1 font-normal leading-none text-gray-400">
                              {moment(sub.ngay).format("HH:mm DD/MM/YYYY")}
                            </time>
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
