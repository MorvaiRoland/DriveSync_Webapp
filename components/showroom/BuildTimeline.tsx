'use client'

import { motion } from 'framer-motion';
import { Calendar, Package, ArrowUpRight, Plus } from 'lucide-react';
import Image from 'next/image';

export default function BuildTimeline({ updates }: { updates: any[] }) {
  return (
    <div className="space-y-12 relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-gradient-to-b before:from-primary before:to-transparent before:opacity-20">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Package className="text-primary" /> Build Thread
        </h3>
        <button className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all">
          <Plus size={20} />
        </button>
      </div>

      {updates.map((update, index) => (
        <motion.div 
          key={update.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative pl-12 group"
        >
          {/* Timeline Dot */}
          <div className="absolute left-0 top-2 w-10 h-10 bg-background border-2 border-primary/40 rounded-2xl flex items-center justify-center z-10 group-hover:border-primary transition-colors shadow-2xl">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>

          <div className="glass rounded-[2rem] p-6 border border-border/50 group-hover:border-primary/30 transition-all shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
              {update.image_url && (
                <div className="w-full md:w-48 h-32 relative rounded-2xl overflow-hidden border border-white/5">
                  <Image src={update.image_url} alt={update.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> {new Date(update.update_date).toLocaleDateString('hu-HU')}
                  </span>
                  {update.cost > 0 && (
                    <span className="text-[10px] font-bold text-muted-foreground italic">
                      Befektetés: {update.cost.toLocaleString()} Ft
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{update.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{update.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}