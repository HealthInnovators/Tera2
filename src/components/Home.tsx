import React from 'react';
import TeraAvatar from './icons/TeraAvatar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ fontSize: '35px' }}>Transform Your Digital Experience</h1>
          <p className="text-xl" style={{ fontSize: '25px' }}>teradev.aaryadv.com</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-8" style={{ fontSize: '20px' }}>
            Innovative software solutions, Cutting-Edge cyber security and Ground breaking product development.We turn your ideas into reality with technology that drives growth and success.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
