import Group from '../../models/Group';

/**
 * Get a user's role in a group by groupID and userID.
 * Returns the role string or null if not found.
 */
export async function getUserRoleInGroup(userId: string, groupId: string): Promise<string | null> {
  const group = await Group.findById(groupId);
  if (!group) return null;
  const member = group.members.find((m: any) => m.user.toString() === userId.toString());
  return member ? member.role : null;
}

/**
 * Get all user IDs in a group with a specific role.
 */
export async function getUserIdsByRoleInGroup(groupId: string, role: string): Promise<string[]> {
  const group = await Group.findById(groupId);
  if (!group) return [];
  return group.members.filter((m: any) => m.role === role).map((m: any) => m.user.toString());
}

/**
 * Get all user IDs in a group with any of the specified roles.
 */
export async function getUserIdsByRolesInGroup(groupId: string, roles: string[]): Promise<string[]> {
  const group = await Group.findById(groupId);
  if (!group) return [];
  return group.members.filter((m: any) => roles.includes(m.role)).map((m: any) => m.user.toString());
}
