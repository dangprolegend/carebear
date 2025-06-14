import React from 'react';
import DashboardBase from './DashboardBase';
import { Task } from './task';

type MemberDashboardProps = {
  tasks?: Task[];
  userRole?: string;
};

const MemberDashboard = ({ tasks = [], userRole = 'carereceiver' }: MemberDashboardProps) => {
  return (
    <DashboardBase 
      tasks={tasks} 
      title="Care Receiver Dashboard" 
      showHighPrioritySection={false} 
      showHealthSection={true}
      userRole={userRole}
    />
  );
};

export default MemberDashboard;