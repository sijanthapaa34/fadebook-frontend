import { seedServices } from '@/data/seed';
import { Button } from '@/components/ui/button';
import { Plus, Clock, DollarSign, Edit } from 'lucide-react';

const ServiceManagement = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-display font-bold">Services</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your service menu</p>
      </div>
      <Button variant="hero"><Plus size={16} className="mr-2" /> Add Service</Button>
    </div>

    <div className="grid gap-4">
      {seedServices.map((srv) => (
        <div key={srv.id} className="glass-card p-5 flex items-center justify-between hover:border-primary/20 transition-colors">
          <div className="flex-1">
            <p className="font-semibold">{srv.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{srv.description}</p>
            <div className="flex items-center gap-6 mt-3 text-xs font-medium">
              <span className="text-primary flex items-center gap-1"><DollarSign size={12} /> {srv.price}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock size={12} /> {srv.durationMinutes} min</span>
            </div>
          </div>
          <Button variant="ghost" size="icon"><Edit size={16} /></Button>
        </div>
      ))}
    </div>
  </div>
);

export default ServiceManagement;