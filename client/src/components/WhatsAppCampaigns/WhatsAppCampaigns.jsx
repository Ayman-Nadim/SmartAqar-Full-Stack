import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader } from 'lucide-react';
import StatsDashboard from './StatsDashboard';
import BulkMessagePanel from './BulkMessagePanel';
import ProspectsList from './ProspectsList';

const WhatsAppCampaigns = () => {
  // States for data
  const [prospects, setProspects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // States for UI
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('property_match');
  const [sendingBulk, setSendingBulk] = useState(false);

  // Message templates
  const messageTemplates = [
    {
      id: 'property_match',
      name: 'Property Match',
      message: `Hello {{prospectName}},

I found a perfect property that matches your preferences:

🏡 {{propertyTitle}}
📍 {{propertyLocation}}
💰 {{propertyPrice}} DH
🛏️ {{bedrooms}} bedrooms, 🚿 {{bathrooms}} bathrooms
📐 {{area}} m²

This property fits your budget and preferences. Would you like to schedule a viewing?

Best regards,
Your Real Estate Agent`
    },
    {
      id: 'bulk_update',
      name: 'Bulk Property Update',
      message: `Hello {{prospectName}},

🏠 NEW PROPERTIES ALERT!

We have {{propertyCount}} new properties that match your criteria:
• Budget range: {{budgetRange}} DH
• Preferred locations: {{locations}}
• Property types: {{propertyTypes}}

Reply "YES" to receive the full list with photos and details.

Best regards,
Your Real Estate Agent`
    },
    {
      id: 'market_update',
      name: 'Market Update',
      message: `Hello {{prospectName}},

📈 MARKET UPDATE

Current real estate trends in your preferred areas:
• Average prices are stable
• New inventory available
• Best time to buy/invest

We have properties matching your {{budgetRange}} DH budget in {{locations}}.

Contact us for personalized recommendations!

Best regards,
Your Real Estate Agent`
    }
  ];

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('smartaquar_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // API functions
  const fetchProspects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/prospects', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.prospects || data.data || [];
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error loading prospects:', error);
      return [
        {
          _id: '1',
          name: 'Ahmed El Mansouri',
          email: 'ahmed@email.com',
          phone: '+212612345678',
          status: 'hot',
          preferences: {
            budget: { min: 800000, max: 1200000 },
            propertyTypes: ['apartment', 'villa'],
            locations: ['Casablanca', 'Rabat'],
            bedrooms: 3,
            bathrooms: 2,
            area: { min: 100, max: 150 },
            features: ['Swimming Pool', 'Garage']
          }
        },
        {
          _id: '2',
          name: 'Fatima Benali',
          email: 'fatima@email.com',
          phone: '+212623456789',
          status: 'warm',
          preferences: {
            budget: { min: 500000, max: 800000 },
            propertyTypes: ['apartment'],
            locations: ['Marrakech'],
            bedrooms: 2,
            bathrooms: 1,
            area: { min: 80, max: 120 },
            features: ['Balcony']
          }
        }
      ];
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/properties', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.properties || data.data || [];
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      return [
        {
          _id: 'p1',
          title: 'Modern Villa with Pool',
          type: 'villa',
          price: 950000,
          location: 'Casablanca Marina',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          status: 'available',
          features: ['Swimming Pool', 'Garage', 'Garden']
        },
        {
          _id: 'p2',
          title: 'Downtown Apartment',
          type: 'apartment',
          price: 650000,
          location: 'Marrakech Center',
          bedrooms: 2,
          bathrooms: 1,
          area: 95,
          status: 'available',
          features: ['Balcony', 'Modern Design']
        }
      ];
    }
  };

  // Simplified matching algorithm
  const findMatches = (prospects, properties) => {
    const matchesFound = [];
    
    prospects.forEach(prospect => {
      properties.forEach(property => {
        let score = 0;
        
        // Quick scoring
        const budgetMin = prospect.preferences?.budget?.min || 0;
        const budgetMax = prospect.preferences?.budget?.max || Infinity;
        
        if (property.price >= budgetMin && property.price <= budgetMax) score += 40;
        if (prospect.preferences?.propertyTypes?.includes(property.type)) score += 30;
        if (prospect.preferences?.locations?.some(loc => 
          property.location.toLowerCase().includes(loc.toLowerCase()))) score += 20;
        if (property.bedrooms >= (prospect.preferences?.bedrooms || 0)) score += 10;
        
        if (score >= 50) {
          matchesFound.push({
            id: `${prospect._id}-${property._id}`,
            prospect,
            property,
            score
          });
        }
      });
    });
    
    return matchesFound.sort((a, b) => b.score - a.score);
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prospectsData, propertiesData] = await Promise.all([
          fetchProspects(),
          fetchProperties()
        ]);
        
        setProspects(prospectsData);
        setProperties(propertiesData);
        setMatches(findMatches(prospectsData, propertiesData));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Format functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' DH';
  };

  // Bulk personalization
  const personalizeBulkMessage = (template, prospect, matchingProperties) => {
    let message = template;
    
    message = message.replace(/{{prospectName}}/g, prospect.name);
    message = message.replace(/{{propertyCount}}/g, matchingProperties.length.toString());
    message = message.replace(/{{budgetRange}}/g, 
      `${formatPrice(prospect.preferences?.budget?.min || 0)} - ${formatPrice(prospect.preferences?.budget?.max || 0)}`
    );
    message = message.replace(/{{locations}}/g, prospect.preferences?.locations?.join(', ') || 'Various locations');
    message = message.replace(/{{propertyTypes}}/g, prospect.preferences?.propertyTypes?.join(', ') || 'All types');
    
    return message;
  };

  // Individual message personalization
  const personalizeIndividualMessage = (template, match) => {
    let message = template;
    const { prospect, property } = match;
    
    message = message.replace(/{{prospectName}}/g, prospect.name);
    message = message.replace(/{{propertyTitle}}/g, property.title);
    message = message.replace(/{{propertyLocation}}/g, property.location);
    message = message.replace(/{{propertyPrice}}/g, formatPrice(property.price));
    message = message.replace(/{{bedrooms}}/g, property.bedrooms.toString());
    message = message.replace(/{{bathrooms}}/g, property.bathrooms.toString());
    message = message.replace(/{{area}}/g, property.area.toString());
    
    return message;
  };

  // Send bulk messages
  const sendBulkMessages = async () => {
    setSendingBulk(true);
    
    try {
      const template = messageTemplates.find(t => t.id === selectedTemplate);
      if (!template) return;

      let sentCount = 0;
      
      for (const prospect of prospects) {
        // Get matching properties for this prospect
        const prospectMatches = matches.filter(m => m.prospect._id === prospect._id);
        
        if (prospectMatches.length > 0) {
          let personalizedMessage;
          
          if (selectedTemplate === 'property_match' && prospectMatches.length > 0) {
            // Send best match for individual property messages
            personalizedMessage = personalizeIndividualMessage(template.message, prospectMatches[0]);
          } else {
            // Send bulk message
            personalizedMessage = personalizeBulkMessage(template.message, prospect, prospectMatches);
          }
          
          // Format phone number and create WhatsApp URL
          const phoneNumber = prospect.phone.replace(/\D/g, '');
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
          
          // Open WhatsApp (in real app, you'd queue these or use WhatsApp Business API)
          window.open(whatsappUrl, '_blank');
          sentCount++;
          
          // Small delay between messages
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      alert(`Messages sent to ${sentCount} prospects!`);
      
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      alert('Error sending messages. Please try again.');
    } finally {
      setSendingBulk(false);
    }
  };

  // Send to specific prospect
  const sendToProspect = (prospect) => {
    const template = messageTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const prospectMatches = matches.filter(m => m.prospect._id === prospect._id);
    
    let personalizedMessage;
    if (selectedTemplate === 'property_match' && prospectMatches.length > 0) {
      personalizedMessage = personalizeIndividualMessage(template.message, prospectMatches[0]);
    } else {
      personalizedMessage = personalizeBulkMessage(template.message, prospect, prospectMatches);
    }
    
    const phoneNumber = prospect.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading prospects and properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent">
                WhatsApp Bulk Sender
              </div>
              <p className="text-gray-600">Send personalized messages to all your prospects at once</p>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard 
          prospects={prospects}
          properties={properties}
          matches={matches}
        />

        {/* Bulk Message Panel */}
        <BulkMessagePanel 
          messageTemplates={messageTemplates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          sendBulkMessages={sendBulkMessages}
          sendingBulk={sendingBulk}
          prospectsCount={prospects.length}
        />

        {/* Prospects List */}
        <ProspectsList 
          prospects={prospects}
          matches={matches}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sendToProspect={sendToProspect}
        />
      </div>
    </div>
  );
};

export default WhatsAppCampaigns;