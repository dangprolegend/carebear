import DashboardBase from './DashboardBase';

const tasks = [
  { id: 1, datetime: '2025-05-25T12:36:00', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
  { id: 2, datetime: '2025-05-25T12:37:00', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
  { id: 3, datetime: '2025-05-25T12:38:00', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
  { id: 4, datetime: '2025-05-25T12:39:00', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
];

const Dashboard = () => {
  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;