import './Notification.css';

const Notification = ({ message, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <div
      className='notification-container'
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className='notification'>
        <span className='notification-icon'>⚠️</span>
        <span className='notification-text'>{message}</span>
      </div>
    </div>
  );
};

export default Notification;
