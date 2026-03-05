import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, Settings, Edit, Trophy, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { PassportGrid } from "@/components/passport/PassportGrid";
import { getPassportData, handleAvatarUploadAction, getUserScore } from "@/lib/actions";

interface ProfileScreenProps {
    onNavigate: (screen: string, data?: any) => void;
    currentUser?: any;
    onUserUpdate?: (user: any) => void;
}

export function ProfileScreen({ onNavigate, currentUser, onUserUpdate }: ProfileScreenProps) {
    const [passportData, setPassportData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [totalScore, setTotalScore] = useState(currentUser?.xp || 0);
    const [solvedQuizzes, setSolvedQuizzes] = useState(0);

    useEffect(() => {
        if (currentUser?.id) {
            getPassportData(currentUser.id).then(setPassportData);
            getUserScore(currentUser.id).then(res => {
                setTotalScore(res.totalScore);
                setSolvedQuizzes(res.solvedQuizzesCount);
            });
        }
    }, [currentUser?.id, currentUser?.xp]);

    const getRank = (level: number) => {
        if (level >= 5) return "Mestre del Pirineu";
        if (level === 4) return "Naturalista Expert";
        if (level === 3) return "Viatger del Territori";
        if (level === 2) return "Rastrejador de Camins";
        return "Explorador Novell";
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser?.id) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const result = await handleAvatarUploadAction(formData, currentUser.id);
            if (result.success && result.user) {
                if (onUserUpdate) {
                    onUserUpdate(result.user);
                } else {
                    window.location.reload();
                }
            } else {
                alert("Error al pujar l'avatar");
            }
        } catch (err) {
            alert("Error al pujar l'avatar");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-[#F9F7F2] dark:bg-[#1a211e] min-h-screen flex flex-col relative overflow-x-hidden text-[#1e2b25] dark:text-gray-100 font-sans pb-32">

            {/* Header Navigation */}
            <div className="sticky top-0 z-50 bg-[#F9F7F2]/95 dark:bg-[#1a211e]/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3 flex items-center justify-between">
                <button onClick={() => onNavigate('home')} className="text-[#1e2b25] dark:text-white p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="font-serif text-xl font-medium tracking-wide text-[#1e2b25] dark:text-white">El Meu Quadern</h2>
                <div className="w-10" />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6 pb-24">

                <div className="flex flex-col items-center pt-6 px-4">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                        <div className="w-32 h-32 rounded-full p-1 border-[3px] border-primary bg-white shadow-sm overflow-hidden">
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <img
                                    alt="Profile picture"
                                    className="w-full h-full object-cover rounded-full"
                                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop"}
                                />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-[#F9F7F2] dark:border-[#1a211e] shadow-sm">
                            <Edit className="w-4 h-4" />
                        </div>
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <h1 className="font-serif text-3xl font-bold text-[#1e2b25] dark:text-white leading-tight">
                            {currentUser?.username || "Explorador Anònim"}
                        </h1>
                        <p className="font-serif italic text-primary text-lg mt-1">
                            {getRank(currentUser?.level || 1)}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                            Nivell {currentUser?.level || 1} • {currentUser?.xp || 0} XP
                        </p>
                    </div>
                </div>

                <div className="px-4">
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(86,143,114,0.15)] border border-primary/10 flex justify-between divide-x divide-primary/10">
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
                            <span className="font-serif text-3xl font-bold text-primary">{currentUser?.visitedCount || 0}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Llocs Visitats</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
                            <span className="font-serif text-3xl font-bold text-primary">{totalScore}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Punts Totals</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
                            <span className="font-serif text-3xl font-bold text-primary">{solvedQuizzes}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Quizes Resolts</span>
                        </div>
                    </div>
                </div>

                {/* Passport Section */}
                <div className="px-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-serif text-2xl font-bold text-[#1e2b25] dark:text-white italic">El Teu Passaport</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                                Segells — {passportData.filter((s: any) => s.isCompleted).length} / {passportData.length} desbloquejats
                            </p>
                        </div>
                    </div>

                    {/* Stamps Grid Container */}
                    <PassportGrid initialStamps={passportData} />
                </div>


            </main>
        </div>
    );
}


