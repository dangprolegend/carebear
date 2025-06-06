//@ts-nocheck
import Group from '../models/Group';
import User from '../models/User';
import { sendInvitationEmail } from '../services/emailService';

// Role mapping helper
const mapFrontendRoleToBackend = (frontendRole: string): string => {
  const roleMap: { [key: string]: string } = {
    'CareBear': 'caregiver',
    'BabyBear': 'carereceiver', 
    'BearBoss': 'admin'
  };
  return roleMap[frontendRole] || 'caregiver';
};
export const sendInvitation = async (req: any, res: any): Promise<void> => {
  try {
    const { email, role, familialRelation, inviterName } = req.body;
    const { userID } = req.params;
    const user = await User.findById(userID).select('groupID');
    const groupID = user?.groupID;

    if (!groupID) {
      res.status(404).json({ message: 'Inviter does not belong to any group' });
      return;
    }

    const group = await Group.findById(groupID);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if email is already invited or is a member
    const existingInvitation = group.pendingInvitations.find(inv => inv.email === email);
    const existingMember = await User.findOne({ email, groupID });
    
    if (existingInvitation) {
      res.status(400).json({ message: 'User already has a pending invitation' });
      return;
    }
    
    if (existingMember) {
      res.status(400).json({ message: 'User is already a member of this group' });
      return;
    }
    
    // Map frontend role to backend role
    const backendRole = mapFrontendRoleToBackend(role);

    // Add to pending invitations
    group.pendingInvitations.push({
      email,
      role: backendRole,
      familialRelation,
      invitedBy: userID,
      invitedAt: new Date()
    });

    await group.save();

    // Send email 
    await sendInvitationEmail({
      recipientEmail: email,
      groupName: group.name,
      groupID: String(groupID),
      role: backendRole,
      familialRelation,
      inviterName: inviterName || 'A family member', // Use the name from frontend
    });

    res.status(200).json({
      message: 'Invitation sent successfully',
      invitation: {
        email,
        role: backendRole,
        familialRelation,
        invitedAt: new Date()
      }
    });

  } catch (err: any) {
    console.error('Error sending invitation:', err);
    res.status(500).json({ error: err.message });
  }
};