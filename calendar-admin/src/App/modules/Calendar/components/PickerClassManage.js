import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import Table, { AutoResizer } from "react-base-table";
import { components } from "react-select";
import moment from "moment";
import Swal from "sweetalert2";
import clsx from "clsx";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { useRoles } from "../../../../hooks/useRoles";
import PickerClassAddMember from "./PickerClassAddMember";
import SelectStaffs from "../../../../components/Select/SelectStaffs/SelectStaffs";

const Control = ({ children, ...props }) => {
  // @ts-ignore
  const { classIcon } = props.selectProps;

  return (
    <components.Control {...props}>
      <i
        className={classIcon}
        style={{ fontSize: "15px", color: "#5f6368", padding: "0 0 0 10px" }}
      ></i>
      {children}
    </components.Control>
  );
};

let Status = [
  {
    label: "Điểm danh đến",
    value: "DIEM_DANH_DEN",
    className: "success",
  },
  {
    label: "Điểm danh không đến",
    value: "DIEM_DANH_KHONG_DEN",
    className: "danger",
  },
];

function PickerClassManage({ children, TimeOpen, TimeClose }) {
  const queryClient = useQueryClient();

  const { AuthCrStockID } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  let [initialValues, setInitialValues] = useState(null);
  let [initialValue, setInitialValue] = useState({
    ID: 0,
    StockID: "",
    CreateDate: "",
    TimeBegin: "",
    OrderServiceClassID: "",
    TeacherID: "",
    Member: null,
    MemberID: 0,
    Desc: "",
  });

  const [visible, setVisible] = useState(false);

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["CalendarClassMembers", { initialValues, visible }],
    queryFn: async () => {
      let { Items } = await CalendarCrud.getCalendarClassMembers({
        ClassIDs: [initialValues?.Class?.ID],
        TeachIDs: [],
        StockID: [initialValues?.Class?.StockID],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(initialValues?.DateFrom)
          .set({
            hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initialValues?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initialValues?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(initialValues?.DateFrom)
          .set({
            hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initialValues?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initialValues?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Pi: 1,
        Ps: 20,
      });
      return Items && Items.length > 0 ? Items[0] : null;
    },
    onSuccess: (data) => {
      if (data) {
        setInitialValue({
          ID: data?.ID,
          CreateDate: moment(data.CreateDate, "YYYY-MM-DD HH:mm").format(
            "YYYY-MM-DD HH:mm"
          ),
          StockID: data?.StockID,
          TimeBegin: initialValues?.DateFrom
            ? moment(initialValues?.DateFrom)
                .set({
                  hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(initialValues?.TimeFrom, "HH:mm").get(
                    "minute"
                  ),
                  second: moment(initialValues?.TimeFrom, "HH:mm").get(
                    "second"
                  ),
                })
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          OrderServiceClassID: data?.OrderServiceClassID,
          TeacherID: data?.Teacher
            ? { label: data?.Teacher?.FullName, value: data?.Teacher?.ID }
            : null,
          Member: {
            ...data?.Member,
            IsOverTime: data?.Member?.IsOverTime || false,
            Lists: data?.Member?.Lists
              ? data?.Member?.Lists.map((x) => ({
                  ...x,
                  Ids: uuidv4(),
                }))
              : [],
          },
          MemberID: "",
          Desc: "",
        });
      } else {
        setInitialValue({
          ID: 0,
          StockID: initialValues?.Class?.StockID,
          TimeBegin: initialValues?.DateFrom
            ? moment(initialValues?.DateFrom)
                .set({
                  hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
                  minute: moment(initialValues?.TimeFrom, "HH:mm").get(
                    "minute"
                  ),
                  second: moment(initialValues?.TimeFrom, "HH:mm").get(
                    "second"
                  ),
                })
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          OrderServiceClassID: initialValues?.Class?.ID,
          TeacherID: "",
          Member: {
            Lists: [],
            IsOverTime: false,
          },
          MemberID: 0,
          Desc: "",
        });
      }
    },
    enabled: visible && Boolean(initialValues),
  });

  const onHide = () => {
    setVisible(false);
    setInitialValue({
      ID: 0,
      StockID: "",
      CreateDate: "",
      TimeBegin: "",
      OrderServiceClassID: "",
      TeacherID: "",
      Member: null,
      MemberID: 0,
      Desc: "",
    });
  };

  const getStatus = (status) => {
    let index = Status.findIndex((x) => x.value === status);
    if (index > -1) return Status[index];
    return {
      label: "",
      className: "",
    };
  };

  const columns = useMemo(
    () => [
      {
        key: "STT",
        title: "STT",
        dataKey: "STT",
        width: 80,
        cellRenderer: ({ rowIndex }) => <div>{rowIndex + 1}</div>,
        sortable: false,
      },
      {
        key: "Member.ID",
        title: "ID học viên",
        dataKey: "Member.ID",
        width: 180,
        sortable: false,
      },
      {
        key: "Member.FullName",
        title: "Họ và tên",
        dataKey: "Member.FullName",
        width: 250,
        sortable: false,
      },
      {
        key: "Member.Phone",
        title: "Số điện thoại",
        dataKey: "Member.Phone",
        width: 200,
        sortable: false,
      },
      {
        key: "Os",
        title: "Dịch vụ thẻ",
        dataKey: "Os",
        cellRenderer: ({ rowData }) =>
          rowData?.Os ? (
            <div>
              [{rowData?.Os?.ID}] {rowData?.Os?.Title}
            </div>
          ) : (
            <></>
          ),
        width: 350,
        sortable: false,
      },
      {
        key: "Status",
        title: "Trạng thái",
        dataKey: "Status",
        cellRenderer: ({ rowData }) => (
          <div className={clsx("text-" + getStatus(rowData.Status).className)}>
            {getStatus(rowData.Status).label}
          </div>
        ),
        width: 250,
        sortable: false,
      },
      {
        key: "#",
        title: "#",
        dataKey: "#",
        width: 250,
        sortable: false,
        headerClassName: () => "justify-center",
        cellRenderer: ({ rowData, rowIndex }) => (
          <div className="flex justify-center w-full gap-1.5">
            {rowData.Status ? (
              <>
                {rowData.Status !== "DA_HUY_LICH" ? (
                  <button
                    disabled={initialValue.Member?.Status}
                    onClick={() => {
                      if (adminTools_byStock?.hasRight) {
                        onAttendance({
                          rowData,
                          rowIndex,
                          Status: {
                            label: "Huỷ điểm danh",
                            value: "",
                          },
                        });
                      } else {
                        window?.top?.toastr?.error("Bạn không có quyền.", "", {
                          timeOut: 600,
                        });
                      }
                    }}
                    type="button"
                    className="disabled:opacity-50 w-[130px] h-[32px] text-[13px] bg-danger px-4 rounded-[4px] text-white cursor-pointer flex items-center justify-center"
                  >
                    Huỷ điểm danh
                  </button>
                ) : (
                  <button
                    disabled={initialValue.Member?.Status}
                    onClick={() =>
                      onAttendance({
                        rowData,
                        rowIndex,
                        Status: {
                          label: "Đặt lại lịch",
                          value: "",
                        },
                      })
                    }
                    type="button"
                    className="disabled:opacity-50 w-[130px] h-[32px] text-[13px] bg-success px-4 rounded-[4px] text-white cursor-pointer flex items-center justify-center"
                  >
                    Đặt lại lịch
                  </button>
                )}
              </>
            ) : (
              <OverlayTrigger
                trigger="click"
                placement="left"
                rootClose
                overlay={
                  <Popover className="py-2" id="popover-basic">
                    {Status.map((item, index) => (
                      <div
                        key={index}
                        className={clsx(
                          "px-3.5 py-2.5 text-[14px] cursor-pointer hover:bg-[#F3F6F9] hover:text-primary",
                          rowData.Status &&
                            rowData.Status === item.value &&
                            "text-primary bg-[#F3F6F9]"
                        )}
                        onClick={() => {
                          onAttendance({
                            rowData,
                            rowIndex,
                            Status: item,
                          });
                          document.body.click();
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </Popover>
                }
              >
                <button
                  disabled={
                    initialValue.Member?.Status ||
                    moment().isSameOrBefore(
                      moment(initialValue?.TimeBegin, "YYYY-MM-DD HH:mm")
                    )
                  }
                  type="button"
                  className="disabled:opacity-50 w-[130px] h-[32px] text-[13px] bg-primary px-4 rounded-[4px] text-white cursor-pointer flex items-center justify-center"
                >
                  Điểm danh
                </button>
              </OverlayTrigger>
            )}

            <button
              disabled={rowData?.Status}
              onClick={() => onDelete({ rowIndex, rowData })}
              type="button"
              className="disabled:opacity-50 text-[13px] h-[32px] bg-danger rounded-[4px] px-3 text-white cursor-pointer flex items-center justify-center"
            >
              Huỷ lịch
            </button>
          </div>
        ),
        frozen: "right",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialValue]
  );

  const checkClassMutation = useMutation({
    mutationFn: async (body) => {
      let { Items } = await CalendarCrud.getCalendarClassMembers({
        ClassIDs: [initialValues?.Class?.ID],
        TeachIDs: [],
        StockID: [initialValues?.Class?.StockID],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(initialValues?.DateFrom)
          .set({
            hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initialValues?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initialValues?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(initialValues?.DateFrom)
          .set({
            hour: moment(initialValues?.TimeFrom, "HH:mm").get("hour"),
            minute: moment(initialValues?.TimeFrom, "HH:mm").get("minute"),
            second: moment(initialValues?.TimeFrom, "HH:mm").get("second"),
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Pi: 1,
        Ps: 20,
      });
      return Items && Items.length > 0 ? Items[0] : null;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.CalendarClassMembersAddEdit(body);
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const updateOsStatusMutation = useMutation({
    mutationFn: async ({ data, update, addPoint, deletePoint }) => {
      let rs = await CalendarCrud.CalendarClassMembersAddEdit(data);
      await CalendarCrud.CalendarClassMembersUpdateOs(update);

      if (addPoint) await CalendarCrud.addEditPointOsMember(addPoint);

      if (deletePoint) await CalendarCrud.deletePointOsMember(deletePoint);

      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.CalendarClassMembersDelete(body);
      await queryClient.invalidateQueries({ queryKey: ["CalendarClass"] });
      return rs;
    },
  });

  const onCancelClass = () => {
    if (
      initialValue?.Member?.Lists &&
      initialValue?.Member?.Lists.length > 0 &&
      initialValue?.Member?.Lists.filter((x) => x.Member?.Status)
    ) {
      window?.top?.toastr?.error(
        "Bạn không thể xoá lớp khi đã có học viên.",
        "",
        {
          timeOut: 600,
        }
      );
    } else {
      Swal.fire({
        icon: "warning",
        title: "Xác nhận xoá lớp ?",
        html: `Bạn có chắc chắn muốn xoá lớp <span>${
          initialValues?.Class.Title
        } (${initialValues?.TimeFrom}
                    <span class="px-px">-</span>
                    ${moment()
                      .set({
                        hour: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "hour"
                        ),
                        minute: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "minute"
                        ),
                        second: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "second"
                        ),
                      })
                      .add(initialValues?.Class?.Minutes, "minutes")
                      .format(
                        "HH:mm"
                      )})</span> . Hành động sẽ không được hoàn tác khi thực hiện.`,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Đóng",
        showCloseButton: true,
        showCancelButton: true,
        customClass: {
          confirmButton: "btn btn-success",
          //cancelButton: "btn btn-danger",
        },
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return new Promise(async (resolve, reject) => {
            let CrClass = await checkClassMutation.mutateAsync();

            if (!CrClass) {
              await queryClient.invalidateQueries({
                queryKey: ["CalendarClass"],
              });
              resolve({
                status: 400,
                error: "Lớp không tồn tại hoặc đã bị xoá.",
              });
            } else {
              await deleteMutation.mutateAsync({
                delete: [CrClass?.ID],
              });
              resolve({ CrClass });
            }
          });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          if (result?.value?.status === 400) {
            window?.top?.toastr?.error(result?.value?.error, "", {
              timeOut: 600,
            });
            if (result?.value?.error === "Lớp không tồn tại hoặc đã bị xoá.") {
              onHide();
            }
          } else {
            let { CrClass } = result?.value;
            window?.top?.toastr?.success("Huỷ lớp thành công.", "", {
              timeOut: 200,
            });
            window?.top?.noti27?.LOP_HOC &&
              window?.top?.noti27?.LOP_HOC({
                type: "Xóa lớp",
                Class: {
                  ...CrClass?.Class,
                  TimeBegin: CrClass.TimeBegin,
                },
                RefUserIds: CrClass?.TeacherID
                  ? [
                      {
                        ID: CrClass?.TeacherID?.ID,
                        FullName: CrClass?.TeacherID?.FullName,
                      },
                    ]
                  : [],
                MemberIds: CrClass?.Member?.Lists
                  ? CrClass?.Member?.Lists.map((x) => x.Member)
                  : [],
                Stock: CrClass?.Class?.Stock,
              });
            onHide();
          }
        }
      });
    }
  };

  const onDelete = ({ rowData }) => {
    if (!initialValue?.ID) return;

    Swal.fire({
      icon: "warning",
      title: "Xoá học viên ?",
      html: `Bạn có chắc chắn muốn xoá học viên <span>${rowData.Member.FullName}</span> ra khỏi lớp . Hành động sẽ không được hoàn tác khi thực hiện.`,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      showCloseButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success",
        //cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let CrClass = await checkClassMutation.mutateAsync();

          if (!CrClass) {
            await queryClient.invalidateQueries({
              queryKey: ["CalendarClass"],
            });
            resolve({
              status: 400,
              error: "Lớp không tồn tại hoặc đã bị xoá.",
            });
          } else {
            let newLists = [...(CrClass?.Member?.Lists || [])];
            newLists = newLists.filter(
              (x) => x?.Member?.ID !== rowData?.Member?.ID
            );

            let newValues = {
              arr: [
                {
                  ...initialValue,
                  TeacherID: CrClass?.TeacherID || null,
                  Member: {
                    ...CrClass.Member,
                    Lists: newLists,
                  },
                },
              ],
            };

            updateOsStatusMutation.mutate(
              {
                data: newValues,
                update: {
                  arr: [
                    {
                      ID: rowData?.Os?.ID,
                      Desc: "",
                      UserID: 0,
                    },
                  ],
                },
              },
              {
                onSuccess: () => {
                  resolve();
                },
              }
            );
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        if (result?.value?.status === 400) {
          window?.top?.toastr?.error(result?.value?.error, "", {
            timeOut: 600,
          });
          if (result?.value?.error === "Lớp không tồn tại hoặc đã bị xoá.") {
            onHide();
          }
        } else {
          window?.top?.toastr?.success("Huỷ lịch thành công.", "", {
            timeOut: 600,
          });
        }
      }
    });
  };

  const onAttendance = async ({ rowIndex, Status, rowData }) => {
    Swal.fire({
      icon: "warning",
      title: `Xác nhận  ${Status.label}?`,
      html: `Bạn có chắc chắn muốn ${Status.label} <span>${rowData.Member.FullName}</span> . Hành động sẽ không được hoàn tác khi thực hiện.`,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      showCloseButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success",
        //cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let CrClass = await checkClassMutation.mutateAsync();
          if (!CrClass) {
            await queryClient.invalidateQueries({
              queryKey: ["CalendarClass"],
            });
            resolve({
              status: 400,
              error: "Lớp không tồn tại hoặc đã bị xoá.",
            });
          } else {
            let index = CrClass?.Member?.Lists?.findIndex(
              (x) => x.Member.ID === rowData.Member.ID
            );
            if (index > -1) {
              let CrStatus = CrClass?.Member?.Lists[index].Status;
              let newLists = [...CrClass?.Member.Lists];

              newLists[index]["Status"] = Status.value;
              let newValues = {
                arr: [
                  {
                    ...initialValue,
                    TeacherID: CrClass?.TeacherID,
                    Member: {
                      ...CrClass.Member,
                      Lists: newLists,
                    },
                  },
                ],
              };

              let newObj = {
                ID: rowData?.Os?.ID,
                BookDate: Status.value
                  ? moment(initialValue?.TimeBegin).format("YYYY-MM-DD HH:mm")
                  : null,
                Status: !Status.value ? "" : "done",
              };

              if (!Status.value) {
                newObj["UserID"] = 0;
              }

              let addPoints = null;
              let deletePoints = null;

              if (window?.top?.GlobalConfig?.Admin?.lop_hoc_diem) {
                if (Status?.value === "DIEM_DANH_DEN") {
                  addPoints = {
                    MemberID: rowData?.Member?.ID,
                    Title: "Tích điểm khi đi tập",
                    Desc: `Đi tập lớp ${CrClass?.Class?.Title} lúc ${moment(
                      CrClass?.TimeBegin
                    ).format("HH:mm DD/MM/YYYY")}.`,
                    CreateDate: moment().format("YYYY-MM-DD HH:mm"),
                    Point: window?.top?.GlobalConfig?.Admin?.lop_hoc_diem,
                    StockID: CrClass?.StockID,
                    OrderServiceID: rowData?.Os?.ID,
                  };
                } else if (CrStatus === "DIEM_DANH_DEN") {
                  deletePoints = {
                    MemberID: rowData?.Member?.ID,
                    OrderServiceID: rowData?.Os?.ID,
                  };
                }
              }

              updateOsStatusMutation.mutate(
                {
                  data: newValues,
                  update: {
                    arr: [newObj],
                  },
                  addPoint: addPoints
                    ? {
                        edit: [addPoints],
                      }
                    : null,
                  deletePoint: deletePoints,
                },
                {
                  onSuccess: () => {
                    resolve();
                  },
                }
              );
            } else {
              await refetch();
              resolve({
                status: 400,
                error: "Học viên không tồn tại trong lớp này.",
              });
            }
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        if (result?.value?.status === 400) {
          window?.top?.toastr?.error(result?.value?.error, "", {
            timeOut: 600,
          });
          if (result?.value?.error === "Lớp không tồn tại hoặc đã bị xoá.") {
            onHide();
          }
        } else {
          window?.top?.toastr?.success("Cập nhật thành công.", "", {
            timeOut: 600,
          });
        }
      }
    });
  };

  const onUpdateTeacher = async (teacher) => {
    let CrClass = await checkClassMutation.mutateAsync();

    if (!CrClass) {
      await queryClient.invalidateQueries({
        queryKey: ["CalendarClass"],
      });
      onHide();
    } else {
      let newValues = {
        arr: [
          {
            ...initialValue,
            TeacherID: teacher?.value || "",
            Member: {
              ...CrClass.Member,
              HistoryCoachs: [
                ...(CrClass?.Member?.HistoryCoachs || []),
                {
                  CreateDate: moment().format("YYYY-MM-DD HH:mm"),
                  Staff: {
                    StaffID: window?.top?.Info?.User?.ID,
                    ID: window?.top?.Info?.User?.ID,
                    FullName: window?.top?.Info?.User?.FullName,
                  },
                  Coach: teacher
                    ? {
                        ID: teacher?.value,
                        FullName: teacher?.label,
                      }
                    : null,
                },
              ],
            },
          },
        ],
      };
      addMutation.mutate(newValues, {
        onSuccess: () => {
          if (teacher) {
            window?.top?.noti27?.LOP_HOC &&
              window?.top?.noti27?.LOP_HOC({
                type: "add HLV vào lớp",
                Class: {
                  ...CrClass?.Class,
                  TimeBegin: CrClass.TimeBegin,
                },
                RefUserIds: [
                  {
                    ID: teacher?.value,
                    FullName: teacher?.label,
                  },
                ],
                MemberIds: CrClass?.Member?.Lists
                  ? CrClass?.Member?.Lists.map((x) => x.Member)
                  : [],
                Stock: CrClass?.Class?.Stock,
              });
          } else {
            window?.top?.noti27?.LOP_HOC &&
              window?.top?.noti27?.LOP_HOC({
                type: "Hủy HLV khỏi lớp",
                Class: {
                  ...CrClass?.Class,
                  TimeBegin: CrClass.TimeBegin,
                },
                RefUserIds: CrClass?.TeacherID
                  ? [
                      {
                        ID: CrClass?.Teacher?.ID,
                        FullName: CrClass?.Teacher?.FullName,
                      },
                    ]
                  : [],
                MemberIds: CrClass?.Member?.Lists
                  ? CrClass?.Member?.Lists.map((x) => x.Member)
                  : [],
                Stock: CrClass?.Class?.Stock,
              });
          }
          window?.top?.toastr?.success(
            "Cập nhập huấn luyện viên thành công.",
            "",
            {
              timeOut: 200,
            }
          );
        },
      });
    }
  };

  const onUpdateOverTime = async (ck) => {
    let CrClass = await checkClassMutation.mutateAsync();
    if (!CrClass) {
      await queryClient.invalidateQueries({
        queryKey: ["CalendarClass"],
      });
      onHide();
    } else {
      let obj = { ...initialValue };

      let newValues = {
        arr: [
          {
            ...obj,
            TeacherID: CrClass?.TeacherID,
            Member: {
              ...CrClass.Member,
              IsOverTime: ck,
            },
          },
        ],
      };
      addMutation.mutate(newValues, {
        onSuccess: () => {
          window?.top?.toastr?.success("Cập nhập thành công.", "", {
            timeOut: 200,
          });
        },
      });
    }
  };

  const onUpdateStatus = () => {
    Swal.fire({
      icon: "warning",
      title: initialValue.Member?.Status
        ? "Xác nhận huỷ hoàn thành ?"
        : "Xác nhận hoàn thành",
      html: `Bạn có chắc chắn muốn chuyển trạng thái <span>${
        initialValue.Member?.Status ? "huỷ hoàn thành ?" : "hoàn thành"
      }</span>. Hành động sẽ không được hoàn tác khi thực hiện.`,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      showCloseButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success",
        //cancelButton: "btn btn-danger",
      },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, reject) => {
          let CrClass = await checkClassMutation.mutateAsync();
          if (!CrClass) {
            await queryClient.invalidateQueries({
              queryKey: ["CalendarClass"],
            });
            resolve({
              status: 400,
              error: "Lớp không tồn tại hoặc đã bị xoá.",
            });
          } else {
            let newValues = {
              arr: [
                {
                  ...initialValue,
                  TeacherID: CrClass?.TeacherID,
                  Member: {
                    ...CrClass.Member,
                    Status: CrClass.Member?.Status ? "" : "1",
                  },
                },
              ],
            };
            await addMutation.mutateAsync(newValues);
            resolve();
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        if (result?.value?.status === 400) {
          window?.top?.toastr?.error(result?.value?.error, "", {
            timeOut: 600,
          });
          if (result?.value?.error === "Lớp không tồn tại hoặc đã bị xoá.") {
            onHide();
          }
        } else {
          window?.top?.toastr?.success("Cập nhật thành công.", "", {
            timeOut: 600,
          });
        }
      }
    });
  };

  return (
    <>
      {children({
        open: (val) => {
          setInitialValues(val);
          setVisible(true);
        },
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] !h-full w-full">
            <div
              className="absolute top-0 left-0 w-full h-full bg-black/30"
              onClick={onHide}
            ></div>
            <div className="w-full h-full max-w-[1440px] flex flex-col bg-white mx-auto relative">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <div className="mb-px text-xl font-medium">
                    {initialValues?.Class?.Title}
                    {initialValue.Member?.Status && (
                      <span className="pl-1.5">( Hoàn thành )</span>
                    )}
                  </div>
                  <div className="text-gray-600 text-[13px] leading-4">
                    {initialValues?.TimeFrom}
                    <span className="px-1.5">-</span>
                    {moment()
                      .set({
                        hour: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "hour"
                        ),
                        minute: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "minute"
                        ),
                        second: moment(initialValues?.TimeFrom, "HH:mm").get(
                          "second"
                        ),
                      })
                      .add(initialValues?.Class?.Minutes, "minutes")
                      .format("HH:mm")}
                    <span className="pl-2">
                      ( Học viên {initialValue?.Member?.Lists?.length}
                      <span className="px-px">/</span>
                      {initialValues?.Class?.MemberTotal || 0} )
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div
                    className="flex items-center justify-center w-12 cursor-pointer h-11"
                    onClick={onHide}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-between px-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="font-medium">HLV :</div>
                  <div className="w-[320px]">
                    <SelectStaffs
                      isDisabled={initialValue.Member?.Status}
                      isClearable={true}
                      //StockID={AuthCrStockID}
                      classIcon="fas fa-user"
                      menuPlacement="bottom"
                      className="select-control select-control-md"
                      classNamePrefix="select"
                      isSearchable
                      //menuIsOpen={true}
                      name="Teacher"
                      value={initialValue?.TeacherID || null}
                      onChange={(option) => {
                        setInitialValue((prevState) => ({
                          ...prevState,
                          TeacherID: option || null,
                        }));
                        onUpdateTeacher(option || null);
                      }}
                      placeholder="Chọn huấn luyện viên"
                      components={{
                        //Option: CustomOptionStaff,
                        Control,
                      }}
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? "Không có huấn luyện viên"
                          : "Không tìm thấy huấn luyện viên"
                      }
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div></div>
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="checkbox checkbox-lg">
                      <input
                        type="checkbox"
                        name="IsOverTime"
                        checked={initialValue?.Member?.IsOverTime}
                        onChange={(e) => {
                          setInitialValue((prevState) => ({
                            ...prevState,
                            Member: {
                              ...prevState.Member,
                              IsOverTime: e.target.checked,
                            },
                          }));
                          onUpdateOverTime(e.target.checked);
                        }}
                        disabled={initialValue.Member?.Status}
                      />
                      <span />
                      <b className="pl-2 font-normal text-[#222] text-[14px]">
                        Ngoài giờ
                      </b>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <PickerClassAddMember
                    initial={initialValues}
                    initialValue={initialValue}
                    ProdIDs={initialValues?.Class?.ProdIDs}
                    DateFrom={initialValues?.DateFrom}
                    onClose={onHide}
                    refetch={refetch}
                  >
                    {({ open }) => (
                      <button
                        className="bg-success text-white rounded-[4px] px-3 relative disabled:opacity-60"
                        type="button"
                        disabled={
                          !(
                            initialValue?.Member?.Lists?.length === 0 ||
                            (initialValue?.Member?.Lists?.length > 0 &&
                              initialValue?.Member?.Lists?.length <
                                initialValues?.Class?.MemberTotal)
                          ) || initialValue.Member?.Status
                        }
                        onClick={open}
                      >
                        Thêm học viên
                      </button>
                    )}
                  </PickerClassAddMember>
                  <div className="h-11 w-[1px] bg-gray-300"></div>
                  <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    rootClose
                    overlay={
                      <Popover className="py-2" id="popover-basic">
                        <div
                          className={clsx(
                            "px-3.5 py-2 text-[14px] cursor-pointer hover:bg-[#F3F6F9] hover:text-primary"
                          )}
                          onClick={() => {
                            document.body.click();
                            if (
                              !initialValue.Member?.Status &&
                              (initialValue?.Member?.Lists?.length === 0 ||
                                (initialValue?.Member?.Lists &&
                                  initialValue?.Member?.Lists.some(
                                    (x) => !x.Status
                                  )))
                            ) {
                              window?.top?.toastr?.error(
                                "Không thể hoàn thành do có học viên chưa điểm danh.",
                                "",
                                {
                                  timeOut: 600,
                                }
                              );
                              return;
                            }
                            if (
                              !adminTools_byStock?.hasRight &&
                              initialValue.Member?.Status
                            ) {
                              window?.top?.toastr?.error(
                                "Bạn không có quyền.",
                                "",
                                {
                                  timeOut: 600,
                                }
                              );
                            } else {
                              onUpdateStatus();
                            }
                          }}
                        >
                          {initialValue.Member?.Status
                            ? "Huỷ hoàn thành"
                            : "Hoàn thành"}
                        </div>

                        {!initialValue.Member?.Status && (
                          <div
                            className={clsx(
                              "px-3.5 py-2 text-[14px] cursor-pointer hover:bg-[#F3F6F9] hover:text-danger text-danger"
                            )}
                            onClick={() => {
                              onCancelClass();
                              document.body.click();
                            }}
                          >
                            Xoá lớp
                          </div>
                        )}
                      </Popover>
                    }
                  >
                    <button
                      className="bg-primary text-white rounded-[4px] px-3.5 disabled:opacity-60"
                      type="button"
                    >
                      {initialValue.Member?.Status
                        ? "Đã hoàn thành"
                        : "Hoàn thành"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 ml-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
              <div className="relative p-4 grow lg:h-[calc(100%-73px)]">
                <AutoResizer>
                  {({ width, height }) => (
                    <Table
                      rowKey="Ids"
                      fixed
                      width={width}
                      height={height}
                      columns={columns}
                      data={initialValue?.Member?.Lists || []}
                      disabled={isLoading}
                      // loadingMore={isFetching}
                      // onEndReachedThreshold={300}
                      // onEndReached={fetchNextPage}
                      ignoreFunctionInColumnCompare={false}
                      estimatedRowHeight={60}
                      emptyRenderer={() =>
                        !isLoading ? (
                          <div className="flex items-center justify-center w-full h-full">
                            Không có dữ liệu
                          </div>
                        ) : (
                          <></>
                        )
                      }
                    />
                  )}
                </AutoResizer>
              </div>
              {(checkClassMutation.isLoading ||
                addMutation.isLoading ||
                updateOsStatusMutation.isLoading ||
                isLoading ||
                isFetching ||
                !initialValue?.ID) && (
                <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-white/50">
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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default PickerClassManage;
