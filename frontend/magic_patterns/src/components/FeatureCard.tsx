import React from 'react';
import { BoxIcon } from 'lucide-react';
interface FeatureCardProps {
  icon: BoxIcon;
  title: string;
  description: string;
  className?: string;
}
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = ''
}: FeatureCardProps) => {
  return <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
        <Icon size={20} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>;
};
export default FeatureCard;