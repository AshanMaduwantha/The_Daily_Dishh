import React, { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotificationsByUserId,
  updateNotificationsById,
} from "../../app/actions/notification.action";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  useEffect(() => {
    if (userId) {
      dispatch(getNotificationsByUserId(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOnRead = (id, e) => {
    e.stopPropagation();
    dispatch(updateNotificationsById({ id, isRead: true }));
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    notifications?.forEach((notification) => {
      if (!notification.isRead) {
        dispatch(updateNotificationsById({ id: notification.id, isRead: true }));
      }
    });
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px" }}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <div className="position-relative">
          <Bell className="text-secondary" size={20} />
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1 d-flex align-items-center justify-content-center" 
                  style={{ fontSize: "0.65rem", minWidth: "18px", height: "18px" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-menu dropdown-menu-end shadow show p-0" 
             style={{ width: "320px", maxHeight: "400px", marginTop: "0.5rem", borderRadius: "0.5rem" }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-semibold">Notifications</h6>
              {unreadCount > 0 && (
                <button
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="overflow-auto" style={{ maxHeight: "320px" }}>
            {notifications && notifications.length > 0 ? (
              [...notifications]
                .reverse()
                .slice(0, 5)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-bottom px-3 py-3 ${
                      !notification.isRead ? "bg-light" : ""
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-3">
                        <p className={`mb-1 ${!notification.isRead ? "fw-semibold" : "text-secondary"}`} 
                           style={{ fontSize: "0.9rem" }}>
                          {notification.message}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                          {new Date(notification.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleOnRead(notification.id, e)}
                          className="btn btn-light btn-sm rounded-circle p-1"
                          title="Mark as read"
                        >
                          <Check size={16} className="text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-5 px-3 text-muted">
                <Bell size={40} className="text-secondary opacity-25 mb-3" />
                <p className="mb-0">No notifications yet</p>
              </div>
            )}
          </div>
          
          {notifications && notifications.length > 5 && (
            <div className="text-center border-top p-2">
              <button className="btn btn-link btn-sm text-decoration-none">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}