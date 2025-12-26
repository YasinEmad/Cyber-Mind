import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
} from 'lucide-react';


const initialChallenges = [
  { id: 1, title: 'Speed Coding', description: 'Solve 5 algorithms in under 10 minutes.', reward: '500 XP' },
  { id: 2, title: 'Debug the Monolith', description: 'Find the critical bug in the legacy code block.', reward: '1000 XP' },
];

const ChallengeView = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Challenge Management</h2>
          <p className="text-gray-400 mt-1">Organize competitive challenges.</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
          <Plus size={20} />
          Add New Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 flex flex-col hover:border-yellow-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-900/30 rounded-lg text-yellow-400">
                <Trophy size={24} />
              </div>
              <span className="px-2 py-1 text-xs font-semibold bg-gray-700 text-yellow-500 rounded-full">
                {challenge.reward}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
            <p className="text-gray-400 mb-6 flex-grow">{challenge.description}</p>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                <Edit size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeView;
