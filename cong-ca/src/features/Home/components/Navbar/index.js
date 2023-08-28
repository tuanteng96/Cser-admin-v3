import React, { Fragment } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar(props) {
  return (
    <Fragment>
      <NavLink
        className={({ isActive }) =>
          `btn mr-8px fw-500 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
        }
        to="/bang-cham-cong"
      >
        Bảng chấm công
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `btn fw-500 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
        }
        to="/duyet-cham-cong"
      >
        Duyệt chấm công
      </NavLink>
    </Fragment>
  )
}

export default Navbar
