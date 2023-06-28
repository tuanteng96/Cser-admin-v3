import React, { Fragment } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar(props) {
  return (
    <Fragment>
      <NavLink
        className={({ isActive }) =>
          `btn mr-8px fw-600 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
        }
        to="/"
      >
        Công ca
      </NavLink>
      {/* <NavLink
        className={({ isActive }) =>
          `btn mr-8px fw-600 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
        }
        to="/cham-cong"
      >
        Chấm công
      </NavLink> */}
      <NavLink
        className={({ isActive }) =>
          `btn fw-600 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
        }
        to="/duyet-luong"
      >
        Duyệt lương
      </NavLink>
    </Fragment>
  )
}

export default Navbar
