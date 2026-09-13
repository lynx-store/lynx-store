export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-center max-w-md w-full">
        <h1 className="text-5xl font-black text-amber-400 mb-4 tracking-wider">
          LYNX
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          تم بناء الموقع وتفعيل Tailwind CSS بنجاح!
        </p>
        <button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
          تصفح المتجر
        </button>
      </div>
    </div>
  );
}
