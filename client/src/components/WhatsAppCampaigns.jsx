import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Image,
  FileText,
  Target,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const WhatsAppCampaigns = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: "1",
      name: "Luxury Villa Promotion",
      status: "active",
      type: "property_showcase",
      target_audience: "high_budget",
      prospects_count: 45,
      sent_count: 42,
      delivered_count: 40,
      read_count: 35,
      replied_count: 8,
      property_id: "1",
      property_title: "Luxury Villa with Pool",
      created_date: "2024-03-01",
      launch_date: "2024-03-02",
      end_date: "2024-03-15",
      message_template: "🏡 Découvrez cette magnifique villa de luxe avec piscine à Casablanca! Prix: 2,500,000 DH. Contactez-nous pour une visite: +212600123456",
      includes_media: true,
      success_rate: 19.0
    },
    {
      id: "2",
      name: "Apartment Weekend Special",
      status: "completed",
      type: "promotional",
      target_audience: "medium_budget",
      prospects_count: 78,
      sent_count: 75,
      delivered_count: 73,
      read_count: 65,
      replied_count: 12,
      property_id: "2",
      property_title: "Modern Apartment Downtown",
      created_date: "2024-02-15",
      launch_date: "2024-02-18",
      end_date: "2024-02-25",
      message_template: "🏢 Offre spéciale week-end! Appartement moderne au centre-ville de Rabat. Prix exceptionnel: 850,000 DH. Visitez ce week-end!",
      includes_media: false,
      success_rate: 16.0
    },
    {
      id: "3",
      name: "Commercial Space Alert",
      status: "draft",
      type: "new_listing",
      target_audience: "commercial",
      prospects_count: 25,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      replied_count: 0,
      property_id: "3",
      property_title: "Commercial Office Space",
      created_date: "2024-03-10",
      launch_date: null,
      end_date: null,
      message_template: "🏢 NOUVEAU! Espace commercial premium à Marrakech, idéal pour restaurant. 200m², parking inclus. Prix: 1,200,000 DH",
      includes_media: true,
      success_rate: 0
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.property_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <FileText className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'property_showcase': return 'text-purple-600 bg-purple-100';
      case 'promotional': return 'text-orange-600 bg-orange-100';
      case 'new_listing': return 'text-blue-600 bg-blue-100';
      case 'follow_up': return 'text-cyan-600 bg-cyan-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateEngagementRate = (campaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.replied_count / campaign.sent_count) * 100).toFixed(1);
  };

  const calculateDeliveryRate = (campaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}

    </div>
  );
};

export default WhatsAppCampaigns;