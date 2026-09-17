import { getCategoryStyle } from '../../utils/notificationHelpers';

const NotificationCategoryBadge = ({ notification, size = 'sm' }) => {
  const style = getCategoryStyle(notification);
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${sizeClass} ${style.badgeClass}`}
    >
      {style.label}
    </span>
  );
};

export default NotificationCategoryBadge;
