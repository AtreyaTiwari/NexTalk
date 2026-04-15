import { X } from "lucide-react";

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 text-white">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">My Profile</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-lg">{profile?.name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Mobile</p>
              <p className="text-lg">{profile?.mobile}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Joined</p>
              <p className="text-lg">
                {profile?.createdAt?.slice(0, 10)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}