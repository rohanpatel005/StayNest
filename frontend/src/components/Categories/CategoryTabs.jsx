import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { 
  Palmtree, 
  Mountain, 
  Waves, 
  Tent, 
  Sparkles, 
  Tractor, 
  Map, 
  Building2 
} from 'lucide-react';

const categories = [
  { id: 'beach', label: 'Beach', icon: Palmtree },
  { id: 'mountains', label: 'Mountains', icon: Mountain },
  { id: 'pools', label: 'Pools', icon: Waves },
  { id: 'cabins', label: 'Cabins', icon: Tent },
  { id: 'luxury', label: 'Luxury', icon: Sparkles },
  { id: 'countryside', label: 'Countryside', icon: Tractor },
  { id: 'islands', label: 'Islands', icon: Map },
  { id: 'city', label: 'City', icon: Building2 },
];

const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  return (
    <div className="w-full border-b border-gray-100 bg-white sticky top-[80px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex overflow-x-auto hide-scrollbar py-4 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-max relative pb-4 transition-colors duration-200 group",
                  isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-xs font-medium">{category.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default CategoryTabs;
