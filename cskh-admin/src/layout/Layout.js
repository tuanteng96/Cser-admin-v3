import React from "react";
import Aside from "../components/aside/Aside";
import { toAbsoluteUrl } from "../helpers/AssetsHelpers";
import LayoutInit from "./LayoutInit";

export default function Layout({ children }) {
    return ( <
        div className = "d-flex h-100" >
        <
        Aside / >
        <
        div id = "ezs_content"
        className = "content" >
        <
        div className = "image-plance" >
        <
        img className = "w-100"
        src = { toAbsoluteUrl("/media/home/plane.png") }
        alt = "" /
        >
        <
        /div> { children } <
        /div> <
        LayoutInit / >
        <
        /div>
    );
}