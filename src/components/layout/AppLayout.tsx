import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0 flex-1 2xl:max-w-[1400px] w-full mx-auto">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
