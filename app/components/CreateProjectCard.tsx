'use client';


interface CreateProjectCardProps {
  onCreateClick: () => void;
}

const CreateProjectCard = ({ onCreateClick }: CreateProjectCardProps) => {
  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-indigo-500 
        flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-all duration-200"
      onClick={onCreateClick}
    >
      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Nouveau Projet</h3>
      <p className="text-sm text-gray-500 text-center mt-2">
        Cliquez ici pour créer un nouveau projet
      </p>
    </div>
  );
};

export default CreateProjectCard; 