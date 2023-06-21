import React, { useEffect, useState } from "react";
import axiosClient from "./axios/axiosClient";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

export default function ItemCard({ item, getMoneyCard, index }) {
    const [btnLoading, setBtnLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [ListHistory, setListHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const changeCard = (item) => {
        setBtnLoading(true);
        axiosClient
            .get(`/api/v3/moneycard?cmd=lock&id=${item.id}`)
            .then((response) => {
                window.top ? .bodyEvent &&
                    window.top ? .bodyEvent("ui_changed", {
                        name: "tt_thay_doi_the",
                        moneyCardId: item.id,
                    });
                getMoneyCard(() => {
                    setBtnLoading(false);
                    window.top ? .toastr.success(
                        `${
              item.trang_thai === "Khóa"
                ? "Kích hoạt thẻ tiền thành công"
                : "Khóa thẻ tiền thành công"
            }`,
                        "", { timeOut: 2000 }
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

    return ( <
        React.Fragment >
        <
        tr >
        <
        td data - title = "STT"
        className = "text-center" > { index + 1 } <
        /td> <
        td data - title = "Tên thẻ tiền" >
        <
        div > { item.ten } { " " } {
            item.trang_thai === "Khóa" && ( <
                b className = "text-danger text-capitalize" > (Khóa) < /b>
            )
        } <
        /div> <
        div >
        HSD: { " " } {
            !item.han_dung ? (
                "Không giới hạn"
            ) : ( <
                React.Fragment > {
                    item.han_dung &&
                    moment().diff(item.han_dung, "minutes") < 0 ? (
                        moment(item.han_dung).format("DD/MM/YYYY")
                    ) : ( <
                        b className = "text-danger" > Hết hạn < /b>
                    )
                } <
                /React.Fragment>
            )
        } <
        /div> <
        div > (#{ item.id }) < /div> <
        /td> <
        td data - title = "Giá trị" >
        <
        div > { formatVND(item.gia_tri_the) } < /div> {
            (item.gioi_han_sp !== 0 || item.gioi_han_dv !== 0) && ( <
                div >
                (Sản phẩm: { formatVND(item.gioi_han_sp) } - Dịch vụ: { " " } { formatVND(item.gioi_han_dv) }) <
                /div>
            )
        } <
        /td> <
        td data - title = "Giá trị chi tiêu" >
        <
        div > { formatVND(item.gia_tri_chi_tieu) } < /div> {
            (item.gia_tri_chi_tieu_sp !== 0 ||
                item.gia_tri_chi_tieu_dv !== 0) && ( <
                div >
                (Sản phẩm: { formatVND(item.gia_tri_chi_tieu_sp) } - Dịch vụ: { " " } { formatVND(item.gia_tri_chi_tieu_dv) }) <
                /div>
            )
        } <
        /td> <
        td data - title = "Còn lại" >
        <
        div > { formatVND(item.gia_tri_chi_tieu - item.su_dung) } < /div> {
            (item.gia_tri_chi_tieu_sp - item.su_dung_sp !== 0 ||
                item.gia_tri_chi_tieu_dv - item.su_dung_dv !== 0) &&
            (item.gioi_han_sp !== 0 ||
                item.gioi_han_dv !== 0 ||
                item.gia_tri_chi_tieu_sp !== 0 ||
                item.gia_tri_chi_tieu_dv !== 0) && ( <
                div >
                (Sản phẩm: { " " } { formatVND(item.gia_tri_chi_tieu_sp - item.su_dung_sp) } - Dịch vụ: { formatVND(item.gia_tri_chi_tieu_dv - item.su_dung_dv) }) <
                /div>
            )
        } <
        /td> <
        td data - action = "true"
        className = "text-center" >
        <
        div className = "moneycard-btn" > {
            window.top ? .GlobalConfig ? .Admin ? .the_tien_nang_cao ? (
                window.top ? .Info ? .User ? .ID === 1 && ( <
                    button type = "button"
                    className = { `mb-5px btn btn-sm btn-${
                    item.trang_thai === "Khóa" ? "success" : "danger"
                  }` }
                    onClick = {
                        () => changeCard(item) }
                    disabled = { btnLoading } >
                    { btnLoading && "Đang thực hiên" } { " " } {
                        !btnLoading && ( <
                            > { item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ" } < />
                        )
                    } <
                    /button>
                )
            ) : ( <
                button type = "button"
                className = { `mb-5px btn btn-sm btn-${
                  item.trang_thai === "Khóa" ? "success" : "danger"
                }` }
                onClick = {
                    () => changeCard(item) }
                disabled = { btnLoading } >
                { btnLoading && "Đang thực hiên" } { " " } {
                    !btnLoading && ( <
                        > { item.trang_thai === "Khóa" ? "Kích hoạt" : "Khóa thẻ" } < />
                    )
                } <
                /button>
            )
        } <
        button type = "button"
        className = "btn btn-sm btn-primary"
        onClick = {
            () => setIsOpen(!isOpen) } >
        { isOpen ? "Đóng lịch sử" : "Lịch sử" } <
        /button> <
        /div> <
        /td> <
        /tr> {
            isOpen && ( <
                tr >
                <
                td className = "moneycard-history title-2"
                colSpan = { 1 }
                data - action = "true" >
                <
                div >
                Lịch sử { item.ten } { " " } {
                    item.trang_thai === "Khóa" && ( <
                        b className = "text-danger text-capitalize" > (Khóa) < /b>
                    )
                } <
                /div> <
                /td> <
                td className = "moneycard-history"
                colSpan = { 5 }
                data - action = "content" > { /* <h5>Lịch sử sử dụng</h5> */ } <
                div className = "moneycard-timeline" > { loading && "Đang tải ..." } {
                    !loading && ( <
                        React.Fragment > {
                            ListHistory && ListHistory.length > 0 ? ( <
                                ul > {
                                    ListHistory.map((sub, idx) => ( <
                                        li className = "down"
                                        key = { idx } >
                                        <
                                        div className = "price" >
                                        <
                                        div className = "price-number" > { formatVND(sub.gia_tri) } <
                                        /div> <
                                        div className = "price-time" > { moment(sub.ngay).format("HH:mm DD/MM/YYYY") } <
                                        /div> <
                                        /div> <
                                        div className = "note" > { sub.san_pham } < /div> <
                                        /li>
                                    ))
                                } <
                                /ul>
                            ) : (
                                "Không có lịch sử"
                            )
                        } <
                        /React.Fragment>
                    )
                } <
                /div> <
                /td> <
                /tr>
            )
        } <
        /React.Fragment>
    );
}