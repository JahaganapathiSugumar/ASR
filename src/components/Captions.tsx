import React from 'react';
import { useStore } from '../store/useStore';

const Captions: React.FC = () => {
  const { captions } = useStore();

  return captions ? (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg max-w-2xl text-center">
      {captions}
    </div>
  ) : null;
};

export default Captions;