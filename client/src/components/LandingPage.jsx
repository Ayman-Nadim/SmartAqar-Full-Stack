import { useState, useEffect } from "react";
import { ArrowRight, Users, Zap, Target, BarChart3, Mail, Shield, Play, Check, Menu, X } from "lucide-react";
import agent1 from "../assets/professional-real-estate-agent.png";
import agent2 from "../assets/professional-real-estate-broker.png";
import agent3 from "../assets/professional-real-estate-manager.png";
import { Link } from "react-router-dom";

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 text-center">
    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[#007bff] to-[#28a745] text-white mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, name, title, photo }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 text-center">
    {photo && <img src={photo} alt={name} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />}
    <p className="text-gray-700 italic mb-2">"{quote}"</p>
    <div className="font-semibold">{name}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </div>
);

export default function LandingPage() {
  const [visibleSections, setVisibleSections] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll("section").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const featuresData = [
    { icon: Zap, title: "Smart Property Catalogs", description: "Create detailed catalogs with advanced filtering for villas, apartments, and commercial properties." },
    { icon: Target, title: "Automated WhatsApp Prospecting", description: "Your clients automatically receive new property alerts via WhatsApp in real time." },
    { icon: Mail, title: "Campaign Management", description: "Launch targeted campaigns to showcase properties directly to interested prospects." },
    { icon: Users, title: "Prospect Database", description: "Maintain detailed profiles for better targeting and personalized communication." },
    { icon: BarChart3, title: "Analytics & Insights", description: "Track engagement, conversion rates, and campaign performance in one dashboard." },
    { icon: Shield, title: "Instant Notifications", description: "Get real-time alerts whenever a prospect shows interest or interacts with your listings." },
  ];


  const testimonialsData = [
    { quote: "SMARTAQAR’s WhatsApp automation doubled our leads in a month!", name: "Sarah Johnson", title: "CEO, Premium Properties", photo: agent1 },
    { quote: "We keep our clients instantly informed about new properties. Incredible!", name: "Michael Chen", title: "Director, Urban Realty", photo: agent2 },
    { quote: "Finally, a platform that combines CRM and instant prospect communication.", name: "Emma Rodriguez", title: "Manager, Coastal Estates", photo: agent3 },
  ];


  const pricingData = [
    { 
      plan: "Starter", 
      description: "Perfect for small agencies", 
      price: "330 DH/month", 
      features: ["Up to 50 properties", "100 prospects", "Basic automated WhatsApp alerts", "Weekly campaigns", "Email support"], 
      popular: false, 
      buttonText: "Get Started" 
    },
    { 
      plan: "Professional", 
      description: "Ideal for growing agencies", 
      price: "660 DH/month", 
      features: ["Up to 200 properties", "500 prospects", "Advanced automated WhatsApp alerts", "Daily campaigns", "Analytics & insights", "Priority support", "Custom branding"], 
      popular: true, 
      buttonText: "Get Started" 
    },
    { 
      plan: "Enterprise", 
      description: "For large agencies & networks", 
      price: "1,430 DH/month", 
      features: ["Unlimited properties", "Unlimited prospects", "AI-powered matching", "Real-time WhatsApp campaigns", "Advanced analytics", "24/7 dedicated support", "API access", "Multi-agency management"], 
      popular: false, 
      buttonText: "Contact Sales" 
    },
  ];


  return (
    <div className="font-sans">

    <header className="w-full fixed top-0 left-0 bg-white shadow z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={require("../assets/smartaqar-logo.png")} alt="SMARTAQAR Logo" className="w-14 h-14" />
          <div className="text-2xl font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent">
            SMARTAQAR
          </div>
        </div>

        {/* Centered Nav */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-6 text-blue-600">
          <a href="#features" className="font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent hover:opacity-90 transition">Product</a>
          <a href="#company" className="font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent hover:opacity-90 transition">Company</a>
          <a href="#support" className="font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent hover:opacity-90 transition">Support</a>
        </nav>


        {/* Right Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg font-semibold border-2 border-[#007bff] text-[#007bff] hover:bg-blue-50 transition-colors duration-300"
          >
            Sign In
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-[#007bff] to-[#28a745] text-white hover:opacity-90">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg w-full px-6 py-4 space-y-4 absolute top-full left-0 transition-all">
          <a href="#features" className="block hover:text-[#007bff] transition">Product</a>
          <a href="#company" className="block hover:text-[#007bff] transition">Company</a>
          <a href="#support" className="block hover:text-[#007bff] transition">Support</a>
          <a href="#signin" className="block hover:text-[#007bff] transition">Sign In</a>
          <Button className="w-full bg-gradient-to-r from-[#007bff] to-[#28a745] text-white hover:opacity-90">Get Started</Button>
        </div>
      )}
    </header>


      {/* Hero */}
     <section
        id="hero"
        className={`relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-blue-100 to-green-50 pt-28 transition-all duration-1000 ${
          visibleSections.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
  <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 px-6 relative">
    <div className="flex-1 space-y-6">
      <h1 className="text-5xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-[#007bff] via-[#00c2ff] to-[#28a745] bg-clip-text text-transparent">
        Upload your data and let our platform connect the right properties to the right prospects automatically.
      </h1>
      <p className="text-xl text-gray-700">
        Save time and boost conversions: SMARTAQAR automatically shares the perfect property with each prospect via WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/register">
          <Button className="bg-gradient-to-r from-[#007bff] to-[#28a745] text-white hover:opacity-90 flex items-center gap-2">
            Start Free Trial <ArrowRight className="w-5 h-5"/>
          </Button>
        </Link>
        <Button className="border-2 border-[#007bff] text-[#007bff] hover:bg-blue-50 flex items-center justify-center gap-2">
          <Play className="w-5 h-5"/> Schedule Demo
        </Button>
      </div>
    </div>

    <div className="flex-1 p-1 rounded-xl bg-gradient-to-r from-[#28a745] to-[#007bff] relative">
      <img
        src={require("../assets/modern-real-estate-office.png")}
        alt="SMARTAQAR Dashboard"
        className="rounded-xl w-full shadow-2xl"
      />
    </div>
    {/* Floating WhatsApp logo */}
    <div className="absolute bottom-[-100px] left-0 w-[180px] h-[180px] bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-slide-in">
      <img src={require("../assets/whatsapp-logo.png")} alt="WhatsApp" className="w-[140px] h-[140px]"/>
    </div>

  </div>
</section>


      {/* Trusted by Real Estate Professionals */}
      <section id="trusted" className={`py-20 bg-gray-100 transition-all duration-1000 ${visibleSections.trusted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Built for Real Estate Success</h2>
          <p className="text-center text-gray-700 mb-12">Explore our platform across all property categories</p>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            {/* Luxury Villa Properties */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 text-center">
              <img src={require("../assets/luxury-villa-pool-garden.jpg")} alt="Luxury Villa" className="w-full h-64 object-cover rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Luxury Villas</h3>
                <p className="text-gray-600">Premium residential properties</p>
              </div>
            </div>

            {/* Modern Apartments */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 text-center">
              <img src={require("../assets/modern-apartment-balconies.jpeg")} alt="Modern Apartments" className="w-full h-64 object-cover rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Modern Apartments</h3>
                <p className="text-gray-600">Urban living solutions</p>
              </div>
            </div>

            {/* Commercial Properties */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 text-center">
              <img src={require("../assets/retail-space-glass.jpg")} alt="Commercial Properties" className="w-full h-64 object-cover rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Commercial Properties</h3>
                <p className="text-gray-600">Top spaces for your business needs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 bg-white transition-all duration-1000 ${visibleSections.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Prospect Effectively</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((f, i) => <Card key={i} {...f}/>)}
          </div>
        </div>
      </section>

      {/* WhatsApp Automation */}
      <section
        id="whatsapp"
        className={`py-10 bg-gradient-to-r from-[#007bff] to-[#28a745] text-white transition-all duration-1000 ${
          visibleSections.whatsapp ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold">
              Automatically Prospect Your Clients via WhatsApp
            </h2>
            <p className="text-lg lg:text-xl text-white/90">
              SMARTAQAR sends real-time updates directly to your clients' WhatsApp whenever new properties are available. Keep your clients informed and engaged without lifting a finger!
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white" />
                Automatic alerts for new properties
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white" />
                Personalized messages based on client preferences
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white" />
                Increase engagement and conversion rates
              </li>
            </ul>
            <Button className="mt-6 bg-white text-[#007bff] font-bold hover:opacity-90">
              See How It Works
            </Button>
          </div>
          <div className="flex-1 flex justify-center gap-4">
            <img
              src={require("../assets/screenshoot01.jpeg")}
              alt="WhatsApp Automation"
              className="rounded-xl shadow-2xl w-full max-w-xs h-100 object-cover"
            />
            <img
              src={require("../assets/screenshoot02.jpeg")}
              alt="WhatsApp Automation"
              className="rounded-xl shadow-2xl w-full max-w-xs h-100 object-cover"
            />
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section id="testimonials" className={`py-20 bg-gray-50 transition-all duration-1000 ${visibleSections.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((t, i) => <TestimonialCard key={i} {...t}/>)}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={`py-20 bg-gradient-to-br from-blue-50 to-green-50 transition-all duration-1000 ${visibleSections.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-800">Simple, Transparent Pricing</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-10">
            {pricingData.map((p, i) => (
              <div key={i} className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 p-8 flex flex-col">
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#007bff] to-[#28a745] text-white font-bold rounded-full text-sm shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{p.plan}</h3>
                <p className="text-gray-600 mb-4">{p.description}</p>
                <div className="text-3xl font-extrabold text-gray-800 mb-6">{p.price}</div>
                <ul className="space-y-3 mb-6 flex-1">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0"/>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full py-3 mt-auto bg-gradient-to-r from-[#007bff] to-[#28a745] text-white font-bold text-lg hover:scale-105 transition-transform duration-300">
                    {p.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-12 mt-12 text-center">
        <p>© 2025 SMARTAQAR. All rights reserved.</p>
      </footer>

    </div>
  );
}
