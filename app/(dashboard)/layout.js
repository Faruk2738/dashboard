import fs from 'fs';
import path from 'path';
import Sidebar from './Sidebar';
import ChatbotDrawer from './ChatbotDrawer';

export default function DashboardLayout({ children }) {
  // Read latest date for footer
  let latestDate = '31 May 2024';
  try {
    const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (data.latestDate) {
      const d = new Date(data.latestDate);
      latestDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch {}

  return (
    <div className="flex h-screen bg-gray-50 antialiased overflow-hidden w-full relative">
      <Sidebar latestDate={latestDate} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
      <ChatbotDrawer />
    </div>
  );
}
