import AdminPrivateRoute from "@/app/components/AdminPrivateRoute";
import Header from "@/app/UI/Menus";

export default function AdminLayout({ children }) {
    return (
        <AdminPrivateRoute>
            <Header />
            <main className="md:pl-64 md:pt-28 2xl:pt-32 transition-all duration-300 min-h-screen">
                <div className="relative">
                    {children}
                </div>
            </main>
        </AdminPrivateRoute>
    );
}
