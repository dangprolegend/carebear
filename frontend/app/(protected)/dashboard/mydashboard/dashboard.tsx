import DashboardBase from './DashboardBase';

const tasks = [
  { _id: '1', datetime: '2025-06-01T08:00:00', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
  { _id: '2', datetime: '2025-06-02T12:00:00', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
  { _id: '3', datetime: '2025-06-03T13:00:00', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
  { _id: '4', datetime: '2025-06-04T18:00:00', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
];

const Dashboard = () => {
  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;