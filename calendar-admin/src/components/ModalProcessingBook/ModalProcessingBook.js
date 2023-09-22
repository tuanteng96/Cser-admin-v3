import React, { Fragment, useState } from "react";
import { Modal, Nav, Tab } from "react-bootstrap";
import { useMutation, useQuery } from "react-query";
import CalendarCrud from "../../App/modules/Calendar/_redux/CalendarCrud";
import moment from "moment";
import clsx from "clsx";
import Swal from "sweetalert2";

function ModalProcessingBook({ children }) {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeKey, setActiveKey] = useState("OrderService");

  const { data, refetch } = useQuery({
    queryKey: ["repoData"],
    queryFn: async () => {
      let result = [
        {
          type: "OrderService",
          data: [],
          Title: "Dịch vụ chưa hoàn thành",
        },
        {
          type: "MemberBook",
          data: [],
          Title: "Cập nhập dịch vụ",
        },
      ];
      let data = await CalendarCrud.getProcesingBook();
      if (data.lst) {
        for (let item of data.lst) {
          if (item.Type === "MemberBook") {
            result[1].data.push(item);
          }
          if (item.Type === "OrderService") {
            result[0].data.push(item);
          }
        }
      }
      return result;
    },
    initialData: [
      {
        type: "OrderService",
        data: [],
        Title: "Dịch vụ chưa hoàn thành",
      },
      {
        type: "MemberBook",
        data: [],
        Title: "Cập nhập dịch vụ",
      },
    ],
    onSuccess: (data) => {
      if (data[0].data.length === 0 && data[0].data.length === 0) {
        setHidden(false);
      }
      if (data[0].data.length === 0) {
        setActiveKey("MemberBook");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body) => CalendarCrud.updateProcesingBook(body),
  });

  const updateOs = (os, OSList) => {
    Swal.fire({
      icon: "warning",
      title: `Xác nhận ${OSList ? "khách đến" : "khách hủy"}.`,
      confirmButtonText: "Xác nhận",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let dataUpdate = {
            OrderServices: [],
            MemberBooks: [
              {
                ID: os.ID,
                Status: OSList ? "KHACH_DEN" : "KHACH_KHONG_DEN",
              },
            ],
          };
          await updateMutation.mutateAsync(dataUpdate);
          await refetch();
          resolve();
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        window?.top?.toastr?.success("Cập nhập thành công.", "", {
          timeOut: 200,
        });
      }
    });
  };

  const updateOsAll = (list) => {
    Swal.fire({
      icon: "warning",
      title: `Cập nhập tất cả dịch vụ.`,
      confirmButtonText: "Xác nhận",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let dataUpdate = {
            OrderServices: [],
            MemberBooks: data[1].data.map((x) => ({
              ID: x.Data[0].ID,
              Status: x.OS ? "KHACH_DEN" : "KHACH_KHONG_DEN",
            })),
          };
          await updateMutation.mutateAsync(dataUpdate);
          await refetch();
          resolve();
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        window?.top?.toastr?.success("Cập nhập thành công.", "", {
          timeOut: 200,
        });
      }
    });
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
        hidden: hidden,
      })}
      <Modal
        size="md"
        dialogClassName="modal-max-sm modal-content-right"
        show={visible}
        onHide={() => setVisible(false)}
        scrollable={true}
      >
        <Tab.Container
          activeKey={activeKey}
          className="h-100 d-flex flex-column"
          onSelect={(k) => setActiveKey(k)}
        >
          <Nav className="wizard-nav">
            {data &&
              data.map((item, index) => (
                <Nav.Item key={index}>
                  <Nav.Link eventKey={item.type}>{item.Title}</Nav.Link>
                </Nav.Item>
              ))}
          </Nav>
          <Modal.Body>
            <Tab.Content>
              {data &&
                data.map((item, index) => (
                  <Tab.Pane eventKey={item.type} key={index}>
                    {item.type === "MemberBook" && (
                      <>
                        {item.data && item.data.length > 0 ? (
                          <>
                            {item.data.map((book, i) => (
                              <div
                                className="border p-5 rounded !mb-5 last:!mb-0"
                                key={i}
                              >
                                {book.Data &&
                                  book.Data.map((os, x) => (
                                    <Fragment key={x}>
                                      <div className="flex justify-between mb-2.5">
                                        <div className="flex-1 pr-4 text-[15px] font-medium">
                                          {os.RootTitle ||
                                            os.RootIds ||
                                            "Chưa xác định"}
                                        </div>
                                        <div className="pt-1 text-xs font-light text-right text-gray-600 w-28 hidden md:block">
                                          {moment(os.CreateDate).fromNow()}
                                        </div>
                                      </div>
                                      <div className="text-sm font-light text-gray-800">
                                        KH:
                                        <span className="pl-1">
                                          {book?.Member?.FullName}
                                        </span>
                                        <span className="px-1">-</span>
                                        <span>
                                          {book?.Member?.MobilePhone ||
                                            "Chưa có số điện thoại"}
                                        </span>
                                      </div>
                                      <div className="text-sm font-light text-gray-800">
                                        Ngày
                                        <span className="pl-1">
                                          {moment(os?.BookDate).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </span>
                                        <span className="pl-3">Giờ</span>
                                        <span className="pl-1">
                                          {moment(os?.BookDate).format("HH:mm")}
                                        </span>
                                      </div>
                                      <div className="mt-3.5 flex">
                                        <button
                                          type="button"
                                          className={clsx(
                                            "relative flex items-center h-9 px-3.5 text-xs font-light text-white transition !rounded !shadow-lg  focus:outline-none focus:shadow-none",
                                            book?.OS
                                              ? "bg-success hover:bg-success-hover"
                                              : "bg-danger hover:bg-danger-hover"
                                          )}
                                          onClick={() => updateOs(os, book?.OS)}
                                        >
                                          {book?.OS ? "Khách đến" : "Khách hủy"}
                                        </button>
                                      </div>
                                    </Fragment>
                                  ))}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>Không có dữ liệu</>
                        )}
                      </>
                    )}
                    {item.type === "OrderService" && (
                      <>
                        {item.data && item.data.length > 0 ? (
                          <>
                            {item.data.map((book, i) => (
                              <div
                                className="border p-5 rounded !mb-5 last:!mb-0"
                                key={i}
                              >
                                {book.Data &&
                                  book.Data.map((os, x) => (
                                    <Fragment key={x}>
                                      <div className="flex justify-between mb-2.5">
                                        <div className="flex-1 pr-4 text-[15px] font-medium">
                                          {os.Title || "Chưa xác định"}
                                        </div>
                                        <div className="pt-1 text-xs font-light text-right text-gray-600 w-28 hidden md:block">
                                          {moment(os.CreateDate).fromNow()}
                                        </div>
                                      </div>
                                      <div className="text-sm font-light text-gray-800">
                                        KH:
                                        <span className="pl-1">
                                          {book?.Member?.FullName}
                                        </span>
                                        <span className="px-1">-</span>
                                        <span>
                                          {book?.Member?.MobilePhone ||
                                            "Chưa có số điện thoại"}
                                        </span>
                                      </div>
                                      <div className="text-sm font-light text-gray-800">
                                        Ngày
                                        <span className="pl-1">
                                          {moment(os?.BookDate).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </span>
                                        <span className="pl-3">Giờ</span>
                                        <span className="pl-1">
                                          {moment(os?.BookDate).format("HH:mm")}
                                        </span>
                                      </div>
                                      <div className="mt-3.5 flex">
                                        <button
                                          type="button"
                                          className="relative flex items-center h-9 px-3.5 text-xs font-light text-white transition !rounded !shadow-lg bg-success hover:bg-success-hover focus:outline-none focus:shadow-none"
                                          onClick={() =>
                                            window?.top?.BANGLICH_BUOI &&
                                            window?.top?.BANGLICH_BUOI(
                                              os,
                                              refetch
                                            )
                                          }
                                        >
                                          Xem chi tiết
                                        </button>
                                      </div>
                                    </Fragment>
                                  ))}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>Không có dữ liệu</>
                        )}
                      </>
                    )}
                  </Tab.Pane>
                ))}
            </Tab.Content>
          </Modal.Body>
          <Modal.Footer className="!justify-start">
            {activeKey === "MemberBook" && data[1].data.length > 0 && (
              <button
                type="button"
                className="relative flex items-center !h-10 px-3.5 text-[13px] font-light text-white transition !rounded !shadow-lg focus:outline-none focus:shadow-none bg-primary mr-2"
                onClick={updateOsAll}
              >
                Cập nhập tất cả
              </button>
            )}
            <button
              type="button"
              className="relative flex items-center !h-10 px-3.5 text-[13px] font-light text-white transition !rounded !shadow-lg focus:outline-none focus:shadow-none bg-secondary"
              onClick={() => setVisible(false)}
            >
              Đóng
            </button>
          </Modal.Footer>
        </Tab.Container>
      </Modal>
    </>
  );
}

ModalProcessingBook.propTypes = {};

export default ModalProcessingBook;
