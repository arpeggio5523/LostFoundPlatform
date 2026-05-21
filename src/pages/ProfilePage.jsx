import NavBar from "../components/NavBar";
import AuthButton from "../components/AuthButton";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold text-gray-900">My Profile</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile card */}
          <aside className="col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-4xl font-semibold text-blue-600">J</div>
                <h2 className="text-xl font-medium text-gray-900">Your Name</h2>
                <p className="text-sm text-gray-500">your.email@example.com</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-sm text-gray-600">Phone: —</div>
                <div className="text-sm text-gray-600">Role: —</div>
                <div className="text-sm text-gray-600">Joined: —</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-40">
                <AuthButton onClick={() => navigate('/profile/settings')}>Settings</AuthButton>
              </div>
            </div>
          </aside>

          {/* (Personal information section removed) */}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
