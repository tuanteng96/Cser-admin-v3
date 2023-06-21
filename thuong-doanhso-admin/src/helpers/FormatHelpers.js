//Format VNĐ
export const formatVND = (price) => {
    if (typeof price === "undefined" || price === null) return false;
    return price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
};