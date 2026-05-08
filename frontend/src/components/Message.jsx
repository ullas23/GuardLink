import React from 'react';

const Message = ({ message, onClose }) => {
  const getMessageClass = () => {
    switch (message.type) {
      case 'error': return 'message-error';
      case 'success': return 'message-success';
      case 'warning': return 'message-warning';
      default: return 'message-error';
    }
  };

  return (
    <div className={`message ${getMessageClass()}`}>
      <span>{message.text}</span>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Message;
