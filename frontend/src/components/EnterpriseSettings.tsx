import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  X, 
  Shield, 
  Bell, 
  Lock, 
  Key, 
  Smartphone, 
  Mail, 
  UserCog, 
  Timer,
  Info,
  ChevronRight,
  Globe,
  Settings2,
  LayoutDashboard
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  isHeadOffice: boolean;
}

interface EnterpriseSettingsProps {
  onNavigate?: (view: string) => void;
}

type TabType = 'general' | 'security' | 'notifications';

export const EnterpriseSettings: React.FC<EnterpriseSettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  // General State
  const [organizationName, setOrganizationName] = useState('FedHub Software Solutions');
  const [organizationDescription, setOrganizationDescription] = useState('Leading provider of enterprise document management and quality systems.');
  const [organizationWebsite, setOrganizationWebsite] = useState('https://www.fedhub.com');
  const [organizationEmail, setOrganizationEmail] = useState('info@fedhub.com');
  const [organizationPhone, setOrganizationPhone] = useState('+966 11 234 5678');
  const [organizationLogo, setOrganizationLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Head Office - Riyadh',
      address: 'King Fahd Road, Al Olaya District',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      postalCode: '12211',
      phone: '+966 11 234 5678',
      email: 'headoffice@fedhub.com',
      isHeadOffice: true,
    },
    {
      id: '2',
      name: 'Innovation Hub - Jeddah',
      address: 'King Abdulaziz Road',
      city: 'Jeddah',
      country: 'Saudi Arabia',
      postalCode: '21451',
      phone: '+966 12 654 3210',
      email: 'jeddah@fedhub.com',
      isHeadOffice: false,
    }
  ]);

  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Location>({
    id: '',
    name: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    postalCode: '',
    phone: '',
    email: '',
    isHeadOffice: false,
  });

  // Security State
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [passwordRotationDays, setPasswordRotationDays] = useState('90');
  const [minPasswordLength, setMinPasswordLength] = useState('12');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipRestrictedAccess, setIpRestrictedAccess] = useState(false);
  const [auditLogRetention, setAuditLogRetention] = useState('365');

  // Notifications State
  const [emailNotifications, setEmailNotifications] = useState({
    requests: true,
    documentUpload: true,
    rejections: true,
    documentExpired: true,
    newUserCreated: true,
    securityAlerts: true
  });

  const [systemAlerts, setSystemAlerts] = useState({
    dashboardAlerts: true,
    bellNotifications: true,
    pushNotifications: false
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOrganizationLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.city) {
      setLocations([...locations, { ...newLocation, id: Date.now().toString() }]);
      setNewLocation({
        id: '',
        name: '',
        address: '',
        city: '',
        country: 'Saudi Arabia',
        postalCode: '',
        phone: '',
        email: '',
        isHeadOffice: false,
      });
      setShowAddLocation(false);
    }
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleSetHeadOffice = (id: string) => {
    setLocations(locations.map(loc => ({
      ...loc,
      isHeadOffice: loc.id === id
    })));
  };

  const handleSave = () => {
    console.log('Saving enterprise settings for tab:', activeTab);
    alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved successfully!`);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'security', label: 'Security Access', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Enterprise Settings</h1>
            <p className="text-slate-600 mt-1">
              Configure organization details, security policies, and communication preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('admin-home')}
              className="border-slate-300"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md` 
                    : `text-slate-600 hover:bg-slate-100`
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* Organization Details */}
              <Card className="p-6 bg-white shadow-md border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Organization Details</h2>
                    <p className="text-sm text-slate-500">Global identity and contact information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Organization Logo */}
                  <div className="md:col-span-2">
                    <Label htmlFor="org-logo" className="text-slate-700 font-semibold">Organization Logo</Label>
                    <div className="mt-2 flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt="Logo Preview" className="h-24 w-24 object-contain border-2 border-white shadow-sm rounded-lg p-2 bg-white" />
                          <button
                            onClick={() => {
                              setOrganizationLogo(null);
                              setLogoPreview('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-24 w-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white shadow-inner">
                          <Building2 className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="org-logo"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label htmlFor="org-logo">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                            onClick={() => document.getElementById('org-logo')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2 text-blue-600" />
                            Update Organization Logo
                          </Button>
                        </label>
                        <p className="text-xs text-slate-500 mt-2 italic">Recommended size: 512x512px. PNG or JPG (max. 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="text-slate-700 font-semibold">Organization Name *</Label>
                    <Input
                      id="org-name"
                      placeholder="Enter organization name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Organization Website */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-website" className="text-slate-700 font-semibold">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="org-website"
                        type="url"
                        placeholder="https://www.example.com"
                        value={organizationWebsite}
                        onChange={(e) => setOrganizationWebsite(e.target.value)}
                        className="bg-white border-slate-200 pl-10 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Organization Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-email" className="text-slate-700 font-semibold">Corporate Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="org-email"
                        type="email"
                        placeholder="contact@example.com"
                        value={organizationEmail}
                        onChange={(e) => setOrganizationEmail(e.target.value)}
                        className="bg-white border-slate-200 pl-10 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Organization Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-phone" className="text-slate-700 font-semibold">Corporate Phone</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="org-phone"
                        type="tel"
                        placeholder="+966 XX XXX XXXX"
                        value={organizationPhone}
                        onChange={(e) => setOrganizationPhone(e.target.value)}
                        className="bg-white border-slate-200 pl-10 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Organization Description */}
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="org-description" className="text-slate-700 font-semibold">Company Profile / Description</Label>
                    <Textarea
                      id="org-description"
                      placeholder="Enter organization description"
                      value={organizationDescription}
                      onChange={(e) => setOrganizationDescription(e.target.value)}
                      rows={4}
                      className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Locations */}
              <Card className="p-6 bg-white shadow-md border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Regional Offices</h2>
                      <p className="text-sm text-slate-500">Manage global office locations and branches</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAddLocation(!showAddLocation)}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Location
                  </Button>
                </div>

                {/* Add Location Form */}
                {showAddLocation && (
                  <div className="mb-8 p-6 border-2 border-emerald-100 rounded-2xl bg-emerald-50/30 animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-bold text-emerald-800">New Location Entry</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddLocation(false)} className="h-8 w-8 p-0 text-emerald-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="location-name">Location Name *</Label>
                        <Input
                          id="location-name"
                          placeholder="e.g., Regional Center - Jeddah"
                          value={newLocation.name}
                          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location-city">City *</Label>
                        <Input
                          id="location-city"
                          placeholder="e.g., Jeddah"
                          value={newLocation.city}
                          onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <Label htmlFor="location-address">Full Address</Label>
                        <Input
                          id="location-address"
                          placeholder="Street name, building number"
                          value={newLocation.address}
                          onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location-country">Country</Label>
                        <Input
                          id="location-country"
                          placeholder="Saudi Arabia"
                          value={newLocation.country}
                          onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location-postal">Postal Code</Label>
                        <Input
                          id="location-postal"
                          placeholder="12345"
                          value={newLocation.postalCode}
                          onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                          className="bg-white border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-emerald-100">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddLocation(false)}
                        className="text-slate-600"
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={handleAddLocation}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Save Location
                      </Button>
                    </div>
                  </div>
                )}

                {/* Locations List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all duration-200 shadow-sm group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${location.isHeadOffice ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                              <Building2 className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-slate-900 truncate">{location.name}</h3>
                            {location.isHeadOffice && (
                              <Badge className="bg-blue-600 text-white border-0 py-0.5 px-2 text-[10px] uppercase tracking-wider">
                                Head Office
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                              <p className="truncate">{location.address}, {location.city}</p>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Smartphone className="h-3.5 w-3.5" />
                                <span>{location.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{location.email || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!location.isHeadOffice && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetHeadOffice(location.id)}
                              className="text-blue-600 hover:bg-blue-50 h-8 px-2"
                              title="Set as Head Office"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLocation(location.id)}
                            className="text-red-500 hover:bg-red-50 h-8 px-2"
                            title="Remove Location"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 gap-6">
                {/* Auth Policies */}
                <Card className="p-6 bg-white shadow-md border-slate-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Authentication Policies</h2>
                      <p className="text-sm text-slate-500">Manage how users access the enterprise system</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* MFA Setting */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-purple-100 bg-purple-50/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">Multi-Factor Authentication (MFA)</h4>
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">Highly Recommended</Badge>
                        </div>
                        <p className="text-sm text-slate-500 max-w-md">Require a second verification method for all administrative and preparator accounts.</p>
                      </div>
                      <Switch 
                        checked={mfaEnabled} 
                        onCheckedChange={setMfaEnabled}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Password Rotation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-slate-400" />
                          <Label className="text-slate-700 font-semibold">Password Rotation Policy</Label>
                        </div>
                        <select 
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                          value={passwordRotationDays}
                          onChange={(e) => setPasswordRotationDays(e.target.value)}
                        >
                          <option value="30">Every 30 days</option>
                          <option value="60">Every 60 days</option>
                          <option value="90">Every 90 days</option>
                          <option value="180">Every 180 days</option>
                          <option value="0">Never (Not Recommended)</option>
                        </select>
                        <p className="text-xs text-slate-400">Forces users to change their password periodically.</p>
                      </div>

                      {/* Password Length */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <Label className="text-slate-700 font-semibold">Minimum Password Length</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            min="8" 
                            max="32"
                            value={minPasswordLength}
                            onChange={(e) => setMinPasswordLength(e.target.value)}
                            className="w-24 bg-white border-slate-200"
                          />
                          <span className="text-sm text-slate-500 font-medium">Characters</span>
                        </div>
                        <p className="text-xs text-slate-400">Longer passwords provide significantly better security.</p>
                      </div>

                      {/* Session Timeout */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-slate-400" />
                          <Label className="text-slate-700 font-semibold">Inactivity Session Timeout</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            min="5" 
                            max="480"
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-24 bg-white border-slate-200"
                          />
                          <span className="text-sm text-slate-500 font-medium">Minutes</span>
                        </div>
                        <p className="text-xs text-slate-400">Automatically logout users after a period of inactivity.</p>
                      </div>

                      {/* Audit Logs */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <Label className="text-slate-700 font-semibold">Audit Log Retention</Label>
                        </div>
                        <select 
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                          value={auditLogRetention}
                          onChange={(e) => setAuditLogRetention(e.target.value)}
                        >
                          <option value="90">90 Days</option>
                          <option value="180">180 Days</option>
                          <option value="365">1 Year</option>
                          <option value="730">2 Years</option>
                        </select>
                        <p className="text-xs text-slate-400">How long system activity logs are preserved.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Advanced Controls */}
              <Card className="p-6 bg-white shadow-md border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                    <Settings2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Advanced Access Controls</h2>
                    <p className="text-sm text-slate-500">Restricted access and integration security</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-slate-800">IP-Based Access Restriction</h4>
                        <p className="text-xs text-slate-500">Only allow access from corporate VPN or office IP ranges.</p>
                      </div>
                      <Switch 
                        checked={ipRestrictedAccess} 
                        onCheckedChange={setIpRestrictedAccess}
                      />
                    </div>
                    {ipRestrictedAccess && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Label className="text-xs font-bold text-slate-700 mb-2 block">Allowed IP Ranges (CIDR)</Label>
                        <Input placeholder="e.g. 192.168.1.1/24" className="bg-white" />
                        <p className="text-[10px] text-slate-400 mt-2 italic">Separate multiple ranges with commas.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-900">Enterprise SSO Integration</h4>
                        <p className="text-xs text-blue-800/70 leading-relaxed">
                          Integrate with Active Directory, OKTA, or Google Workspace for seamless and secure single sign-on across your organization.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-blue-700 text-xs font-bold hover:no-underline">
                          View SSO Setup Guide →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Notifications */}
                <Card className="p-6 bg-white shadow-md border-slate-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Email Notifications</h2>
                      <p className="text-sm text-slate-500">Configure automated email triggers</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="notif-requests">Requests Notification</Label>
                        <p className="text-xs text-slate-500">Notify assigned members when their action is required.</p>
                      </div>
                      <Switch 
                        id="notif-requests" 
                        checked={emailNotifications.requests}
                        onCheckedChange={(val) => setEmailNotifications({...emailNotifications, requests: val})}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="notif-upload">Document upload Notification</Label>
                        <p className="text-xs text-slate-500">Notify relevant users when a new document is uploaded to the system.</p>
                      </div>
                      <Switch 
                        id="notif-upload" 
                        checked={emailNotifications.documentUpload}
                        onCheckedChange={(val) => setEmailNotifications({...emailNotifications, documentUpload: val})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="notif-rejections">Rejections & Revisions</Label>
                        <p className="text-xs text-slate-500">Notify the preparator when a document is rejected or needs revision.</p>
                      </div>
                      <Switch 
                        id="notif-rejections" 
                        checked={emailNotifications.rejections}
                        onCheckedChange={(val) => setEmailNotifications({...emailNotifications, rejections: val})}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="notif-expiry">Document Expiry Alerts</Label>
                        <p className="text-xs text-slate-500">Send warnings before a document approval expires.</p>
                      </div>
                      <Switch 
                        id="notif-expiry" 
                        checked={emailNotifications.documentExpired}
                        onCheckedChange={(val) => setEmailNotifications({...emailNotifications, documentExpired: val})}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="notif-security">Critical Security Alerts</Label>
                        <p className="text-xs text-slate-500">Alert administrators of failed logins or policy changes.</p>
                      </div>
                      <Switch 
                        id="notif-security" 
                        checked={emailNotifications.securityAlerts}
                        onCheckedChange={(val) => setEmailNotifications({...emailNotifications, securityAlerts: val})}
                      />
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                        Customize Email Template Layout
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* System Alerts */}
                <Card className="p-6 bg-white shadow-md border-slate-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">In-App Notifications</h2>
                      <p className="text-sm text-slate-500">Configure visual alerts within the platform</p>
                    </div>
                  </div>

                  <div className="space-y-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                        <Bell className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800">Global Bell System</h4>
                          <Switch 
                            checked={systemAlerts.bellNotifications}
                            onCheckedChange={(val) => setSystemAlerts({...systemAlerts, bellNotifications: val})}
                          />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Enable the notification bell in the top header for all user roles.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                        <LayoutDashboard className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800">Dashboard Widget Alerts</h4>
                          <Switch 
                            checked={systemAlerts.dashboardAlerts}
                            onCheckedChange={(val) => setSystemAlerts({...systemAlerts, dashboardAlerts: val})}
                          />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Show important alerts directly in the dashboard statistics section.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">Notification Channels</h4>
                      <p className="text-xs text-amber-800/70 leading-relaxed">
                        Administrators can override specific user notification preferences for critical compliance and security updates.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
