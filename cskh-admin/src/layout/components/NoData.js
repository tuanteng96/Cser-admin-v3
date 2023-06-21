import React from "react";
import { toAbsoluteUrl } from "../../helpers/AssetsHelpers";

export function NoData() {
    return (
        <div className="no-data-default d-flex flex-direction-column justify-content-center">
            <img
              src={`${toAbsoluteUrl("/media/no-data/no-data.svg")}`}
              alt="logo"
            />
        </div>
    )
}