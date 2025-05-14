import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsMoonStarsFill, BsSunFill, BsSend, BsPersonCircle } from 'react-icons/bs';

// Define your API base URL as a constant
const API_BASE_URL = "http://localhost:8080/api";

const Messaging = () => {
  const myUser = useSelector((state) => state.user.user);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const websocketRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  if (!selectedUser) return;

  const interval = setInterval(() => {
    fetchMessages(selectedUser);
  }, 10000); // 10000 ms = 10 sec

  return () => clearInterval(interval); // Clean up on unmount or selectedUser change
}, [selectedUser]);

  useEffect(() => {
  const socket = new WebSocket("ws://localhost:8080/ws/chat");
  websocketRef.current = socket; // assign correctly

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    console.log("Received message: ", event.data);
    const receivedMessage = JSON.parse(event.data);
    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return () => {
    socket.close();
  };
}, []);


  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
      setUsers(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
  if (!myUser?.id || !userId) return;

  try {
    setIsLoading(true);
    setSelectedUser(userId);

    // Fetch messages from both endpoints concurrently
    const [res1, res2] = await Promise.all([
      axios.get(`${API_BASE_URL}/messages/${myUser.id}/${userId}`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }),
      axios.get(`${API_BASE_URL}/messages/${userId}/${myUser.id}`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      })
    ]);

    // Merge and sort messages by timestamp
    const mergedMessages = [...res1.data, ...res2.data].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    setMessages(mergedMessages);
    console.log("Merged Messages fetched:", mergedMessages);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching messages:", error);
    setIsLoading(false);
  }
};


  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedUser || !myUser?.id) return;
    
    try {
      setIsLoading(true);
      
      await axios.post(`${API_BASE_URL}/messages/send`, {
        senderId: myUser.id,
        receiverId: selectedUser,
        content: message.trim(),
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      setNewMessage(newMessage);

    try {
    websocketRef.current.send(JSON.stringify(newMessage));
    setMessage('');
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Update the message list locally
      } catch (error) {
        console.error("Error sending message:", error);
  }
      
      setMessage("");
      await fetchMessages(selectedUser);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Find the selected user name
  const selectedUserName = users.find(user => user.id === selectedUser)?.username;
  
  const getRandomGradient = (userId) => {
    const gradients = [
      'linear-gradient(45deg, #ff9a9e, #fad0c4)',
      'linear-gradient(45deg, #a1c4fd, #c2e9fb)',
      'linear-gradient(45deg, #ffecd2, #fcb69f)',
      'linear-gradient(45deg, #84fab0, #8fd3f4)',
      'linear-gradient(45deg, #d4fc79, #96e6a1)',
    ];
    
    // Use the userId to deterministically select a gradient
    const index = userId?.charCodeAt(0) % gradients.length || 0;
    return gradients[index];
  };

  const getInitialsBackground = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#6699CC', '#FF8C42',
      '#7BC950', '#5D2E8C', '#FF5964', '#17BEBB', '#FAD02C'
    ];
    
    const index = userId?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: isDarkMode ? '#1a1a2e' : '#f8f9fa',
      color: isDarkMode ? '#e6e6e6' : '#212529',
      transition: 'all 0.3s ease'
    }}>
      <div className="container-fluid h-100 p-0">
        <div className="row h-100 g-0">
          {/* Sidebar toggle button for mobile */}
          <div className="d-lg-none position-fixed start-0 top-50 translate-middle-y z-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn rounded-circle shadow-sm border-0 p-2"
              onClick={toggleSidebar}
              style={{
                background: isDarkMode ? '#2d3748' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {showSidebar ? '←' : '→'}
            </motion.button>
          </div>

          {/* Sidebar with users */}
          <AnimatePresence>
            {(showSidebar || window.innerWidth > 992) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="col-lg-3 col-md-4 col-sm-12 p-0"
                style={{
                  background: isDarkMode ? '#16213e' : '#ffffff',
                  borderRight: isDarkMode ? '1px solid #2a2a4a' : '1px solid #e9ecef',
                  position: window.innerWidth <= 992 ? 'fixed' : 'relative',
                  height: '100%',
                  zIndex: 2,
                  boxShadow: isDarkMode ? '4px 0 10px rgba(0,0,0,0.2)' : '4px 0 10px rgba(0,0,0,0.05)'
                }}
              >
                <div className="d-flex justify-content-between align-items-center p-3" style={{
                  borderBottom: isDarkMode ? '1px solid #2a2a4a' : '1px solid #e9ecef',
                  background: isDarkMode ? '#1e2a47' : '#f8f9fa'
                }}>
                  <h4 className="m-0 fw-bold" style={{ 
                    fontSize: '1.2rem',
                    background: isDarkMode ? 'linear-gradient(45deg, #a1c4fd, #c2e9fb)' : 'linear-gradient(45deg, #5e72e4, #825ee4)', 
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Contacts
                  </h4>
                  <motion.button
                    whileHover={{ rotate: 30, scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    className="btn border-0"
                    style={{
                      background: 'transparent',
                      color: isDarkMode ? '#ffd60a' : '#6c757d'
                    }}
                  >
                    {isDarkMode ? <BsSunFill size={18} /> : <BsMoonStarsFill size={18} />}
                  </motion.button>
                </div>
                
                <div className="p-2" style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
                  {isLoading && users.length === 0 ? (
                    <div className="d-flex justify-content-center mt-4">
                      <div className="spinner-grow spinner-grow-sm" role="status" style={{ 
                        color: isDarkMode ? '#a1c4fd' : '#5e72e4' 
                      }}></div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {users.map(user => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            fetchMessages(user.id);
                            if (window.innerWidth <= 992) {
                              setShowSidebar(false);
                            }
                          }}
                          className="btn w-100 text-start p-3 mb-2 border-0 d-flex align-items-center"
                          style={{
                            background: selectedUser === user.id 
                              ? isDarkMode 
                                ? 'linear-gradient(45deg, #0d6efd, #0dcaf0)' 
                                : 'linear-gradient(45deg, #5e72e4, #825ee4)'
                              : isDarkMode ? '#1e2a47' : '#ffffff',
                            borderRadius: '12px',
                            color: selectedUser === user.id ? '#ffffff' : isDarkMode ? '#e6e6e6' : '#495057',
                            transition: 'all 0.3s ease',
                            boxShadow: isDarkMode 
                              ? '0 2px 5px rgba(0,0,0,0.2)' 
                              : '0 2px 5px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: selectedUser === user.id 
                              ? 'rgba(255,255,255,0.3)' 
                              : getInitialsBackground(user.id),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{user.username}</span>
                          
                          {selectedUser === user.id && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ms-auto bg-light rounded-circle"
                              style={{ 
                                width: '8px', 
                                height: '8px',
                                background: isDarkMode ? '#ffffff' : '#5e72e4'
                              }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat area */}
          <motion.div 
            className={`col p-0 d-flex flex-column ${showSidebar && window.innerWidth <= 992 ? 'opacity-50' : ''}`}
            style={{ 
              height: '100%',
              filter: showSidebar && window.innerWidth <= 992 ? 'blur(3px)' : 'none',
              pointerEvents: showSidebar && window.innerWidth <= 992 ? 'none' : 'auto',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Chat header */}
            <div style={{
              padding: '16px',
              borderBottom: isDarkMode ? '1px solid #2a2a4a' : '1px solid #e9ecef',
              background: isDarkMode ? '#1e2a47' : '#ffffff',
              backdropFilter: 'blur(10px)',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              {selectedUser ? (
                <div className="d-flex align-items-center">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getRandomGradient(selectedUser),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }}>
                    {selectedUserName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="m-0 fw-bold" style={{ fontSize: '1.1rem' }}>
                      {selectedUserName || 'Chat'}
                    </h4>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isDarkMode ? '#a1c4fd' : '#5e72e4'
                    }}>
                      <span className="me-1" style={{ 
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4cd137',
                        marginBottom: '1px'
                      }}></span>
                      Online
                    </div>
                  </div>
                </div>
              ) : (
                <h4 className="m-0 fw-bold d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                  <BsPersonCircle className="me-2" size={20} />
                  Select a contact to start chatting
                </h4>
              )}
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: isDarkMode 
                ? 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232d3748\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
                : 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e9ecef\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa'
            }}>
              {isLoading && messages.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <div className="spinner-border" role="status" style={{ 
                    color: isDarkMode ? '#a1c4fd' : '#5e72e4',
                    width: '2rem',
                    height: '2rem'
                  }}></div>
                  <p className="mt-3" style={{ 
                    fontSize: '0.9rem',
                    color: isDarkMode ? '#a1c4fd' : '#5e72e4'
                  }}>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div>
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`d-flex mb-3 ${msg.senderId === myUser?.id ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        {msg.senderId !== myUser?.id && (
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: getInitialsBackground(msg.senderId),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '8px',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            alignSelf: 'flex-end'
                          }}>
                            {selectedUserName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{
                          maxWidth: '75%',
                          padding: '10px 16px',
                          borderRadius: '18px',
                          background: msg.senderId === myUser?.id
                            ? isDarkMode 
                              ? 'linear-gradient(135deg, #0d6efd, #0dcaf0)' 
                              : 'linear-gradient(135deg, #5e72e4, #825ee4)'
                            : isDarkMode ? '#2d3748' : '#ffffff',
                          color: msg.senderId === myUser?.id ? '#ffffff' : isDarkMode ? '#e6e6e6' : '#212529',
                          boxShadow: isDarkMode
                            ? '0 2px 10px rgba(0,0,0,0.2)'
                            : '0 2px 10px rgba(0,0,0,0.05)',
                          borderTopRightRadius: msg.senderId === myUser?.id ? '4px' : '18px',
                          borderTopLeftRadius: msg.senderId === myUser?.id ? '18px' : '4px',
                          wordWrap: 'break-word'
                        }}>
                          <div>{msg.content}</div>
                          <div style={{
                            fontSize: '0.7rem',
                            textAlign: 'right',
                            marginTop: '4px',
                            opacity: 0.7
                          }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        {msg.senderId === myUser?.id && (
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: getInitialsBackground(msg.senderId),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '8px',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            alignSelf: 'flex-end'
                          }}>
                            {myUser?.username?.charAt(0).toUpperCase() || 'M'}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              ) : selectedUser ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: isDarkMode ? '#2d3748' : '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <BsPersonCircle size={40} style={{ 
                      color: isDarkMode ? '#a1c4fd' : '#5e72e4' 
                    }} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-0"
                    style={{ 
                      color: isDarkMode ? '#a1c4fd' : '#5e72e4',
                      maxWidth: '300px'
                    }}
                  >
                    No messages yet. Start a conversation with {selectedUserName}!
                  </motion.p>
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #2d3748, #1a202c)' 
                        : 'linear-gradient(135deg, #e9ecef, #dee2e6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <BsPersonCircle size={50} style={{ 
                      color: isDarkMode ? '#a1c4fd' : '#5e72e4' 
                    }} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-0"
                    style={{ 
                      color: isDarkMode ? '#a1c4fd' : '#5e72e4',
                      fontSize: '1.1rem',
                      maxWidth: '350px',
                      lineHeight: '1.6'
                    }}
                  >
                    Select a contact from the sidebar to start messaging
                  </motion.p>
                </div>
              )}
            </div>

            {/* Message input */}
            {selectedUser && (
              <form 
                onSubmit={sendMessage}
                style={{
                  padding: '16px',
                  borderTop: isDarkMode ? '1px solid #2a2a4a' : '1px solid #e9ecef',
                  background: isDarkMode ? '#1e2a47' : '#ffffff'
                }}
              >
                <div className="input-group">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-control"
                    placeholder="Type a message..."
                    disabled={isLoading}
                    style={{
                      background: isDarkMode ? '#2d3748' : '#f8f9fa',
                      color: isDarkMode ? '#e6e6e6' : '#212529',
                      border: isDarkMode ? '1px solid #4a5568' : '1px solid #ced4da',
                      borderRadius: '20px 0 0 20px',
                      padding: '12px 16px',
                      boxShadow: 'none'
                    }}
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="btn d-flex align-items-center justify-content-center"
                    style={{
                      background: isLoading || !message.trim()
                        ? isDarkMode ? '#4a5568' : '#e9ecef'
                        : isDarkMode
                          ? 'linear-gradient(135deg, #0d6efd, #0dcaf0)'
                          : 'linear-gradient(135deg, #5e72e4, #825ee4)',
                      color: isLoading || !message.trim()
                        ? isDarkMode ? '#a0aec0' : '#6c757d'
                        : '#ffffff',
                      borderRadius: '0 20px 20px 0',
                      width: '56px',
                      border: 'none'
                    }}
                  >
                    {isLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <BsSend />
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;