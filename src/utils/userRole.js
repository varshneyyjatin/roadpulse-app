/** @param {{ role?: string } | null | undefined} user */
export const isManagerRole = (user) => user?.role?.toLowerCase() === 'manager';

/** @param {{ role?: string } | null | undefined} user */
export const isCreatorRole = (user) => user?.role?.toLowerCase() === 'creator';

/** Manager or Creator — can view/save vehicle detection alert preferences */
export const canManageNotificationPreferences = (user) =>
  isManagerRole(user) || isCreatorRole(user);
