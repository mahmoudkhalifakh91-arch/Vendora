import React from 'react';
import WaslhaApp from '../../وصلها---خدمة-التوصيل-الذكية/App';

export const WaslhaAppWrapper: React.FC = () => {
  return (
    <div className="w-full min-h-[700px] bg-slate-50 relative rounded-2xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-805">
      <WaslhaApp />
    </div>
  );
};
