import DashboardBase from './DashboardBase';

const MemberDashboard = () => {
  const tasks = [
  { datetime: '2025-05-20T08:00:00', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
  { datetime: '2025-05-19T12:00:00', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
  { datetime: '2025-05-21T13:00:00', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
  { datetime: '2025-05-22T18:00:00', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
];


  return <DashboardBase tasks={tasks} title="Member Dashboard" />;
};

export default MemberDashboard;