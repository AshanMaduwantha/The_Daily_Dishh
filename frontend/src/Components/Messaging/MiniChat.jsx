import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BsSend, BsX, BsChat, BsChevronDown, BsChevronUp, BsMoonStarsFill, BsSunFill } from 'react-icons/bs';

// Define your API base URL as a constant
const API_BASE_URL = "http://localhost:8080/api";

const CompactChatWidget = () => {
  const myUser = useSelector((state) => state.user.user);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
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

    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    if (isOpen) {
      const socket = new WebSocket("ws://localhost:8080/ws/chat");
      websocketRef.current = socket;

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
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
      const data = await res.json();
      setUsers(data);
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
        fetch(`${API_BASE_URL}/messages/${myUser.id}/${userId}`, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }),
        fetch(`${API_BASE_URL}/messages/${userId}/${myUser.id}`, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        })
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      // Merge and sort messages by timestamp
      const mergedMessages = [...data1, ...data2].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      setMessages(mergedMessages);
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
      
      await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          senderId: myUser.id,
          receiverId: selectedUser,
          content: message.trim(),
        })
      });
      
      setNewMessage(newMessage);

      try {
        if (websocketRef.current) {
          websocketRef.current.send(JSON.stringify(newMessage));
        }
        setMessage('');
        setMessages((prevMessages) => [...prevMessages, newMessage]);
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && selectedUser) {
      fetchMessages(selectedUser);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  // Find the selected user name
  const selectedUserName = users.find(user => user.id === selectedUser)?.username;
  
  const getInitialsBackground = (userId) => {
    const colors = [
      '#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', 
      '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'
    ];
    
    const index = userId?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getUnreadCount = () => {
    // This would normally calculate unread messages
    // For demo purposes returning a random number between 0-5
    return Math.floor(Math.random() * 6);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const unreadCount = getUnreadCount();

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 1050
    }}>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0d6efd, #0dcaf0)' 
            : 'linear-gradient(135deg, #0d6efd, #6610f2)',
          color: '#ffffff',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {isOpen ? <BsX size={28} /> : <BsChat size={24} />}
        
        {!isOpen && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#dc3545',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid white'
            }}
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '0',
              width: isExpanded ? '380px' : '320px',
              height: isExpanded ? '520px' : '400px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              background: isDarkMode ? '#212529' : '#fff',
              border: isDarkMode ? '1px solid #343a40' : '1px solid #dee2e6',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Chat Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: isDarkMode ? '1px solid #343a40' : '1px solid #dee2e6',
              background: isDarkMode ? '#343a40' : '#f8f9fa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }} onClick={toggleUserList}>
                {selectedUser ? (
                  <>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: getInitialsBackground(selectedUser),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                      {selectedUserName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 style={{
                        margin: '0',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: isDarkMode ? '#f8f9fa' : '#212529'
                      }}>
                        {selectedUserName}
                      </h5>
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#adb5bd' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#28a745',
                          marginRight: '5px'
                        }}></span>
                        Online
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isDarkMode ? '#f8f9fa' : '#212529',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    Select Contact
                    {showUserList ? 
                      <BsChevronUp style={{marginLeft: '5px', fontSize: '14px'}} /> : 
                      <BsChevronDown style={{marginLeft: '5px', fontSize: '14px'}} />
                    }
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <button 
                  onClick={toggleDarkMode}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDarkMode ? '#ffc107' : '#6c757d',
                    marginRight: '10px',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none'
                  }}
                >
                  {isDarkMode ? <BsSunFill size={16} /> : <BsMoonStarsFill size={16} />}
                </button>
                <button 
                  onClick={toggleExpand}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDarkMode ? '#f8f9fa' : '#6c757d',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none'
                  }}
                >
                  {isExpanded ? <BsChevronDown size={16} /> : <BsChevronUp size={16} />}
                </button>
              </div>
            </div>

            {/* User List */}
            <AnimatePresence>
              {showUserList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: isDarkMode ? '#2b3035' : '#ffffff',
                    borderBottom: isDarkMode ? '1px solid #343a40' : '1px solid #dee2e6',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}
                >
                  {isLoading && users.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: `2px solid ${isDarkMode ? '#6c757d' : '#dee2e6'}`,
                        borderBottomColor: isDarkMode ? '#0d6efd' : '#0d6efd',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    </div>
                  ) : (
                    <div style={{padding: '8px 0'}}>
                      {users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            fetchMessages(user.id);
                            setShowUserList(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 16px',
                            background: selectedUser === user.id 
                              ? isDarkMode 
                                ? 'rgba(13, 110, 253, 0.15)' 
                                : 'rgba(13, 110, 253, 0.1)'
                              : 'transparent',
                            color: selectedUser === user.id 
                              ? isDarkMode ? '#0d6efd' : '#0d6efd'
                              : isDarkMode ? '#f8f9fa' : '#212529',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'background-color 0.2s',
                            outline: 'none',
                            borderRadius: '4px',
                            margin: '0 8px 4px 8px'
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: getInitialsBackground(user.id),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{fontSize: '14px', fontWeight: '500'}}>{user.username}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: isDarkMode 
                ? '#212529' 
                : '#f8f9fa',
              position: 'relative'
            }}>
              {isLoading && messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: `2px solid ${isDarkMode ? '#6c757d' : '#dee2e6'}`,
                    borderBottomColor: isDarkMode ? '#0d6efd' : '#0d6efd',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: isDarkMode ? '#adb5bd' : '#6c757d'
                  }}>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div>
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        marginBottom: '12px',
                        justifyContent: msg.senderId === myUser?.id ? 'flex-end' : 'flex-start'
                      }}
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
                          fontSize: '12px',
                          alignSelf: 'flex-end'
                        }}>
                          {selectedUserName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: '18px',
                        background: msg.senderId === myUser?.id
                          ? isDarkMode 
                            ? '#0d6efd' 
                            : '#0d6efd'
                          : isDarkMode ? '#495057' : '#ffffff',
                        color: msg.senderId === myUser?.id ? '#ffffff' : isDarkMode ? '#f8f9fa' : '#212529',
                        boxShadow: isDarkMode
                          ? '0 1px 3px rgba(0,0,0,0.2)'
                          : '0 1px 3px rgba(0,0,0,0.1)',
                        borderBottomRightRadius: msg.senderId === myUser?.id ? '4px' : '18px',
                        borderBottomLeftRadius: msg.senderId === myUser?.id ? '18px' : '4px',
                        fontSize: '14px',
                        wordBreak: 'break-word'
                      }}>
                        <div>{msg.content}</div>
                        <div style={{
                          fontSize: '10px',
                          textAlign: 'right',
                          marginTop: '4px',
                          opacity: 0.8,
                          color: msg.senderId === myUser?.id ? '#e9ecef' : isDarkMode ? '#ced4da' : '#6c757d'
                        }}>
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                      {msg.senderId === myUser?.id && (
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: getInitialsBackground(myUser.id),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '8px',
                          color: '#ffffff',
                          fontSize: '12px',
                          alignSelf: 'flex-end'
                        }}>
                          {myUser?.username?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : selectedUser ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isDarkMode ? '#343a40' : '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <BsChat size={28} style={{ 
                      color: isDarkMode ? '#0d6efd' : '#0d6efd' 
                    }} />
                  </div>
                  <p style={{
                    textAlign: 'center',
                    margin: 0,
                    fontSize: '14px',
                    color: isDarkMode ? '#adb5bd' : '#6c757d'
                  }}>
                    No messages yet. <br />
                    Start a conversation!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #343a40, #212529)' 
                      : 'linear-gradient(135deg, #e9ecef, #dee2e6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: isDarkMode
                      ? '0 6px 16px rgba(0, 0, 0, 0.3)'
                      : '0 6px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <BsChat size={32} style={{ 
                      color: isDarkMode ? '#0d6efd' : '#0d6efd' 
                    }} />
                  </div>
                  <p style={{
                    textAlign: 'center',
                    margin: 0,
                    fontSize: '15px',
                    color: isDarkMode ? '#adb5bd' : '#6c757d',
                    fontWeight: '500'
                  }}>
                    Select a contact to start messaging
                  </p>
                </div>
              )}
            </div>

            {/* Message input */}
            <form 
              onSubmit={sendMessage}
              style={{
                padding: '12px 16px',
                borderTop: isDarkMode ? '1px solid #343a40' : '1px solid #dee2e6',
                background: isDarkMode ? '#343a40' : '#ffffff'
              }}
            >
              <div style={{
                display: 'flex',
                position: 'relative'
              }}>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isLoading || !selectedUser}
                  style={{
                    flex: '1 1 auto',
                    padding: '10px 44px 10px 16px',
                    borderRadius: '24px',
                    border: 'none',
                    background: isDarkMode ? '#495057' : '#f8f9fa',
                    color: isDarkMode ? '#f8f9fa' : '#212529',
                    fontSize: '14px',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.075)',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                  }}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !message.trim() || !selectedUser}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '4px',
                    bottom: '4px',
                    width: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: (isLoading || !message.trim() || !selectedUser)
                      ? isDarkMode ? '#6c757d' : '#ced4da'
                      : '#0d6efd',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (isLoading || !message.trim() || !selectedUser) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease-in-out',
                    outline: 'none'
                  }}
                >
                  {isLoading ? (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.25)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <BsSend size={16} />
                  )}
                </button>
              </div>
            </form>
            
            {/* Add keyframes for spin animation */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompactChatWidget;