import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FieldArray, Form, Formik } from "formik";
import CalendarCrud from "../../App/modules/Calendar/_redux/CalendarCrud";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

let initialValue = {
  RoomStocks: [
    {
      StockID: 8975,
      ListRooms: [
        {
          ID: uuidv4(),
          label: "",
          Children: [
            {
              ID: uuidv4(),
              label: "",
            },
          ],
        },
      ],
    },
  ],
};

function ModalRoom({ show, onHide, StocksList, AuthCrStockID }) {
  const queryClient = useQueryClient();

  const [initialValues, setInitialValues] = useState(initialValue);

  useEffect(() => {
    getListRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AuthCrStockID]);

  const getListRooms = (callback) => {
    CalendarCrud.getConfigName(`room`)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const result = data[0].Value ? JSON.parse(data[0].Value) : [];

          let newValues = [];
          if (result && result.length > 0) {
            let StocksNews = StocksList;

            for (let stock of StocksNews) {
              let index = result.findIndex((x) => stock.ID === x.StockID);
              if (index > -1) {
                let item = result[index];
                newValues.push({
                  ...item,
                  ListRooms:
                    item.ListRooms && item.ListRooms.length > 0
                      ? item.ListRooms.map((room) => ({
                          ...room,
                          Children:
                            room.Children && room.Children.length > 0
                              ? room.Children
                              : [
                                  {
                                    ID: uuidv4(),
                                    label: "",
                                  },
                                ],
                        }))
                      : [
                          {
                            ID: uuidv4(),
                            label: "",
                            Children: [
                              {
                                ID: uuidv4(),
                                label: "",
                              },
                            ],
                          },
                        ],
                });
              } else {
                newValues.push({
                  StockID: stock.ID,
                  StockTitle: stock.Title,
                  ListRooms: [
                    {
                      ID: uuidv4(),
                      label: "",
                      Children: [
                        {
                          ID: uuidv4(),
                          label: "",
                        },
                      ],
                    },
                  ],
                });
              }
            }
          } else {
            newValues = StocksList.map((o) => ({
              StockID: o.ID,
              StockTitle: o.Title,
              ListRooms: [
                {
                  ID: uuidv4(),
                  label: "",
                  Children: [
                    {
                      ID: uuidv4(),
                      label: "",
                    },
                  ],
                },
              ],
            }));
          }

          setInitialValues((prevState) => ({
            ...prevState,
            RoomStocks: newValues,
          }));
          callback && callback();
        }
      })
      .catch((error) => console.log(error));
  };

  const updateMutation = useMutation({
    mutationFn: (body) => CalendarCrud.saveConfigName("room", body),
  });

  let onSubmit = (values) => {
    let newValue = values.RoomStocks.map((item) => ({
      ...item,
      ListRooms: item.ListRooms
        ? item.ListRooms.filter((x) => x.label).map((room) => ({
            ...room,
            Children: room.Children
              ? room.Children.filter((cls) => cls.label)
              : [],
          }))
        : [],
    }));
    updateMutation.mutate(newValue, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ListRooms"] }).then(() => {
          getListRooms();
          onHide();
          toast.success("Cập nhật phòng thành công.");
        });
      },
    });
  };

  return (
    <Modal
      size="md"
      dialogClassName="modal-max-sm"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {(formikProps) => {
          const { values, handleChange, handleBlur } = formikProps;
          return (
            <Form className="h-100 d-flex flex-column">
              <Modal.Header className="open-close" closeButton>
                <Modal.Title className="text-uppercase">
                  Cài đặt phòng
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {!AuthCrStockID ? (
                  <div className="text-danger">
                    Bạn vui lòng chọn điểm muốn cài đặt phòng.
                  </div>
                ) : (
                  <FieldArray
                    name="RoomStocks"
                    render={(RoomStocksHelpers) => (
                      <>
                        {values.RoomStocks.map((Stock, i) => (
                          <div
                            key={i}
                            className={clsx(
                              Number(Stock.StockID) !== Number(AuthCrStockID) &&
                                "d-none"
                            )}
                          >
                            {
                              <FieldArray
                                name={`RoomStocks[${i}].ListRooms`}
                                render={(ListRoomsHelpers) => (
                                  <>
                                    <div>
                                      {values.RoomStocks[i].ListRooms.map(
                                        (room, index) => (
                                          <div
                                            className={clsx(
                                              values.RoomStocks[i].ListRooms
                                                .length -
                                                1 !==
                                                index &&
                                                "border-bottom pb-15px mb-15px"
                                            )}
                                            key={index}
                                          >
                                            <div className="form-group form-group-ezs d-flex mb-10px">
                                              <div className="flex-1 position-relative">
                                                <label className="mb-1">
                                                  Tên phòng
                                                </label>
                                                <input
                                                  name={`RoomStocks[${i}].ListRooms[${index}].label`}
                                                  value={
                                                    values.RoomStocks[i]
                                                      .ListRooms[index].label
                                                  }
                                                  onChange={handleChange}
                                                  onBlur={handleBlur}
                                                  type="text"
                                                  className="form-control"
                                                  placeholder="Nhập tên phòng"
                                                  autoComplete="off"
                                                />
                                              </div>
                                              <div className="w-90px d-flex align-items-end justify-content-end">
                                                <button
                                                  type="button"
                                                  className="btn btn-light-success btn-sm ml-5px"
                                                  onClick={() =>
                                                    ListRoomsHelpers.push({
                                                      ID: uuidv4(),
                                                      label: "",
                                                      Children: [
                                                        {
                                                          ID: uuidv4(),
                                                          label: "",
                                                        },
                                                      ],
                                                    })
                                                  }
                                                >
                                                  <i className="pr-0 fal fa-plus font-size-xs"></i>
                                                </button>
                                                <button
                                                  // disabled={
                                                  //   values.RoomStocks[i]
                                                  //     .ListRooms.length === 1
                                                  // }
                                                  type="button"
                                                  className="btn btn-light-danger btn-sm ml-5px"
                                                  onClick={() => {
                                                    ListRoomsHelpers.remove(
                                                      index
                                                    );
                                                  }}
                                                >
                                                  <i className="pr-0 far fa-trash-alt font-size-xs"></i>
                                                </button>
                                              </div>
                                            </div>
                                            <div className="pl-30px">
                                              {
                                                <FieldArray
                                                  name={`RoomStocks[${i}].ListRooms[${index}].Children`}
                                                  render={(ChildrenHelpers) => (
                                                    <>
                                                      {values.RoomStocks[i]
                                                        .ListRooms[index]
                                                        .Children &&
                                                        values.RoomStocks[
                                                          i
                                                        ].ListRooms[
                                                          index
                                                        ].Children.map(
                                                          (child, idx) => (
                                                            <div
                                                              className="mb-8px form-group form-group-ezs d-flex"
                                                              key={idx}
                                                            >
                                                              <div className="flex-1">
                                                                <input
                                                                  name={`RoomStocks[${i}].ListRooms[${index}].Children[${idx}].label`}
                                                                  value={
                                                                    values
                                                                      .RoomStocks[
                                                                      i
                                                                    ].ListRooms[
                                                                      index
                                                                    ].Children[
                                                                      idx
                                                                    ].label
                                                                  }
                                                                  onChange={
                                                                    handleChange
                                                                  }
                                                                  onBlur={
                                                                    handleBlur
                                                                  }
                                                                  type="text"
                                                                  className="form-control"
                                                                  placeholder="Nhập tên bàn"
                                                                  autoComplete="off"
                                                                />
                                                              </div>
                                                              <div className="w-90px d-flex align-items-end justify-content-end">
                                                                <button
                                                                  type="button"
                                                                  className="btn btn-light-success btn-sm ml-5px"
                                                                  onClick={() =>
                                                                    ChildrenHelpers.push(
                                                                      {
                                                                        ID: uuidv4(),
                                                                        label:
                                                                          "",
                                                                      }
                                                                    )
                                                                  }
                                                                >
                                                                  <i className="pr-0 fal fa-plus font-size-xs"></i>
                                                                </button>
                                                                <button
                                                                  // disabled={
                                                                  //   values
                                                                  //     .RoomStocks[
                                                                  //     i
                                                                  //   ].ListRooms[
                                                                  //     index
                                                                  //   ].Children
                                                                  //     .length ===
                                                                  //   1
                                                                  // }
                                                                  type="button"
                                                                  className="btn btn-light-danger btn-sm ml-5px"
                                                                  onClick={() => {
                                                                    ChildrenHelpers.remove(
                                                                      idx
                                                                    );
                                                                  }}
                                                                >
                                                                  <i className="pr-0 far fa-trash-alt font-size-xs"></i>
                                                                </button>
                                                              </div>
                                                            </div>
                                                          )
                                                        )}

                                                      {((!values.RoomStocks[i]
                                                        .ListRooms[index]
                                                        .Children &&
                                                        values.RoomStocks[i]
                                                          .ListRooms[index]
                                                          .Children) ||
                                                        (values.RoomStocks[i]
                                                          .ListRooms[index]
                                                          .Children &&
                                                          values.RoomStocks[i]
                                                            .ListRooms[index]
                                                            .Children.length ===
                                                            0)) && (
                                                        <div>
                                                          <button
                                                            className="text-white bg-success rounded-[3px] text-[13px] py-2 px-3"
                                                            type="button"
                                                            onClick={() =>
                                                              ChildrenHelpers.push(
                                                                {
                                                                  ID: uuidv4(),
                                                                  label:
                                                                    "",
                                                                }
                                                              )
                                                            }
                                                          >
                                                            Thêm mới bàn
                                                          </button>
                                                        </div>
                                                      )}
                                                    </>
                                                  )}
                                                />
                                              }
                                            </div>
                                          </div>
                                        )
                                      )}
                                      {(!values.RoomStocks[i].ListRooms ||
                                        values.RoomStocks[i].ListRooms
                                          .length === 0) && (
                                        <div>
                                          <button
                                            type="button"
                                            className="btn btn-light-success btn-sm"
                                            onClick={() =>
                                              ListRoomsHelpers.push({
                                                ID: uuidv4(),
                                                label: "",
                                                Children: [
                                                  {
                                                    ID: uuidv4(),
                                                    label: "",
                                                  },
                                                ],
                                              })
                                            }
                                          >
                                            Thêm mới phòng
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              />
                            }
                          </div>
                        ))}
                      </>
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
  );
}

ModalRoom.propTypes = {};

export default ModalRoom;
