import { NavLink, Outlet } from 'react-router-dom';
import cls from './MyAccount.module.scss';

export function MyAccount() {
  return (
    <div className={`${cls['parent-container']}`}>
      <div
        className={`container-fluid page-description js-page-description ${cls['page-description']}`}
      >
        <div className={`container ${cls['page-description-title-container']}`}>
          <h1 className={`${cls['page-description-title']}`}>My Account</h1>
        </div>
      </div>
      <div className={`${cls.container}`}>
        <div className="row">
          <div className="col-md-4">
            <nav className={`${cls['sidebar-navigation']}`}>
              <ul>
                <li>
                  <NavLink to="/my/new/account/settings" className={({ isActive }) => isActive ? cls['active'] : ''}>
                    <i className="fa fa-chevron-right"></i>
                    Account Settings
                  </NavLink>
                </li>
                <hr />
                <li>
                  <NavLink to="/my/new/account/organization" className={({ isActive }) => isActive ? cls['active'] : ''}>
                    <i className="fa fa-chevron-right"></i>
                    Organizations
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="col-md-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
