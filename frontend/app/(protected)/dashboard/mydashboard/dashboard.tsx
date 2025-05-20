import DashboardBase from './DashboardBase';

const Dashboard = () => {
  const tasks = [
    { date: '2025-05-20', time: '8:00 am', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
    { date: '2025-05-19', time: '12:00 pm', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
    { date: '2025-05-19', time: '1:00 pm', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
    { date: '2025-05-19', time: '6:00 pm', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
  ];

  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;