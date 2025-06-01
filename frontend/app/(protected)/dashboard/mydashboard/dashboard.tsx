import DashboardBase from './DashboardBase';

const tasks = [
  { datetime: '2025-06-01T08:00:00', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
  { datetime: '2025-06-02T12:00:00', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
  { datetime: '2025-06-03T13:00:00', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
  { datetime: '2025-06-04T18:00:00', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
];

const Dashboard = () => {
  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;