// src/App.tsx
import AppNavigator from './navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast'; 

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider> {/* The ONE provider */}
        <AppNavigator />
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;