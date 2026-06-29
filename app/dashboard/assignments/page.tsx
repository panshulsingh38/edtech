export default function AssignmentsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Assignments</h1>
        <p className="text-nord-4 text-lg">Track your upcoming quizzes and essays.</p>
      </div>
      <div className="bg-nord-1 border border-nord-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[300px]">
        <p className="text-nord-4 mb-4">You have no pending assignments.</p>
      </div>
    </div>
  );
}
