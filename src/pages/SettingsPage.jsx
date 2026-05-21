import NavBar from "../components/NavBar";

function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Settings</h1>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Settings are not implemented yet.</p>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
