"use client";

import { useState, useRef } from "react";
import { Camera, Check, Pencil, Loader2 } from "lucide-react";
import { updateProfileName, uploadAvatar } from "@/app/profile/actions";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: any;
  userEmail: string;
}

export function ProfileHero({ profile, userEmail }: ProfileHeroProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.nombre || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameUpdate = async () => {
    if (name === profile?.nombre) { setIsEditing(false); return; }
    setLoading(true);
    await updateProfileName(name);
    setLoading(false);
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadAvatar(formData);
    setUploading(false);
    if (result && result.error) {
      alert("Error al subir foto: " + result.error);
    }
  };

  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : "U";

  const planLabel = profile?.plan === 'pro' ? 'PRO' : profile?.plan === 'premium' ? 'PREMIUM' : 'FREE';
  const planColor = profile?.plan === 'pro' ? 'bg-purple-500 text-white' : profile?.plan === 'premium' ? 'bg-amber-400 text-amber-900' : 'bg-white/20 text-white';

  return (
    <div className="w-full flex flex-col items-center gap-5 py-6 px-6 relative z-10">
      {/* Avatar */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-white italic">{initials}</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 border-none cursor-pointer hover:scale-110 transition-all z-20"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>

      {/* Name + Email */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
              className="bg-white/15 border-b-2 border-white text-2xl font-black text-white text-center outline-none px-3 py-1 rounded-t-xl w-48"
            />
            <button onClick={handleNameUpdate} disabled={loading} className="p-1.5 bg-white rounded-lg text-blue-600 cursor-pointer border-none shadow-lg">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none uppercase">
              {profile?.nombre || 'Usuario'}
            </h1>
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-white/50 hover:text-white cursor-pointer border-none bg-white/10 rounded-lg transition-all hover:bg-white/20">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <p className="text-sm text-white/60 font-medium tracking-wide">{userEmail}</p>
        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-0.5", planColor)}>
          {planLabel}
        </span>
      </div>
    </div>
  );
}
