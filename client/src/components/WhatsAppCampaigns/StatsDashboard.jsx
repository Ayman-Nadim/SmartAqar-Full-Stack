import React from 'react';
import { Users, Star, CheckCircle, TrendingUp } from 'lucide-react';

const StatsDashboard = ({ prospects, properties, matches }) => {
  const statsCards = [
    {
      title: 'Total Prospects',
      value: prospects.length,
      color: 'blue',
      icon: Users
    },
    {
      title: 'Properties',
      value: properties.length,
      color: 'green',
      icon: Star
    },
    {
      title: 'Matches Found',
      value: matches.length,
      color: 'blue',
      icon: CheckCircle
    },
    {
      title: 'Hot Prospects',
      value: prospects.filter(p => p.status === 'hot').length,
      color: 'red',
      icon: TrendingUp
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        text: 'text-blue-600',
        bg: 'bg-blue-100'
      },
      green: {
        text: 'text-green-600',
        bg: 'bg-green-100'
      },
      red: {
        text: 'text-red-600',
        bg: 'bg-red-100'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.title === 'Total Prospects' ? 'text-gray-900' : colors.text}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6 ${colors.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsDashboard;