'use client';

import { FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

const Button4 = ({ children = 'Explore More', className = '', ...props }) => {
  return (
    <Button className={`group inline-flex items-center gap-2 rounded-lg ${className}`} {...props}>
      {children}
      <FiArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:scale-110" />
    </Button>
  );
};

export default Button4;
