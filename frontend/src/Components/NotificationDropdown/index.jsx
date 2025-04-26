import React, { useEffect } from "react";
import { Bell } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotificationsByUserId,
  updateNotificationsById,
} from "../../app/actions/notification.action";
import { CiSquareRemove } from "react-icons/ci";
import { AiOutlineNotification } from "react-icons/ai";

function NotificationDropdown() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  const unreadCount = notifications?.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (userId) {
      dispatch(getNotificationsByUserId(userId));
    }
  }, [dispatch, userId]);

  const handleOnRead = (id) => {
    dispatch(updateNotificationsById({ id, isRead: true }));
  };

  const handleMarkAllAsRead = () => {
    notifications?.forEach((notification) => {
      if (!notification.isRead) {
        dispatch(updateNotificationsById({ id: notification.id, isRead: true }));
      }
    });
  };

  return (
    <div className="position-relative">
      <a
        className="nav-link dropdown-toggle position-relative"
        href="#"
        id="notification-dropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </a>
      <ul
        className="dropdown-menu dropdown-menu-end shadow-sm"
        aria-labelledby="notification-dropdown"
        style={{ width: "300px", maxHeight: "350px", overflowY: "auto" }}
      >
        <li className="dropdown-header d-flex justify-content-between align-items-center px-3">
          <span className="fw-bold">Notifications</span>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-link p-0"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </li>
        <hr className="my-1" />
        {notifications && notifications.length ? (
          [...notifications]
            .reverse()
            .slice(0, 5)
            .map((notification) => (
              <li key={notification.id}>
                <div
                  className={`dropdown-item d-flex justify-content-between align-items-start ${
                    notification.isRead ? "" : "fw-semibold bg-light"
                  }`}
                  title={notification.message}
                  style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <div className="d-flex align-items-center">
                    <AiOutlineNotification className="me-2 text-primary" />
                    <span>{notification.message}</span>
                  </div>
                  <CiSquareRemove
                    size={20}
                    className="text-danger ms-2"
                    onClick={() => handleOnRead(notification.id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </li>
            ))
        ) : (
          <li>
            <span className="dropdown-item text-muted text-center">
              No Notifications yet
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export default NotificationDropdown;
