import { isDevCode } from "./DevHelpers";

export const toAbsoluteUrl = pathname => process.env.PUBLIC_URL + pathname;
export const toUrlServer = pathname => isDevCode() ? process.env.REACT_APP_API_URL + pathname : "" + pathname;
export const toAbsoluteUser = pathname => {
    if (!pathname) {
        return `${toAbsoluteUrl("/assets/images/blank.png")}`;
    }
    return isDevCode() ? process.env.REACT_APP_API_URL + "/Upload/image/" + pathname : "/Upload/image/" + pathname;
}