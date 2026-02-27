// src/pages/Placeholder.tsx
import React from 'react';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <Construction size={48} className="text-primary mb-4" />
    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">This page is under construction.</p>
  </div>
);

export default Placeholder;