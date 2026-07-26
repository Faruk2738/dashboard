import Sidebar from './Sidebar';
import ChatbotDrawer from './ChatbotDrawer';

const dashboardUpdatedDate = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
});

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 antialiased overflow-hidden w-full relative">
      <Sidebar updatedDate={dashboardUpdatedDate} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
      <ChatbotDrawer />
    </div>
  );
}
