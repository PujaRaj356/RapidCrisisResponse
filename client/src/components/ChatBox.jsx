import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Send, X, MessageSquare } from 'lucide-react';
import './ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }
    return () => {
      if (socket) socket.off('message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const sendMessage = (e) => {
    e.preventDefault();
    console.log("Submit clicked, newMessage:", newMessage, "socket:", !!socket);
    if (!newMessage.trim() || !socket) return;
    
    const payload = {
      sender: user._id,
      content: newMessage,
    };
    console.log("Emitting chatMessage with payload:", payload);
    
    socket.emit('chatMessage', payload);
    setNewMessage('');
  };

  return (
    <>
      <button className="chat-toggle primary-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="chat-window glass-panel">
          <div className="chat-header">
            <h3>Emergency Comms Hub</h3>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => {
              const time = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={idx} className={`chat-bubble ${msg.sender?._id === user._id ? 'mine' : 'theirs'}`}>
                  <span className="sender">{msg.sender?.name || 'Unknown'} ({msg.sender?.role || 'Guest'})</span>
                  <p>{msg.content}</p>
                  <span className="msg-time" style={{ fontSize: '0.65rem', opacity: 0.6, alignSelf: 'flex-end', marginTop: '4px', display: 'block', textAlign: 'right' }}>{time}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="icon-btn"><Send size={20} className="text-accent" /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBox;
