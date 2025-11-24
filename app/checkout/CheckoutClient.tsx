'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { State, City, ICity } from 'country-state-city';
import { useCartStore } from '@/store/useCartStore';
import { Header } from '@/components/organisms/Header';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CheckoutClient() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'cash'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [selectedBank, setSelectedBank] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zipCodeMessage, setZipCodeMessage] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const departments = State.getStatesOfCountry('CO');
  const [cities, setCities] = useState<ICity[]>([]);

  const getLocationFromZipCode = (zipCode: string) => {
    const zip = zipCode.trim();
    if (zip.length !== 6 || !/^\d{6}$/.test(zip)) {
      return null;
    }

    const zipMapping: Record<string, { deptCode: string; cityName: string }> = {
      '11': { deptCode: 'DC', cityName: 'Bogotá' },
      '05': { deptCode: 'ANT', cityName: 'Medellín' },
      '76': { deptCode: 'VAC', cityName: 'Cali' },
      '08': { deptCode: 'ATL', cityName: 'Barranquilla' },
      '13': { deptCode: 'BOL', cityName: 'Cartagena' },
      '68': { deptCode: 'SAN', cityName: 'Bucaramanga' },
      '54': { deptCode: 'NSA', cityName: 'Cúcuta' },
      '66': { deptCode: 'RIS', cityName: 'Pereira' },
      '17': { deptCode: 'CAL', cityName: 'Manizales' },
      '63': { deptCode: 'QUI', cityName: 'Armenia' },
      '73': { deptCode: 'TOL', cityName: 'Ibagué' },
      '20': { deptCode: 'CES', cityName: 'Valledupar' },
      '47': { deptCode: 'MAG', cityName: 'Santa Marta' },
      '19': { deptCode: 'CAU', cityName: 'Popayán' },
      '52': { deptCode: 'NAR', cityName: 'Pasto' },
      '15': { deptCode: 'BOY', cityName: 'Tunja' },
      '25': { deptCode: 'CUN', cityName: 'Chía' },
      '41': { deptCode: 'HUI', cityName: 'Neiva' },
      '23': { deptCode: 'COR', cityName: 'Montería' },
      '50': { deptCode: 'MET', cityName: 'Villavicencio' },
    };

    const prefix = zip.substring(0, 2);
    return zipMapping[prefix] || null;
  };

  useEffect(() => {
    if (formData.department) {
      const selectedDept = departments.find(d => d.isoCode === formData.department);
      if (selectedDept) {
        const departmentCities = City.getCitiesOfState('CO', selectedDept.isoCode);
        setCities(departmentCities);
      }
    } else {
      setCities([]);
    }
  }, [formData.department]);

  useEffect(() => {
    detectUserLocation();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setFormData(prev => ({ ...prev, zipCode: value }));
    setZipCodeMessage('');

    if (value.length === 6) {
      const location = getLocationFromZipCode(value);
      if (location) {
        setFormData(prev => ({
          ...prev,
          zipCode: value,
          department: location.deptCode,
          city: location.cityName
        }));
        setZipCodeMessage(`✓ Ubicación detectada: ${location.cityName}`);

        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.department;
          delete newErrors.city;
          return newErrors;
        });
      } else {
        setZipCodeMessage('Código postal no reconocido. Por favor selecciona tu ubicación manualmente.');
      }
    }
  };

  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      setZipCodeMessage('❌ Tu navegador no soporta geolocalización');
      return;
    }

    setIsDetectingLocation(true);
    setZipCodeMessage('📍 Solicitando tu ubicación...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setZipCodeMessage('🔍 Buscando tu dirección...');

          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'MercadoLibre-Clone/1.0'
              }
            }
          );

          if (!response.ok) {
            throw new Error('No se pudo obtener la dirección');
          }

          const data = await response.json();
          const address = data.address;

          const cityName = address.city || address.town || address.village || address.municipality || '';
          const state = address.state || '';
          const postcode = address.postcode || '';
          const road = address.road || '';
          const houseNumber = address.house_number || '';
        
          const matchedDepartment = departments.find(d =>
            d.name.toLowerCase().includes(state.toLowerCase()) ||
            state.toLowerCase().includes(d.name.toLowerCase())
          );

          if (!matchedDepartment) {
            setZipCodeMessage('❌ No se pudo identificar el departamento. Completa manualmente.');
            setIsDetectingLocation(false);
            return;
          }

          const departmentCities = City.getCitiesOfState('CO', matchedDepartment.isoCode);
          setCities(departmentCities);

          const matchedCity = departmentCities.find(c =>
            c.name.toLowerCase() === cityName.toLowerCase() ||
            cityName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(cityName.toLowerCase())
          );

          setFormData(prev => ({
            ...prev,
            zipCode: postcode,
            department: matchedDepartment.isoCode,
            city: matchedCity ? matchedCity.name : cityName,
            address: `${road} ${houseNumber}`.trim() || prev.address
          }));

          setZipCodeMessage(`✓ Ubicación detectada: ${matchedCity ? matchedCity.name : cityName}, ${matchedDepartment.name}`);
          setIsDetectingLocation(false);

          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.department;
            delete newErrors.city;
            delete newErrors.address;
            return newErrors;
          });
        } catch (error) {
          console.error('Error getting address:', error);
          setZipCodeMessage('❌ No se pudo obtener tu dirección. Intenta manualmente.');
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let errorMessage = '❌ ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage += 'Tiempo de espera agotado';
            break;
          default:
            errorMessage += 'Error al obtener ubicación';
        }
        setZipCodeMessage(errorMessage);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substring(0, 5);
    }
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'El departamento es requerido';
    }

    if (paymentMethod === 'card') {
      if (!cardData.number.replace(/\s/g, '')) {
        newErrors.cardNumber = 'El número de tarjeta es requerido';
      } else if (cardData.number.replace(/\s/g, '').length < 15) {
        newErrors.cardNumber = 'Número de tarjeta inválido';
      }
      if (!cardData.name.trim()) {
        newErrors.cardName = 'El nombre del titular es requerido';
      }
      if (!cardData.expiry) {
        newErrors.cardExpiry = 'La fecha de vencimiento es requerida';
      } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        newErrors.cardExpiry = 'Formato inválido (MM/YY)';
      }
      if (!cardData.cvv) {
        newErrors.cardCvv = 'El CVV es requerido';
      } else if (cardData.cvv.length < 3) {
        newErrors.cardCvv = 'CVV inválido';
      }
    } else if (paymentMethod === 'pse') {
      if (!selectedBank) {
        newErrors.bank = 'Debes seleccionar un banco';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [processingStep, setProcessingStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    setProcessingStep(1);
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep(2);
    await new Promise(resolve => setTimeout(resolve, 1200));

    setProcessingStep(3);
    await new Promise(resolve => setTimeout(resolve, 800));

    clearCart();
    router.push('/checkout/success');
  };

  if (isProcessing) {
    const steps = [
      { id: 1, text: 'Verificando información', icon: '📋' },
      { id: 2, text: 'Procesando pago', icon: '💳' },
      { id: 3, text: 'Confirmando pedido', icon: '✅' }
    ];

    return (
      <>
        <Header onSearch={handleSearch} />
        <main className="bg-gray-50 min-h-screen flex items-center justify-center py-12">
          <div className="max-w-2xl w-full mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              {/* Animated logo/icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-ml-yellow rounded-full flex items-center justify-center animate-pulse">
                    <ShoppingBag size={40} className="text-gray-900" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-ml-yellow rounded-full animate-ping opacity-20"></div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
                Procesando tu compra
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Por favor espera mientras confirmamos tu pedido
              </p>

              {/* Progress steps */}
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                      processingStep >= step.id
                        ? 'bg-green-50 border-2 border-green-500'
                        : processingStep === step.id - 1
                        ? 'bg-blue-50 border-2 border-blue-300 animate-pulse'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div
                      className={`text-3xl transition-transform duration-500 ${
                        processingStep >= step.id ? 'scale-110' : 'scale-100'
                      }`}
                    >
                      {processingStep > step.id ? '✅' : step.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          processingStep >= step.id
                            ? 'text-green-700'
                            : processingStep === step.id - 1
                            ? 'text-blue-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.text}
                      </p>
                      {processingStep === step.id && (
                        <p className="text-sm text-blue-600 mt-1">
                          En progreso...
                        </p>
                      )}
                      {processingStep > step.id && (
                        <p className="text-sm text-green-600 mt-1">
                          Completado
                        </p>
                      )}
                    </div>
                    {processingStep === step.id && (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                    {processingStep > step.id && (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${(processingStep / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {Math.round((processingStep / 3) * 100)}% completado
                </p>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                No cierres esta ventana ni presiones el botón de retroceso
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <main className="bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg p-12 text-center">
              <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                No hay productos en el carrito
              </h1>
              <p className="text-gray-600 mb-6">
                Agrega productos a tu carrito antes de continuar al checkout
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <ArrowLeft size={20} />
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Carrito', href: '/cart' },
              { label: 'Checkout' },
            ]}
          />

          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">
            Finalizar compra
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Información de entrega
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Auto-detect location status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          Detección automática de ubicación
                        </h3>
                        {zipCodeMessage ? (
                          <p className={`text-sm ${zipCodeMessage.startsWith('✓') ? 'text-green-600 font-medium' : zipCodeMessage.startsWith('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                            {zipCodeMessage}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-600">
                            Detectando tu ubicación para llenar automáticamente los campos...
                          </p>
                        )}
                        {zipCodeMessage?.startsWith('❌') && (
                          <button
                            type="button"
                            onClick={detectUserLocation}
                            disabled={isDetectingLocation}
                            className="mt-2 text-sm text-primary hover:underline disabled:opacity-50"
                          >
                            Intentar de nuevo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manual input option */}
                  <div className="text-center text-sm text-gray-600">
                    <span>O completa tu información manualmente</span>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="110111 (6 dígitos)"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="juan@ejemplo.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="300 123 4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Calle 123 #45-67"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento *
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, department: e.target.value, city: '' }));
                          if (errors.department) {
                            setErrors(prev => ({ ...prev, department: '' }));
                          }
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.department ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar departamento</option>
                        {departments.map((dept) => (
                          <option key={dept.isoCode} value={dept.isoCode}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, city: e.target.value }));
                          if (errors.city) {
                            setErrors(prev => ({ ...prev, city: '' }));
                          }
                        }}
                        disabled={!formData.department}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        } ${!formData.department ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      >
                        <option value="">
                          {formData.department ? 'Seleccionar ciudad' : 'Primero selecciona un departamento'}
                        </option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Método de pago
                </h2>

                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-primary' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'card' && (
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Tarjeta de crédito o débito</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      </div>
                      <div className="flex gap-1">
                        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="3" fill="#1434CB"/>
                          <circle cx="12" cy="10" r="5" fill="#EB001B"/>
                          <circle cx="20" cy="10" r="5" fill="#F79E1B"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('pse')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'pse' ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'pse' ? 'border-primary' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'pse' && (
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">PSE</p>
                        <p className="text-sm text-gray-600">Pago desde tu cuenta bancaria</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'cash' ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cash' ? 'border-primary' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'cash' && (
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Efectivo</p>
                        <p className="text-sm text-gray-600">Paga al recibir tu pedido</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de tarjeta *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del titular *
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        name="name"
                        value={cardData.name}
                        onChange={handleCardInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="JUAN PEREZ"
                      />
                      {errors.cardName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Vencimiento *
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          name="expiry"
                          value={cardData.expiry}
                          onChange={handleCardInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                        />
                        {errors.cardExpiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cardCvv"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.cardCvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                        />
                        {errors.cardCvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardCvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PSE Bank Selection */}
                {paymentMethod === 'pse' && (
                  <div className="border-t pt-4">
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">
                      Selecciona tu banco *
                    </label>
                    <select
                      id="bank"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.bank ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar banco</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="davivienda">Davivienda</option>
                      <option value="bbva">BBVA</option>
                      <option value="banco_bogota">Banco de Bogotá</option>
                      <option value="banco_popular">Banco Popular</option>
                      <option value="colpatria">Scotiabank Colpatria</option>
                      <option value="occidente">Banco de Occidente</option>
                      <option value="av_villas">Banco AV Villas</option>
                      <option value="banco_caja_social">Banco Caja Social</option>
                      <option value="nequi">Nequi</option>
                      <option value="daviplata">Daviplata</option>
                    </select>
                    {errors.bank && (
                      <p className="mt-1 text-sm text-red-600">{errors.bank}</p>
                    )}
                  </div>
                )}

                {/* Cash Payment Info */}
                {paymentMethod === 'cash' && (
                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Instrucciones de pago</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Prepara el monto exacto: ${total.toLocaleString('es-AR')} COP</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Paga al recibir tu pedido en la puerta de tu casa</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>El repartidor te entregará tu comprobante de compra</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Resumen del pedido
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.product.thumbnail || '/placeholder.png'}
                          alt={item.product.title}
                          fill
                          sizes="64px"
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toLocaleString('es-AR')} COP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${total.toLocaleString('es-AR')} COP</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    ${total.toLocaleString('es-AR')} COP
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-ml-yellow text-gray-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar compra'}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Compra protegida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
