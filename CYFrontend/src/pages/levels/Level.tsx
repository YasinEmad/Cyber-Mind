import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Lightbulb, Play, Loader, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ctfService } from '../../api/ctfService';
import ctfInfo from '../../utils/ctfinfo';

// 1. تعريف واجهة البيانات لضمان التوافق مع TypeScript
interface LevelData {
  title: string;
  description: string;
  hints?: string[];
}

const Level: React.FC = () => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const levelNumber = parseInt(levelId || '1', 10);
  
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب البيانات من الـ API (تأكد من تشغيل السيرفر على 8080)
        const data = await ctfService.getCTFChallenge(levelNumber);
        setLevelData(data);
      } catch (err) {
        console.warn('Backend unavailable, using fallback:', err);
        
        // التحويل للبيانات المحلية في حال فشل السيرفر
        const localData = ctfInfo.levels.find((l: any) => l.level === levelNumber);
        if (localData) {
          setLevelData({
            title: localData.name,
            description: localData.description,
            hints: localData.hints,
          });
          setError('تعمل الآن على النسخة الاحتياطية (Offline Mode)');
        } else {
          setError('لم يتم العثور على بيانات لهذا المستوى');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLevelData();
  }, [levelNumber]);

  const startCtf = () => {
    navigate(`/linux?level=${levelNumber}`);
  };

  // 2. واجهة حالة التحميل (Loading UI)
  if (loading) {
    return (
      <PageWrapper>
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-10 h-10 text-red-600 animate-spin" />
            <p className="font-mono text-zinc-500 animate-pulse uppercase tracking-widest text-xs">
              Fetching Mission Data...
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4 lg:p-8">
        <motion.div 
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-px bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* الجانب الأيسر: معلومات المهمة */}
          <div className="md:col-span-4 bg-zinc-950 p-6 flex flex-col justify-between border-r border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-6">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                  {error ? 'Status.Offline' : 'Auth.Session.Active'}
                </span>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                {levelData?.title}
              </h1>
              
              <div className="h-1 w-12 bg-red-600 mb-6" />

              <p className="text-zinc-400 text-sm leading-relaxed mb-4 font-medium">
                {levelData?.description}
              </p>

              {error && (
                <div className="flex items-center gap-2 text-orange-500/80 text-[10px] font-mono italic">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={startCtf}
              className="mt-10 flex items-center justify-between w-full px-5 py-4 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-sm transition-all group shadow-[0_4px_20px_-5px_rgba(220,38,38,0.4)]"
            >
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 fill-current" />
                START MISSION
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* الجانب الأيمن: التلميحات (Hints) */}
          <div className="md:col-span-8 bg-zinc-900 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-mono text-zinc-400 tracking-[0.3em] uppercase">Intelligence Hints</span>
              </div>
            </div>
            
            <div className="flex-grow p-8 bg-black/20 relative overflow-y-auto">
               <div className="grid grid-cols-1 gap-4 relative z-10">
                 {levelData?.hints && levelData.hints.length > 0 ? (
                   levelData.hints.map((hint, index) => (
                     <div key={index} className="p-4 border border-zinc-800 bg-zinc-900/50 rounded-md">
                       <p className="text-[11px] font-mono text-red-500 mb-1 uppercase tracking-tighter">
                         Hint #{String(index + 1).padStart(2, '0')}
                       </p>
                       <p className="text-zinc-400 text-sm italic leading-relaxed">
                         "{hint}"
                       </p>
                     </div>
                   ))
                 ) : (
                   <div className="text-zinc-600 font-mono text-xs italic">No intelligence available for this sector.</div>
                 )}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Level;