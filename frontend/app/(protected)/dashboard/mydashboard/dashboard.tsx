import DashboardBase from './DashboardBase';

const Dashboard = () => {
  const tasks = [
    { time: '8:00 am', type: 'Breakfast', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
    { time: '8:00 am', type: 'Breakfast', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after breakfast' },
    { time: '12:00 pm', type: 'Lunch', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
    { time: '1:00 pm', type: 'Lunch', title: 'Help Grandm...', detail: 'Bedroom' },
    { time: '6:00 pm', type: 'Dinner', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
    { time: '6:00 pm', type: 'Dinner', title: 'Supplement 2', detail: '1 Tablet', subDetail: 'after dinner' },
  ];

  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;